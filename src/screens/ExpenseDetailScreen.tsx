import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { deleteExpense, getExpense } from '../db/expenses';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { Expense } from '../types/models';
import { formatDisplayDate, formatRecorded } from '../utils/dates';
import { formatMoney } from '../utils/money';

export function ExpenseDetailScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExpenseDetail'>>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadExpense = useCallback(() => {
    let active = true;
    setLoading(true);
    getExpense(db, route.params.expenseId)
      .then((row) => {
        if (!active) {
          return;
        }
        setExpense(row);
        setMissing(row === null);
        setError('');
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load this expense.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [db, route.params.expenseId]);

  useFocusEffect(loadExpense);

  function confirmDelete() {
    if (!expense) {
      return;
    }

    Alert.alert('Delete expense', `Remove “${expense.title}” from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDeleting(true);
          deleteExpense(db, expense.id)
            .then(() => navigation.goBack())
            .catch((deleteError: unknown) => {
              setDeleting(false);
              setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this expense.');
            });
        },
      },
    ]);
  }

  if (loading && !expense) {
    return <ActivityIndicator color={colors.brand} style={styles.loader} />;
  }

  if (missing || !expense) {
    return (
      <View style={styles.content}>
        <EmptyState title="Expense not found" message="It may already have been deleted from the local database." />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: expense.categoryColor }]}>
          <Text style={styles.badgeText}>{expense.categoryName}</Text>
        </View>
        <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
        <Text style={styles.title}>{expense.title}</Text>
      </View>

      <View style={styles.card}>
        <DetailRow label="Date" value={formatDisplayDate(expense.spentOn)} />
        <DetailRow label="Payment" value={expense.paymentMethod} />
        <DetailRow label="Recorded" value={formatRecorded(expense.createdAt)} />
        <DetailRow label="Note" value={expense.note.trim() ? expense.note : 'No note added.'} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Edit expense"
        onPress={() => navigation.navigate('ExpenseForm', { expenseId: expense.id })}
      />
      <PrimaryButton label="Delete expense" variant="danger" loading={deleting} onPress={confirmDelete} />
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 32,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFCF8',
    fontSize: 13,
    fontWeight: '700',
  },
  amount: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '700',
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingVertical: 14,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  rowValue: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});

import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ExpenseRow } from '../components/ExpenseRow';
import { listCategories } from '../db/categories';
import { listExpenses } from '../db/expenses';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { PAYMENT_METHODS, type Category, type Expense, type PaymentMethod } from '../types/models';
import { periodRange, type Period } from '../utils/dates';

type ExpensesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Expenses'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'This month' },
];

export function ExpensesScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<ExpensesNavigation>();
  const route = useRoute<RouteProp<MainTabParamList, 'Expenses'>>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [period, setPeriod] = useState<Period>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.categoryId) {
      setCategoryId(route.params.categoryId);
      setPeriod('all');
    }
  }, [route.params?.categoryId]);

  useEffect(() => {
    let active = true;
    listCategories(db)
      .then((rows) => {
        if (active) {
          setCategories(rows);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load categories.');
        }
      });
    return () => {
      active = false;
    };
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const range = periodRange(period);
      setLoading(true);
      listExpenses(db, {
        query,
        categoryId,
        paymentMethod,
        fromDate: range?.from,
        toDate: range?.to,
      })
        .then((rows) => {
          if (active) {
            setExpenses(rows);
            setError('');
          }
        })
        .catch((loadError: unknown) => {
          if (active) {
            setError(loadError instanceof Error ? loadError.message : 'Could not load expenses.');
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
    }, [db, query, categoryId, paymentMethod, period]),
  );

  const selectedCategory = categories.find((category) => category.id === categoryId);

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <TextInput
          accessibilityLabel="Search expenses"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Search title, note, or category"
          placeholderTextColor={colors.muted}
          style={styles.search}
          value={query}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {PERIODS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={period === item.id}
              onPress={() => setPeriod(item.id)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All categories" selected={categoryId === null} onPress={() => setCategoryId(null)} />
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              color={category.color}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All payments" selected={paymentMethod === null} onPress={() => setPaymentMethod(null)} />
          {PAYMENT_METHODS.map((method) => (
            <Chip
              key={method}
              label={method}
              selected={paymentMethod === method}
              onPress={() => setPaymentMethod(method)}
            />
          ))}
        </ScrollView>

        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {loading ? 'Loading expenses' : `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}`}
            {selectedCategory ? ` in ${selectedCategory.name}` : ''}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('ExpenseForm')}
          >
            <Text style={styles.add}>Add</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {loading && expenses.length === 0 ? (
        <ActivityIndicator color={colors.brand} style={styles.loader} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <EmptyState
              title="No matching expenses"
              message="Change the search or filters, or add a new expense."
            />
          }
          renderItem={({ item }) => (
            <ExpenseRow
              expense={item}
              onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filters: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  resultText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  add: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  loader: {
    marginTop: 24,
  },
  list: {
    gap: 10,
    padding: 20,
    paddingTop: 12,
  },
});

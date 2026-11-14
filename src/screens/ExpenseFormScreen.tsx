
import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { listCategories } from '../db/categories';
import { createExpense, getExpense, updateExpense } from '../db/expenses';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import {
  PAYMENT_METHODS,
  type Category,
  type PaymentMethod,
} from '../types/models';
import { isValidISODate, todayISO } from '../utils/dates';
import { parseAmount } from '../utils/money';

type Draft = {
  title: string;
  amount: string;
  categoryId: number | null;
  spentOn: string;
  paymentMethod: PaymentMethod | null;
  note: string;
};

const EMPTY_DRAFT: Draft = {
  title: '',
  amount: '',
  categoryId: null,
  spentOn: todayISO(),
  paymentMethod: null,
  note: '',
};

export function ExpenseFormScreen() {
  const db = useSQLiteContext();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute<RouteProp<RootStackParamList, 'ExpenseForm'>>();
  const expenseId = route.params?.expenseId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(expenseId));
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: expenseId ? 'Edit expense' : 'New expense',
    });
  }, [navigation, expenseId]);

  useEffect(() => {
    let active = true;

    listCategories(db)
      .then((rows) => {
        if (active) {
          setCategories(rows);
        }
      })
      .catch(() => {
        if (active) {
          setErrors(['Could not load categories from the local database.']);
        }
      });

    return () => {
      active = false;
    };
  }, [db]);

  useEffect(() => {
    if (!expenseId) {
      return;
    }

    let active = true;

    getExpense(db, expenseId)
      .then((expense) => {
        if (!active) {
          return;
        }

        if (!expense) {
          setMissing(true);
          return;
        }

        setDraft({
          title: expense.title,
          amount: expense.amount.toFixed(2),
          categoryId: expense.categoryId,
          spentOn: expense.spentOn,
          paymentMethod: expense.paymentMethod,
          note: expense.note,
        });
      })
      .catch(() => {
        if (active) {
          setErrors(['Could not load this expense.']);
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
  }, [db, expenseId]);

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validate(): string[] {
    const nextErrors: string[] = [];

    if (!draft.title.trim()) {
      nextErrors.push('Enter a title.');
    } else if (draft.title.trim().length > 80) {
      nextErrors.push('Keep the title to 80 characters or fewer.');
    }

    if (parseAmount(draft.amount) === null) {
      nextErrors.push(
        'Enter an amount greater than zero, up to 999,999.99.',
      );
    }

    if (!draft.categoryId) {
      nextErrors.push('Choose a category.');
    }

    if (!isValidISODate(draft.spentOn)) {
      nextErrors.push('Enter a real date as YYYY-MM-DD.');
    }

    if (!draft.paymentMethod) {
      nextErrors.push('Choose a payment method.');
    }

    if (draft.note.trim().length > 240) {
      nextErrors.push('Keep the note to 240 characters or fewer.');
    }

    return nextErrors;
  }

  async function save() {
    const nextErrors = validate();

    setErrors(nextErrors);

    if (
      nextErrors.length > 0 ||
      !draft.categoryId ||
      !draft.paymentMethod
    ) {
      return;
    }

    const amount = parseAmount(draft.amount);

    if (amount === null) {
      return;
    }

    const input = {
      title: draft.title.trim(),
      amount,
      categoryId: draft.categoryId,
      spentOn: draft.spentOn,
      paymentMethod: draft.paymentMethod,
      note: draft.note.trim(),
    };

    setSaving(true);

    try {
      if (expenseId) {
        await updateExpense(db, expenseId, input);
      } else {
        await createExpense(db, input);
      }

      navigation.goBack();
    } catch (saveError: unknown) {
      setErrors([
        saveError instanceof Error
          ? saveError.message
          : 'Could not save this expense.',
      ]);

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.brand}
        style={styles.loader}
      />
    );
  }

  if (missing) {
    return (
      <View style={styles.content}>
        <EmptyState
          title="Expense not found"
          message="This record is no longer in the local database."
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.heading}>
            {expenseId ? 'Update your expense' : 'Record a new expense'}
          </Text>

          <Text style={styles.description}>
            Enter the details below to keep your spending records up to date.
          </Text>
        </View>

        {errors.length > 0 ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorHeading}>
              Please check the following:
            </Text>

            {errors.map((error) => (
              <Text key={error} style={styles.error}>
                • {error}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Basic expense details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Expense details</Text>

          <TextField
            label="Title"
            value={draft.title}
            onChangeText={(value) => updateDraft('title', value)}
            placeholder="Campus canteen lunch"
            maxLength={80}
          />

          <View style={styles.counterRow}>
            <Text style={styles.counter}>
              {draft.title.length}/80 characters
            </Text>
          </View>

          <TextField
            label="Amount (Rs.)"
            value={draft.amount}
            onChangeText={(value) => updateDraft('amount', value)}
            placeholder="450.00"
            keyboardType="decimal-pad"
          />

          <View style={styles.group}>
            <Text style={styles.groupLabel}>Category</Text>

            <Text style={styles.helper}>
              Select the category that best describes this expense.
            </Text>

            {categories.length === 0 ? (
              <Text style={styles.helper}>
                No categories are available. Check your local database.
              </Text>
            ) : (
              <View style={styles.wrapChips}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    color={category.color}
                    selected={draft.categoryId === category.id}
                    onPress={() =>
                      updateDraft('categoryId', category.id)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Date and payment details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Date and payment</Text>

          <TextField
            label="Date"
            value={draft.spentOn}
            onChangeText={(value) => updateDraft('spentOn', value)}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            hint="Enter the date using YYYY-MM-DD format."
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Set expense date to today"
            onPress={() => updateDraft('spentOn', todayISO())}
            hitSlop={8}
          >
            <Text style={styles.today}>Use today's date</Text>
          </Pressable>

          <View style={styles.group}>
            <Text style={styles.groupLabel}>Payment method</Text>

            <Text style={styles.helper}>
              How did you pay?
            </Text>

            <View style={styles.wrapChips}>
              {PAYMENT_METHODS.map((method) => (
                <Chip
                  key={method}
                  label={method}
                  selected={draft.paymentMethod === method}
                  onPress={() =>
                    updateDraft('paymentMethod', method)
                  }
                />
              ))}
            </View>
          </View>
        </View>

        {/* Optional note */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Additional information</Text>

          <TextField
            label="Note (optional)"
            value={draft.note}
            onChangeText={(value) => updateDraft('note', value)}
            placeholder="Add any extra details..."
            multiline
            maxLength={240}
            style={styles.note}
          />

          <Text style={styles.counter}>
            {draft.note.length}/240 characters
          </Text>
        </View>

        <PrimaryButton
          label={expenseId ? 'Save changes' : 'Save expense'}
          loading={saving}
          onPress={() => {
            void save();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 32,
  },
  content: {
    flexGrow: 1,
    gap: 22,
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    gap: 6,
  },
  heading: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  errorBox: {
    backgroundColor: colors.dangerSurface,
    borderRadius: 14,
    gap: 6,
    padding: 14,
  },
  errorHeading: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
  },
  formSection: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  group: {
    gap: 9,
  },
  groupLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  wrapChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: -10,
  },
  counter: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'right',
  },
  today: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
    marginTop: -6,
  },
  note: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});

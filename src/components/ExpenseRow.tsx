import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Expense } from '../types/models';
import { colors } from '../theme/colors';
import { formatDisplayDate } from '../utils/dates';
import { formatMoney } from '../utils/money';

type ExpenseRowProps = {
  expense: Expense;
  onPress: () => void;
};

export function ExpenseRow({ expense, onPress }: ExpenseRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.swatch, { backgroundColor: expense.categoryColor }]} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {expense.title}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {expense.categoryName} · {formatDisplayDate(expense.spentOn)}
        </Text>
      </View>
      <Text style={styles.amount}>{formatMoney(expense.amount)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.82,
  },
  swatch: {
    borderRadius: 8,
    height: 36,
    width: 8,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  amount: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
});

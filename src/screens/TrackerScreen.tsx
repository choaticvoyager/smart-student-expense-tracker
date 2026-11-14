
import React, { useCallback, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { ExpenseRow } from '../components/ExpenseRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { getDashboard } from '../db/expenses';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { DashboardData } from '../types/models';
import { currentMonthRange, formatMonthLabel } from '../utils/dates';
import { formatMoney } from '../utils/money';

type TrackerNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Tracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function TrackerScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<TrackerNavigation>();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      getDashboard(db, currentMonthRange())
        .then((data) => {
          if (active) {
            setDashboard(data);
            setError('');
          }
        })
        .catch((loadError: unknown) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Could not load expenses.',
            );
          }
        });

      return () => {
        active = false;
      };
    }, [db]),
  );

  const maxTotal = Math.max(
    ...(dashboard?.categories.map((category) => category.total) ?? [0]),
    0,
  );

  const average =
    dashboard && dashboard.monthCount > 0
      ? dashboard.monthTotal / dashboard.monthCount
      : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        eyebrow={formatMonthLabel()}
        title="Student spending"
        subtitle="Keep track of your daily expenses and understand your spending habits."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!dashboard && !error ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.loadingText}>Loading your expenses...</Text>
        </View>
      ) : null}

      {dashboard ? (
        <>
          {/* Monthly summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>TOTAL SPENDING THIS MONTH</Text>

            <Text style={styles.summaryAmount}>
              {formatMoney(dashboard.monthTotal)}
            </Text>

            <View style={styles.summaryDivider} />

            <Text style={styles.summaryNote}>
              {dashboard.monthCount === 0
                ? 'No expenses recorded this month yet.'
                : `You have recorded ${dashboard.monthCount} ${
                    dashboard.monthCount === 1 ? 'expense' : 'expenses'
                  } this month.`}
            </Text>
          </View>

          {/* Monthly statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>
                {dashboard.monthCount}
              </Text>
              <Text style={styles.statDescription}>This month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Average</Text>
              <Text style={styles.statValue}>
                {formatMoney(average)}
              </Text>
              <Text style={styles.statDescription}>Per expense</Text>
            </View>
          </View>

          <PrimaryButton
            label="Add expense"
            onPress={() => navigation.navigate('ExpenseForm')}
          />

          {/* Category breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Spending by category</Text>
              <Text style={styles.sectionCaption}>This month</Text>
            </View>

            {dashboard.categories.every(
              (category) => category.total === 0,
            ) ? (
              <EmptyState
                title="No spending yet"
                message="Expenses you add this month will appear here."
              />
            ) : (
              <View style={styles.categoryList}>
                {dashboard.categories
                  .filter((category) => category.total > 0)
                  .map((category) => (
                    <View key={category.id} style={styles.categoryCard}>
                      <View style={styles.barLabel}>
                        <View style={styles.categoryNameContainer}>
                          <View
                            style={[
                              styles.categoryDot,
                              { backgroundColor: category.color },
                            ]}
                          />
                          <Text style={styles.barName}>
                            {category.name}
                          </Text>
                        </View>

                        <Text style={styles.barAmount}>
                          {formatMoney(category.total)}
                        </Text>
                      </View>

                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              backgroundColor: category.color,
                              width: `${Math.max(
                                8,
                                (category.total / maxTotal) * 100,
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </View>

          {/* Recent expenses */}
          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Recent expenses</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all expenses"
                onPress={() => navigation.navigate('Expenses')}
                hitSlop={8}
              >
                <Text style={styles.link}>View all →</Text>
              </Pressable>
            </View>

            {dashboard.recent.length === 0 ? (
              <EmptyState
                title="Nothing recorded"
                message="Add an expense to start your local record."
              />
            ) : (
              <View style={styles.list}>
                {dashboard.recent.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onPress={() =>
                      navigation.navigate('ExpenseDetail', {
                        expenseId: expense.id,
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 36,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    backgroundColor: '#FCE8E6',
    padding: 12,
    borderRadius: 10,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
  summary: {
    backgroundColor: colors.brandDark,
    borderRadius: 22,
    padding: 22,
    gap: 12,
  },
  summaryLabel: {
    color: '#D5E4DE',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryAmount: {
    color: colors.onBrand,
    fontSize: 34,
    fontWeight: '800',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#FFFFFF35',
    marginVertical: 2,
  },
  summaryNote: {
    color: '#D5E4DE',
    fontSize: 13,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E5DC',
    padding: 16,
    gap: 6,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  statDescription: {
    color: colors.muted,
    fontSize: 12,
  },
  section: {
    gap: 14,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCaption: {
    color: colors.muted,
    fontSize: 12,
  },
  categoryList: {
    gap: 10,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E5DC',
    padding: 14,
    gap: 12,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  barAmount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    backgroundColor: '#E7E1D6',
    borderRadius: 999,
    height: 9,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: 9,
  },
  link: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
});

import React from 'react';

import { useCallback, useState } from 'react';
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
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow={formatMonthLabel()}
        title="Student spending"
        subtitle="Canteen, transport, books, rent, and the smaller costs in between."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!dashboard && !error ? (
        <ActivityIndicator color={colors.brand} />
      ) : null}

      {dashboard ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Spent this month</Text>

            <Text style={styles.summaryAmount}>
              {formatMoney(dashboard.monthTotal)}
            </Text>

            <Text style={styles.summaryMeta}>
              {dashboard.monthCount}{' '}
              {dashboard.monthCount === 1 ? 'expense' : 'expenses'}
              {dashboard.monthCount > 0
                ? ` · ${formatMoney(average)} average`
                : ''}
            </Text>
          </View>

          <PrimaryButton
            label="Add expense"
            onPress={() => navigation.navigate('ExpenseForm')}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By category</Text>

            {dashboard.categories.every(
              (category) => category.total === 0,
            ) ? (
              <EmptyState
                title="No spending yet"
                message="Expenses you add this month will appear here."
              />
            ) : (
              dashboard.categories
                .filter((category) => category.total > 0)
                .map((category) => (
                  <View key={category.id} style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={styles.barName}>
                        {category.name}
                      </Text>

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
                ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Recent</Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Expenses')}
              >
                <Text style={styles.link}>View all</Text>
              </Pressable>
            </View>

            {dashboard.recent.length === 0 ? (
              <EmptyState
                title="Nothing recorded"
                message="Add an expense to start the local record."
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
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 32,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  summary: {
    backgroundColor: colors.brandDark,
    borderRadius: 20,
    gap: 6,
    padding: 20,
  },
  summaryLabel: {
    color: '#D5E4DE',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryAmount: {
    color: colors.onBrand,
    fontSize: 32,
    fontWeight: '700',
  },
  summaryMeta: {
    color: '#D5E4DE',
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  barRow: {
    gap: 6,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  barAmount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    backgroundColor: '#E7E1D6',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: 8,
  },
  list: {
    gap: 10,
  },
});

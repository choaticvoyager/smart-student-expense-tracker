
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
import { ScreenHeader } from '../components/ScreenHeader';
import { listCategorySummaries } from '../db/categories';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { CategorySummary } from '../types/models';
import { formatMoney } from '../utils/money';

type CategoriesNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Categories'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CategoriesScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation<CategoriesNavigation>();

  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      listCategorySummaries(db)
        .then((rows) => {
          if (active) {
            setCategories(rows);
            setError('');
          }
        })
        .catch((loadError: unknown) => {
          if (active) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Could not load categories.',
            );
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
    }, [db]),
  );

  const total = categories.reduce(
    (sum, category) => sum + category.total,
    0,
  );

  const totalExpenses = categories.reduce(
    (sum, category) => sum + category.count,
    0,
  );

  const getPercentage = (amount: number) => {
    if (total <= 0) return 0;
    return (amount / total) * 100;
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader
        title="Categories"
        subtitle="Understand where your money goes. Select a category to explore its expenses."
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total spending</Text>

        <Text style={styles.totalAmount}>
          {formatMoney(total)}
        </Text>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {categories.length}
            </Text>
            <Text style={styles.statLabel}>
              Categories
            </Text>
          </View>

          <View style={styles.statSeparator} />

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {totalExpenses}
            </Text>
            <Text style={styles.statLabel}>
              Expenses
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Spending breakdown
          </Text>
          <Text style={styles.sectionSubtitle}>
            Tap a category to view its expenses
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Unable to load categories
          </Text>
          <Text style={styles.error}>
            {error}
          </Text>
        </View>
      ) : null}

      {loading && categories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brand} size="large" />
          <Text style={styles.loadingText}>
            Loading categories...
          </Text>
        </View>
      ) : null}

      {!loading && !error && categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          message="Your categories will appear here when they are available in the local database."
        />
      ) : null}

      <View style={styles.list}>
        {categories.map((category) => {
          const percentage = getPercentage(category.total);

          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={`${category.name}, ${formatMoney(category.total)}, ${category.count} expenses. View expenses.`}
              onPress={() =>
                navigation.navigate('Expenses', {
                  categoryId: category.id,
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: category.color },
                    ]}
                  />

                  <View style={styles.categoryText}>
                    <Text style={styles.categoryName}>
                      {category.name}
                    </Text>

                    <Text style={styles.categoryMeta}>
                      {category.count}{' '}
                      {category.count === 1 ? 'expense' : 'expenses'}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.categoryAmount}>
                    {formatMoney(category.total)}
                  </Text>

                  <Text style={styles.percentage}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.viewLabel}>
                View expenses {'›'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 36,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  totalAmount: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  summaryDivider: {
    backgroundColor: colors.line,
    height: 1,
    marginVertical: 10,
  },
  summaryStats: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    gap: 3,
  },
  statValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  statSeparator: {
    backgroundColor: colors.line,
    height: 34,
    width: 1,
    marginHorizontal: 14,
  },
  sectionHeader: {
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  list: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  pressed: {
    opacity: 0.75,
  },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  colorDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  categoryText: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  categoryMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  categoryAmount: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  percentage: {
    color: colors.muted,
    fontSize: 11,
  },
  progressBackground: {
    backgroundColor: colors.line,
    borderRadius: 10,
    height: 7,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 10,
    height: '100%',
  },
  viewLabel: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});

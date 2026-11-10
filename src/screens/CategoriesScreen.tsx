import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
            setError(loadError instanceof Error ? loadError.message : 'Could not load categories.');
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

  const total = categories.reduce((sum, category) => sum + category.total, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Categories"
        subtitle="Every category is stored on this device. Open one to see its expenses."
      />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>All recorded spending</Text>
        <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading && categories.length === 0 ? <ActivityIndicator color={colors.brand} /> : null}
      {!loading && categories.length === 0 ? (
        <EmptyState title="No categories" message="The local database did not return any categories." />
      ) : null}

      <View style={styles.list}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('Expenses', { categoryId: category.id })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={[styles.stripe, { backgroundColor: category.color }]} />
            <View style={styles.body}>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.meta}>
                {category.count} {category.count === 1 ? 'expense' : 'expenses'}
              </Text>
            </View>
            <Text style={styles.amount}>{formatMoney(category.total)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  totalAmount: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  list: {
    gap: 10,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    paddingRight: 14,
  },
  pressed: {
    opacity: 0.82,
  },
  stripe: {
    height: '100%',
    minHeight: 72,
    width: 8,
  },
  body: {
    flex: 1,
    gap: 3,
    paddingVertical: 14,
  },
  name: {
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

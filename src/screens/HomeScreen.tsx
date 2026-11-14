
import React from 'react';

import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import type { MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type HomeNavigation = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.eyebrow}>
            SMART STUDENT EXPENSE TRACKER
          </Text>
        </View>

        <Text style={styles.title}>
          Welcome!
        </Text>

        <Text style={styles.subtitle}>
          Your money, better managed.
        </Text>

        <Text style={styles.description}>
          Take control of your student expenses.
          Track your spending, understand your habits,
          and make smarter financial decisions.
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Track"
            onPress={() => navigation.navigate('Tracker')}
          />
        </View>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          Manage your money smarter
        </Text>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>↗</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>
              Track Expenses
            </Text>
            <Text style={styles.featureDescription}>
              Record and monitor your daily spending.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>◷</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>
              Understand Spending
            </Text>
            <Text style={styles.featureDescription}>
              See where your money goes each month.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>▦</Text>
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>
              Organize Categories
            </Text>
            <Text style={styles.featureDescription}>
              Keep your expenses organized by category.
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.footer}>
        Spend wisely. Stay in control.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 36,
    paddingBottom: 32,
    justifyContent: 'center',
    gap: 32,
  },
  hero: {
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E1EAE3',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: colors.ink,
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.brand,
    fontSize: 21,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 8,
  },
  featuresSection: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E1EAE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.brand,
    fontSize: 25,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  featureDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});

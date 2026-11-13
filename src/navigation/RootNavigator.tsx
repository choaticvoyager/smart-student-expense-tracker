import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ExpenseDetailScreen } from '../screens/ExpenseDetailScreen';
import { ExpenseFormScreen } from '../screens/ExpenseFormScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TrackerScreen } from '../screens/TrackerScreen';

import { colors } from '../theme/colors';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
    primary: colors.brand,
  },
};

const sharedHeader = {
  headerStyle: { backgroundColor: colors.brandDark },
  headerTintColor: colors.onBrand,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        ...sharedHeader,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home'
              ? 'home-outline'
              : route.name === 'Tracker'
                ? 'stats-chart-outline'
                : route.name === 'Expenses'
                  ? 'receipt-outline'
                  : 'grid-outline';

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />

      <Tab.Screen
        name="Tracker"
        component={TrackerScreen}
        options={{ title: 'Tracker' }}
      />

      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={sharedHeader}>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ExpenseDetail"
          component={ExpenseDetailScreen}
          options={{ title: 'Expense details' }}
        />

        <Stack.Screen
          name="ExpenseForm"
          component={ExpenseFormScreen}
          options={{ title: 'Expense' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

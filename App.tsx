import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseBoundary } from './src/components/DatabaseBoundary';
import { initializeDatabase } from './src/db/initialize';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseBoundary>
        <SQLiteProvider databaseName="student-expenses.db" onInit={initializeDatabase}>
          <StatusBar style="light" />
          <RootNavigator />
        </SQLiteProvider>
      </DatabaseBoundary>
    </SafeAreaProvider>
  );
}

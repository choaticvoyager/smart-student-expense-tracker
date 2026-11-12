import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type DatabaseBoundaryProps = {
  children: ReactNode;
};

type DatabaseBoundaryState = {
  error: Error | null;
};

export class DatabaseBoundary extends Component<DatabaseBoundaryProps, DatabaseBoundaryState> {
  state: DatabaseBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): DatabaseBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>The local database could not be opened.</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});

import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import type { MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type HomeNavigation = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>SMART STUDENT EXPENSE TRACKER</Text>

        <Text style={styles.title}>
          Welcome!
        </Text>

        <Text style={styles.subtitle}>
          Take control of your student expenses.
          Track your spending, manage your budget,
          and understand where your money goes.
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="Track"
            onPress={() => navigation.navigate('Tracker')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    gap: 20,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 26,
  },
  buttonContainer: {
    marginTop: 12,
  },
});

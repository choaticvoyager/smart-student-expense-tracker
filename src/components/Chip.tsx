import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
};

export function Chip({ label, selected, onPress, color }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.selected,
        selected && color ? { backgroundColor: color, borderColor: color } : null,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.onBrand,
  },
});

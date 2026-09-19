import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/index.js';

export const ENGINEERING_ROLES = [
  { id: 'RTL Design Engineer', label: 'RTL Design', color: colors.tracks.rtl },
  { id: 'FPGA Design Engineer', label: 'FPGA Design', color: colors.tracks.fpga },
  { id: 'VLSI Engineer', label: 'VLSI / ASIC', color: colors.tracks.vlsi },
  { id: 'Physical Design Engineer', label: 'Physical Design', color: colors.tracks.physical },
  { id: 'Embedded Systems Engineer', label: 'Embedded Systems', color: colors.tracks.embedded },
  { id: 'Software Engineer', label: 'Software Eng', color: colors.tracks.software },
  { id: 'Data/AI Engineer', label: 'Data / AI', color: colors.tracks.ai },
  { id: 'Other', label: 'General Tech', color: colors.tracks.other }
];

export const RolePicker = ({
  selectedRole,
  onSelectRole,
  layout = 'horizontal', // 'horizontal' | 'grid'
  style
}) => {
  const renderItem = (role) => {
    const isSelected = selectedRole === role.id;
    return (
      <TouchableOpacity
        key={role.id}
        activeOpacity={0.7}
        onPress={() => onSelectRole(role.id)}
        style={[
          styles.chip,
          isSelected
            ? { backgroundColor: role.color, borderColor: role.color }
            : { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: isSelected ? '#FFFFFF' : role.color }
          ]}
        />
        <Text
          style={[
            styles.chipText,
            { color: isSelected ? '#FFFFFF' : colors.textSecondary }
          ]}
        >
          {role.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (layout === 'grid') {
    return (
      <View style={[styles.grid, style]}>
        {ENGINEERING_ROLES.map(renderItem)}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.horizontalList, style]}
    >
      {ENGINEERING_ROLES.map(renderItem)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  horizontalList: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing.xs + 2,
    marginBottom: spacing.xs
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs + 2
  },
  chipText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold
  }
});

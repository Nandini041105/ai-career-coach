import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../theme/index.js';

export const MetricCard = ({
  title,
  value,
  subtitle = null,
  badge = null,
  badgeColor = colors.primary,
  icon = null,
  onPress = null,
  style
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, shadows.sm, style]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: `${badgeColor}22`, borderColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  icon: {
    marginRight: spacing.xs
  },
  title: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1
  },
  value: {
    color: colors.text,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs
  },
  badge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1
  },
  badgeText: {
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  }
});

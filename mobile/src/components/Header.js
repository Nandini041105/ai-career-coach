import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/index.js';
import { useAuth } from '../context/AuthContext.js';

export const Header = ({
  title,
  subtitle = null,
  showRoleBadge = true,
  rightAction = null,
  onBack = null
}) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {rightAction}
          {showRoleBadge && user?.targetRole && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText} numberOfLines={1}>
                {user.targetRole.split(' ')[0]}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs
  },
  backButtonText: {
    color: colors.primaryLight,
    fontSize: 22,
    fontWeight: typography.weights.bold
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.3
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm
  },
  roleBadge: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  roleBadgeText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  }
});

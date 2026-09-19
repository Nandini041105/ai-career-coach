import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/index.js';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md',        // sm | md | lg
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceElevated;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surfaceElevated;
      case 'danger':
        return colors.danger;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? colors.border : colors.primary;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primaryLight;
      case 'ghost':
        return colors.textSecondary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[size],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              styles[`text_${size}`],
              { color: getTextColor(), marginLeft: icon ? spacing.sm : 0 },
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md
  },
  sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm
  },
  md: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg
  },
  text: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center'
  },
  text_sm: {
    fontSize: typography.sizes.sm
  },
  text_md: {
    fontSize: typography.sizes.md
  },
  text_lg: {
    fontSize: typography.sizes.lg
  }
});

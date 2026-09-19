import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/index.js';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = null,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon = null,
  rightIcon = null,
  style,
  inputStyle
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          multiline && { height: numberOfLines * 24 + 24, alignItems: 'flex-start' },
          isFocused && styles.inputFocused,
          !!error && styles.inputError
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top' },
            inputStyle
          ]}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated
  },
  inputError: {
    borderColor: colors.danger
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    paddingVertical: spacing.sm
  },
  iconContainer: {
    marginRight: spacing.sm
  },
  toggleButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs
  },
  toggleText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs
  }
});

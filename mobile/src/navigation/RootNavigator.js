import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext.js';
import { AuthNavigator } from './AuthNavigator.js';
import { MainTabNavigator } from './MainTabNavigator.js';
import { colors, typography, spacing } from '../theme/index.js';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.splashTitle}>AI Career Coach</Text>
        <Text style={styles.splashSubtitle}>Initializing Mobile Workspace...</Text>
        <ActivityIndicator size="large" color={colors.primaryLight} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  logoIcon: {
    fontSize: 36
  },
  splashTitle: {
    color: colors.text,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.5
  },
  splashSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 4
  }
});

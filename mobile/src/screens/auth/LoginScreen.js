import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography } from '../../theme/index.js';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';

export const LoginScreen = ({ navigation }) => {
  const { login, apiBase, updateServerUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [customServer, setCustomServer] = useState(apiBase);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign In Failed', result.error);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('candidate@example.com');
    setPassword('Password123!');
  };

  const handleSaveServerUrl = async () => {
    if (customServer.trim()) {
      await updateServerUrl(customServer.trim());
      setServerModalVisible(false);
      Alert.alert('Server Updated', `API base URL set to: ${customServer.trim()}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>⚡</Text>
            </View>
            <Text style={styles.brandTitle}>AI Career Coach</Text>
            <Text style={styles.brandSubtitle}>
              Autonomous Career Engineering Suite
            </Text>
            <View style={styles.taglineBadge}>
              <Text style={styles.taglineText}>Native Mobile Edition</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your coaching dashboard</Text>

            <Input
              label="Email Address"
              placeholder="candidate@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.signInButton}
            />

            {/* Quick Demo Fill Button */}
            <TouchableOpacity
              onPress={handleQuickDemoLogin}
              style={styles.demoButton}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonText}>⚡ Fill Demo Credentials</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Server Config Accordion / Modal */}
          <View style={styles.serverInfoCard}>
            <View style={styles.serverHeaderRow}>
              <Text style={styles.serverLabel}>Backend Server:</Text>
              <TouchableOpacity
                onPress={() => setServerModalVisible(!serverModalVisible)}
              >
                <Text style={styles.serverActionText}>
                  {serverModalVisible ? 'Close' : 'Change IP'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.serverUrl} numberOfLines={1}>{apiBase}</Text>

            {serverModalVisible && (
              <View style={styles.serverEditBox}>
                <Input
                  label="Host URL (e.g. http://10.178.125.122:5000/api)"
                  value={customServer}
                  onChangeText={setCustomServer}
                  placeholder="http://<your-ip>:5000/api"
                />
                <Button
                  title="Save Server URL"
                  onPress={handleSaveServerUrl}
                  size="sm"
                  variant="secondary"
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center'
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  logoIcon: {
    fontSize: 32
  },
  brandTitle: {
    color: colors.text,
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.heavy,
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  brandSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 4,
    textAlign: 'center'
  },
  taglineBadge: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginTop: spacing.sm
  },
  taglineText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md
  },
  signInButton: {
    marginTop: spacing.sm
  },
  demoButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  demoButtonText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm
  },
  linkText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold
  },
  serverInfoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.sm + 4
  },
  serverHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  serverLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium
  },
  serverActionText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold
  },
  serverUrl: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  serverEditBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  }
});

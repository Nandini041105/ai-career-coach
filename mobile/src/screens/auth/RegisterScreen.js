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
import { RolePicker } from '../../components/RolePicker.js';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Required Fields', 'Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, targetRole);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back to Sign In</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Personalize your career coach for your target engineering discipline
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Input
              label="Full Name"
              placeholder="e.g. Alex Rivera"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Engineering Track Selector */}
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Select Target Engineering Track</Text>
              <Text style={styles.roleDescription}>
                Tailors resume ATS algorithms, interview questions, and roadmaps
              </Text>
              <RolePicker
                selectedRole={targetRole}
                onSelectRole={setTargetRole}
                layout="grid"
              />
            </View>

            <Button
              title="Create My Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={styles.registerButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: spacing.md
  },
  header: {
    marginBottom: spacing.lg
  },
  backButton: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs
  },
  backButtonText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.5
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 4
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg
  },
  roleSection: {
    marginVertical: spacing.sm
  },
  roleLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: 2
  },
  roleDescription: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm
  },
  registerButton: {
    marginTop: spacing.md
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
  }
});

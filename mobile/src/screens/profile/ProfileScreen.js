import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext.js';
import { colors, radii, spacing, typography, shadows } from '../../theme/index.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { RolePicker } from '../../components/RolePicker.js';
import axios from 'axios';

export const ProfileScreen = ({ navigation }) => {
  const { user, apiBase, updateRole, logout, updateServerUrl } = useAuth();
  const [updatingRole, setUpdatingRole] = useState(false);
  const [serverUrl, setServerUrl] = useState(apiBase);
  const [editingServer, setEditingServer] = useState(false);
  const [pingStatus, setPingStatus] = useState(null); // 'checking' | 'healthy' | 'error'

  const handleRoleChange = async (newRole) => {
    setUpdatingRole(true);
    const res = await updateRole(newRole);
    setUpdatingRole(false);

    if (res.success) {
      Alert.alert('Role Updated', `Target track switched to: ${newRole}`);
    } else {
      Alert.alert('Update Failed', res.error);
    }
  };

  const handleSaveServer = async () => {
    if (serverUrl.trim()) {
      await updateServerUrl(serverUrl.trim());
      setEditingServer(false);
      Alert.alert('Server Configuration Saved', `API Base: ${serverUrl.trim()}`);
    }
  };

  const handleTestConnection = async () => {
    setPingStatus('checking');
    try {
      const target = serverUrl.endsWith('/api')
        ? `${serverUrl}/health`
        : `${serverUrl.replace(/\/$/, '')}/api/health`;
      const res = await axios.get(target, { timeout: 5000 });
      if (res.data?.status === 'healthy') {
        setPingStatus('healthy');
        Alert.alert('Connection Successful! 🟢', `Service: ${res.data.service}\nAI Engine: ${res.data.aiStatus}`);
      } else {
        setPingStatus('error');
        Alert.alert('Unexpected Response', JSON.stringify(res.data));
      }
    } catch (e) {
      setPingStatus('error');
      Alert.alert('Connection Failed 🔴', `Could not reach ${serverUrl}.\nEnsure the backend server is running on your PC.`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        title="Candidate Profile"
        subtitle="Engineering Track & Device Settings"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Engineer Candidate'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>{user?.targetRole || 'Software Engineer'}</Text>
            </View>
          </View>
        </View>

        {/* Engineering Specialization */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Target Engineering Track</Text>
          <Text style={styles.sectionSubtitle}>
            Switching your track dynamically adjusts ATS keywords, mock interview questions, and learning roadmaps.
          </Text>

          {updatingRole && (
            <ActivityIndicator size="small" color={colors.primaryLight} style={{ marginVertical: spacing.xs }} />
          )}

          <RolePicker
            selectedRole={user?.targetRole || 'Software Engineer'}
            onSelectRole={handleRoleChange}
            layout="grid"
          />
        </View>

        {/* Backend Connectivity Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.serverTitleRow}>
            <Text style={styles.sectionTitle}>Backend LAN Connectivity</Text>
            {pingStatus === 'healthy' && (
              <View style={styles.healthyBadge}>
                <Text style={styles.healthyBadgeText}>🟢 Connected</Text>
              </View>
            )}
            {pingStatus === 'error' && (
              <View style={styles.errorBadge}>
                <Text style={styles.errorBadgeText}>🔴 Offline</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>
            Allows your physical smartphone (via Expo Go) to communicate with the Node.js server running on your PC.
          </Text>

          <View style={styles.serverBox}>
            <Text style={styles.serverBoxLabel}>Active API Base:</Text>
            <Text style={styles.serverBoxValue} numberOfLines={1}>{apiBase}</Text>
          </View>

          {editingServer ? (
            <View style={styles.editServerContainer}>
              <Input
                label="Host URL (e.g. http://10.178.125.122:5000/api)"
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://<your-ip>:5000/api"
              />
              <View style={styles.buttonRow}>
                <Button
                  title="Save New Base URL"
                  onPress={handleSaveServer}
                  size="sm"
                  style={{ flex: 1, marginRight: spacing.xs }}
                />
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => setEditingServer(false)}
                  size="sm"
                />
              </View>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <Button
                title={pingStatus === 'checking' ? 'Testing...' : 'Test Ping'}
                onPress={handleTestConnection}
                variant="secondary"
                size="sm"
                style={{ flex: 1, marginRight: spacing.xs }}
              />
              <Button
                title="Change Host IP"
                onPress={() => setEditingServer(true)}
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  avatarText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: colors.text,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2
  },
  rolePill: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
    marginTop: spacing.xs
  },
  rolePillText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.semibold
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  serverTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold
  },
  healthyBadge: {
    backgroundColor: colors.successGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  healthyBadgeText: {
    color: colors.success,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold
  },
  errorBadge: {
    backgroundColor: colors.dangerGlow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  errorBadgeText: {
    color: colors.danger,
    fontSize: typography.sizes.xs - 2,
    fontWeight: typography.weights.bold
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 16
  },
  serverBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.sm
  },
  serverBoxLabel: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.medium
  },
  serverBoxValue: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontFamily: 'monospace',
    marginTop: 2
  },
  editServerContainer: {
    marginTop: spacing.xs
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoutButton: {
    marginTop: spacing.sm
  }
});

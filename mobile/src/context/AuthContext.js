import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, STORAGE_KEYS, initializeApiBase, setApiBaseUrl, DEFAULT_API_BASE } from '../api/client.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedBase = await initializeApiBase();
      setApiBase(storedBase);

      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh profile in background
        try {
          const res = await authApi.getProfile();
          if (res.data?.user) {
            setUser(res.data.user);
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
          }
        } catch (e) {
          // Keep cached user if network is momentarily unavailable
        }
      }
    } catch (error) {
      console.warn('[AuthContext] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, receivedToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(receivedUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, targetRole) => {
    try {
      const res = await authApi.register({ name, email, password, targetRole });
      const { token: receivedToken, user: receivedUser } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, receivedToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(receivedUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  };

  const updateRole = async (newRole) => {
    try {
      const res = await authApi.updateRole(newRole);
      const updatedUser = res.data?.user || { ...user, targetRole: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to update role'
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('[AuthContext] Logout storage error:', e);
    }
    setToken(null);
    setUser(null);
  };

  const updateServerUrl = async (newUrl) => {
    try {
      const updated = await setApiBaseUrl(newUrl);
      setApiBase(updated);
      return { success: true, url: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        apiBase,
        login,
        register,
        updateRole,
        logout,
        updateServerUrl
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

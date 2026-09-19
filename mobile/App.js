import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext.js';
import { RootNavigator } from './src/navigation/RootNavigator.js';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0B0F19" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

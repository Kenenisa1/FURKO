import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppSplashScreen } from './src/screens/SplashScreen';

// Keep the native static splash screen visible until JavaScript mounts
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={isSplashDone ? 'dark' : 'light'} />
        <View style={styles.container}>
          <AppNavigator />
          {!isSplashDone && (
            <AppSplashScreen
              minDuration={2400}
              onFinish={() => setIsSplashDone(true)}
            />
          )}
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#052416',
  },
});

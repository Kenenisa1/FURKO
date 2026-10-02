import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { NotchedTextInput } from '../../components/common/NotchedTextInput';
import { useAuth } from '../../context/AuthContext';
import { FurkoLogo } from '../../components/common/FurkoLogo';

interface Props {
  navigation: any;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('dawit@example.com');
  const [password, setPassword] = useState('Password123!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, skipAuth } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email or phone and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      setIsSubmitting(false);
      // Navigation will handle authenticated state automatically, or navigate to Profile/Home
      navigation.navigate('MainTabs');
    } catch {
      setIsSubmitting(false);
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header with Back Arrow */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Brand Icon */}
          <View style={styles.logoRow}>
            <FurkoLogo size="medium" showTagline={false} centered={false} />
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to report and track civic issues in Jimma City.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Identifier: Email or Phone */}
            <NotchedTextInput
              iconName="mail"
              label="email or phone"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter email or phone number"
              autoCapitalize="none"
            />

            {/* Password */}
            <NotchedTextInput
              iconName="lock"
              label="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              isPassword={true}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => Alert.alert('Reset Password', 'A reset link has been sent to your registered contact.')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.submitButtonText}>sign in</Text>
                  <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>

            {/* Quick Demo Bypass for Testing */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => {
                skipAuth();
                navigation.navigate('MainTabs');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.demoButtonText}>⚡ Instant Demo Access</Text>
            </TouchableOpacity>

            {/* Switch to Register */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.createLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 40,
  },
  logoRow: {
    marginBottom: 20,
  },
  headingGroup: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    marginTop: 6,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  demoButton: {
    backgroundColor: '#F3F4F6',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  demoButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  footerText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  createLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },
});

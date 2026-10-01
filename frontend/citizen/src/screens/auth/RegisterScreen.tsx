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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { NotchedTextInput } from '../../components/common/NotchedTextInput';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number (e.g., +251 91 123 4567).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password, phone.trim());
      setIsSubmitting(false);

      // Advance directly to Phone Verification as shown in user flow!
      navigation.navigate('PhoneVerification', {
        phoneNumber: phone.trim(),
        fullName: fullName.trim(),
      });
    } catch {
      setIsSubmitting(false);
      Alert.alert('Registration Error', 'Could not create account. Please try again.');
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
          {/* Headline & Subtitle matching mockup */}
          <View style={styles.headingGroup}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Furko to start making a difference</Text>
          </View>

          {/* Form Fields matching mockup */}
          <View style={styles.form}>
            {/* 1. Full Name */}
            <NotchedTextInput
              iconName="user"
              label="full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
            />

            {/* 2. Phone Number */}
            <NotchedTextInput
              iconName="phone"
              label="phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            {/* 3. Email */}
            <NotchedTextInput
              iconName="mail"
              label="email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* 4. Password */}
            <NotchedTextInput
              iconName="lock"
              label="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              isPassword={true}
            />

            {/* Create Account Primary Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Already have an account footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign in</Text>
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
    paddingTop: 8,
    paddingBottom: 40,
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
  },
  form: {
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '800',
  },
});

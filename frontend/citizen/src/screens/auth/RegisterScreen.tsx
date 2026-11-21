import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FurkoLogo } from '../../components/common/FurkoLogo';
import { NotchedTextInput } from '../../components/common/NotchedTextInput';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!fullName.trim() || fullName.trim().length < 2) {
      Alert.alert('Missing Field', 'Please enter your first name (at least 2 characters).');
      return;
    }
    if (!fathersName.trim() || fathersName.trim().length < 2) {
      Alert.alert('Missing Field', "Please enter your father's name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number (e.g., +251 91 123 4567).');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedName = `${fullName.trim()} ${fathersName.trim()}`;
      await register(combinedName, email.trim(), password, phone.trim(), fathersName.trim());
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not create account. Please try again.';
      Alert.alert('Registration Error', serverMsg);
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
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Logo */}
          <View style={styles.logoRow}>
            <FurkoLogo size="medium" showTagline={false} centered={false} />
          </View>

          {/* Headline & Subtitle */}
          <View style={styles.headingGroup}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FURKO to start making a difference in Jimma City</Text>
          </View>

          {/* Section: Personal Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            {/* 1. First Name */}
            <NotchedTextInput
              iconName="user"
              label="first name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="givenName"
            />

            {/* 2. Father's Name */}
            <NotchedTextInput
              iconName="users"
              label="father's name"
              value={fathersName}
              onChangeText={setFathersName}
              placeholder="Enter your father's name"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name-family"
              textContentType="familyName"
            />

            {/* 3. Phone Number */}
            <NotchedTextInput
              iconName="phone"
              label="phone number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+251 91 234 5678"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
          </View>

          {/* Section: Account Credentials */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Account Credentials</Text>
            </View>

            {/* 4. Email */}
            <NotchedTextInput
              iconName="mail"
              label="email address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />

            {/* 5. Password */}
            <NotchedTextInput
              iconName="lock"
              label="password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              isPassword={true}
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {/* 6. Confirm Password */}
            <NotchedTextInput
              iconName="check-circle"
              label="confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              isPassword={true}
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          {/* Password strength hint */}
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={15} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.hintText}>
              Use at least 8 characters including letters and numbers for a strong password.
            </Text>
          </View>

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
              <>
                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Already have an account footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 48,
  },
  logoRow: {
    marginBottom: 16,
  },
  headingGroup: {
    marginBottom: 20,
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  hintText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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

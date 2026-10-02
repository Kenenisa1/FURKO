import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { CustomKeypad } from '../../components/common/CustomKeypad';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
  route: any;
}

export const PhoneVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const phoneNumber = route?.params?.phoneNumber || '+251 234 567 384';
  const [code, setCode] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyPhone } = useAuth();

  // Countdown timer for code resend
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Keypad key press handler
  const handleKeyPress = (digit: string) => {
    if (code.length < 6) {
      const nextCode = [...code, digit];
      setCode(nextCode);

      // Auto-trigger verify when 6th digit is entered
      if (nextCode.length === 6) {
        verifyEnteredCode(nextCode.join(''));
      }
    }
  };

  // Backspace handler
  const handleBackspace = () => {
    if (code.length > 0) {
      setCode((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const handleResend = () => {
    setSecondsLeft(45);
    setCode([]);
    Alert.alert('Code Resent', `A new 6-digit verification code has been dispatched to ${phoneNumber}`);
  };

  const verifyEnteredCode = async (codeString?: string) => {
    const fullCode = codeString || code.join('');
    if (fullCode.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPhone(fullCode);
      setIsVerifying(false);

      Alert.alert(
        'Phone Verified! 🎉',
        'Your citizen mobile number has been authenticated. Welcome to FURKO!',
        [
          {
            text: 'Go to Profile',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            text: 'Continue to Home',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch {
      setIsVerifying(false);
      Alert.alert('Verification Failed', 'Invalid verification code. Please try again.');
    }
  };

  const formattedTimer = `00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;

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

      {/* Main Verification Content */}
      <View style={styles.content}>
        {/* Title & Subtitle matching design */}
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          Enter the 6 digit code sent to{'\n'}your phone {phoneNumber}
        </Text>

        {/* 6 OTP Boxes in 2 Groups of 3 */}
        <View style={styles.otpClusterContainer}>
          {/* First Group of 3 */}
          <View style={styles.otpGroup}>
            {[0, 1, 2].map((idx) => {
              const digit = code[idx];
              const isCurrent = code.length === idx;
              return (
                <View
                  key={`digit-${idx}`}
                  style={[
                    styles.otpBox,
                    isCurrent && styles.otpBoxFocused,
                    digit && styles.otpBoxFilled,
                  ]}
                >
                  <Text style={styles.otpDigitText}>{digit || ''}</Text>
                </View>
              );
            })}
          </View>

          {/* Spacer between groups */}
          <View style={styles.groupSpacer} />

          {/* Second Group of 3 */}
          <View style={styles.otpGroup}>
            {[3, 4, 5].map((idx) => {
              const digit = code[idx];
              const isCurrent = code.length === idx;
              return (
                <View
                  key={`digit-${idx}`}
                  style={[
                    styles.otpBox,
                    isCurrent && styles.otpBoxFocused,
                    digit && styles.otpBoxFilled,
                  ]}
                >
                  <Text style={styles.otpDigitText}>{digit || ''}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Resend Code Countdown / Trigger */}
        <View style={styles.resendContainer}>
          {secondsLeft > 0 ? (
            <Text style={styles.resendTimerText}>
              Resend a code in {formattedTimer}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActionText}>Resend a code now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Action Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (code.length < 6 || isVerifying) && styles.buttonDisabled]}
          onPress={() => verifyEnteredCode()}
          disabled={code.length < 6 || isVerifying}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>verify</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* In-App Custom Numeric Keypad matching mockup */}
      <CustomKeypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
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
  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  otpClusterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  otpGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  groupSpacer: {
    width: 14,
  },
  otpBox: {
    width: 46,
    height: 64,
    borderWidth: 1.5,
    borderColor: '#111827',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#111827',
  },
  otpDigitText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  resendContainer: {
    marginBottom: 28,
  },
  resendTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  resendActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

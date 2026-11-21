import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FurkoLogo } from '../../components/common/FurkoLogo';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { skipAuth } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Brand Header */}
        <View style={styles.topHeader}>
          <FurkoLogo size="medium" showTagline={false} centered={true} />
          <View style={styles.civicPill}>
            <View style={styles.civicDot} />
            <Text style={styles.civicPillText}>JIMMA CIVIC PLATFORM</Text>
          </View>
        </View>

        {/* Clean Hero Visual with Smooth Rounded Frame */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroCard}>
            <Image
              source={require('../../../assets/welcome.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          {/* Punchy, Inspiring Headline */}
          <View style={styles.headingGroup}>
            <Text style={styles.headingGreen}>Make your</Text>
            <Text style={styles.headingBlack}>Voice Count.</Text>
          </View>

          {/* Understandable Civic Purpose Description */}
          <Text style={styles.subtitle}>
            Report community issues, track city council repairs in real-time, and help build a better neighborhood.
          </Text>

          {/* 3 Quick Value Highlights - Clear & Understandable */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.featureLabel}>Snap & Report</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.featureLabel}>Live Tracking</Text>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name="checkmark-done-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.featureLabel}>City Action</Text>
            </View>
          </View>

          {/* Action Button Group */}
          <View style={styles.buttonGroup}>
            {/* Primary: Sign In */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.88}
            >
              <Text style={styles.signInText}>Sign In</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
            </TouchableOpacity>

            {/* Secondary: Create Account */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.88}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>

            {/* Guest / Explore Preview Access */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={skipAuth}
              activeOpacity={0.7}
            >
              <Text style={styles.guestButtonText}>Explore the app as guest</Text>
              <Ionicons name="chevron-forward" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {/* Refined Legal Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  topHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  civicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 6,
  },
  civicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  civicPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 1.2,
  },
  heroWrapper: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  heroCard: {
    width: '100%',
    height: height * 0.32,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  headingGroup: {
    marginBottom: 6,
  },
  headingGreen: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headingBlack: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  featureDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E5E7EB',
  },
  buttonGroup: {
    gap: 10,
    marginBottom: 14,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonArrow: {
    marginLeft: 8,
  },
  createAccountButton: {
    backgroundColor: '#E6F4EA',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 2,
  },
  guestButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

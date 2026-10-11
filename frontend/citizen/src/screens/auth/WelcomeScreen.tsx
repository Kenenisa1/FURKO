import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FurkoLogo } from '../../components/common/FurkoLogo';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header with Back Arrow and Centered Furko Logo */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.logoCenter}>
          <FurkoLogo size="medium" showTagline={false} centered={true} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Hero Image Section with Curved Bottom Cut */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroImageContainer}>
          {/* Scenic citizen reporting hero representation */}
          <Image
            source={require('../../../assets/welcome.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Floating civic indicator on top of image */}
          <View style={styles.heroOverlayBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Jimma City Active Reporting</Text>
          </View>
        </View>

        {/* Curved Wave Mask */}
        <View style={styles.waveCut} />
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Main Headline matching mockup */}
        <View style={styles.headingGroup}>
          <Text style={styles.headingGreen}>Make your</Text>
          <Text style={styles.headingBlack}>Voice Count.</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Sign in or create an account to report and track community problems in your neighborhood.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.signInText}>sign in</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.createAccountText}>create account</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Disclaimer Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>by continuing, you agree to our</Text>
          <View style={styles.legalLinksRow}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.legalLink}>terms of service</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> and </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.legalLink}>privacy policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoCenter: {
    flex: 1,
    alignItems: 'center',
  },
  heroWrapper: {
    width: '100%',
    height: height * 0.38,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayBadge: {
    position: 'absolute',
    top: 14,
    left: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  waveCut: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    right: -20,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: width,
    borderTopRightRadius: width * 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  headingGroup: {
    marginBottom: 8,
  },
  headingGreen: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headingBlack: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonGroup: {
    gap: 12,
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
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E6FE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    color: '#1E6FE0',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

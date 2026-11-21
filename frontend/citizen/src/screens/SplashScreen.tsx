import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  Easing,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoSplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface Props {
  statusMessage?: string;
  onFinish?: () => void;
  minDuration?: number;
}

export const AppSplashScreen: React.FC<Props> = ({
  statusMessage = 'Connecting to Civic Services...',
  onFinish,
  minDuration = 2400,
}) => {
  const [currentStatus, setCurrentStatus] = useState(statusMessage);

  // Animation drivers
  const containerFade = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Immediately dismiss Expo's static native splash screen once JS is active
    ExpoSplashScreen.hideAsync().catch(() => {});

    // 2. Entrance choreography
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(textTranslateY, {
        toValue: 0,
        friction: 7,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: Math.max(minDuration - 500, 1800),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // 3. Gentle organic floating loop for logo
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 4. Subtle ambient glow breathing loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.15,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 0.92,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // 5. Dynamic status messages
    const statusTimer1 = setTimeout(() => {
      setCurrentStatus('Securing Session & Environment...');
    }, 900);

    const statusTimer2 = setTimeout(() => {
      setCurrentStatus('Ready');
    }, 1800);

    // 6. Graceful exit transition after minDuration
    const exitTimer = setTimeout(() => {
      if (onFinish) {
        Animated.timing(containerFade, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }
    }, minDuration);

    return () => {
      floatLoop.stop();
      glowLoop.stop();
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      clearTimeout(exitTimer);
    };
  }, [minDuration, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 0.5, 0.85, 1],
    outputRange: ['12%', '55%', '85%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerFade,
        },
      ]}
      pointerEvents={onFinish ? 'auto' : 'none'}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#052416"
        translucent
      />

      {/* Multi-layered emerald ambient aura */}
      <View style={styles.ambientAuraTop} />
      <Animated.View
        style={[
          styles.ambientGlowCenter,
          {
            transform: [{ scale: glowScale }],
          },
        ]}
      />
      <View style={styles.ambientAuraBottom} />

      {/* Subtle modern geometric background rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      {/* Center Hero Section */}
      <Animated.View
        style={[
          styles.centerSection,
          {
            opacity: contentFade,
          },
        ]}
      >
        {/* Logo Card with elevated floating glass aesthetic */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                { scale: logoScale },
                { translateY: logoFloat },
              ],
            },
          ]}
        >
          <View style={styles.logoHalo} />
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/furko-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title, Badge & Civic Slogan */}
        <Animated.View
          style={[
            styles.textGroup,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          {/* Civic Badge Pill */}
          <View style={styles.civicPill}>
            <View style={styles.civicDot} />
            <Text style={styles.civicPillText}>JIMMA CITY ADMINISTRATION</Text>
          </View>

          {/* Slogan & Value Prop */}
          <Text style={styles.tagline}>Report • Track • Resolve</Text>
          <Text style={styles.platformSubtext}>
            Citizen Public Service & Infrastructure Platform
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom Loading Progress & Authenticity Section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: footerOpacity,
          },
        ]}
      >
        {/* Minimalist Progress Track */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressWidth },
              ]}
            />
          </View>
          <Text style={styles.statusLabel}>{currentStatus}</Text>
        </View>

        {/* Official Civic Verification Badge */}
        <View style={styles.verifiedRow}>
          <Ionicons
            name="shield-checkmark"
            size={13}
            color="#22C55E"
            style={styles.shieldIcon}
          />
          <Text style={styles.verifiedText}>Official Civic Platform</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.versionText}>v1.0</Text>
        </View>

        <Text style={styles.jurisdictionText}>
          Jimma Municipality • Oromia Digital Governance
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#052416', // Rich deep emerald midnight canvas
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  // Ambient lighting for high-end depth
  ambientAuraTop: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.15,
    width: width * 1.3,
    height: height * 0.45,
    borderRadius: width * 0.65,
    backgroundColor: 'rgba(0, 168, 89, 0.08)',
  },
  ambientGlowCenter: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: 'rgba(0, 200, 100, 0.12)',
  },
  ambientAuraBottom: {
    position: 'absolute',
    bottom: -height * 0.12,
    right: -width * 0.2,
    width: width * 1.4,
    height: height * 0.45,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(2, 40, 23, 0.8)',
  },

  // Subtle concentric architecture rings
  ringOuter: {
    position: 'absolute',
    width: width * 0.88,
    height: width * 0.88,
    borderRadius: (width * 0.88) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  ringInner: {
    position: 'absolute',
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: (width * 0.62) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },

  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoHalo: {
    position: 'absolute',
    width: 172,
    height: 122,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 215, 110, 0.18)',
    transform: [{ scale: 1.18 }],
  },
  logoContainer: {
    width: 154,
    height: 106,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#00D166',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  logoImage: {
    width: 130,
    height: 86,
  },

  textGroup: {
    alignItems: 'center',
  },
  civicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 14,
  },
  civicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  civicPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D1FAE5',
    letterSpacing: 1.6,
  },

  tagline: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  platformSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.62)',
    letterSpacing: 0.4,
    textAlign: 'center',
    maxWidth: 260,
  },

  bottomSection: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    zIndex: 10,
  },

  progressContainer: {
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  progressTrack: {
    width: 144,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.6,
  },

  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shieldIcon: {
    marginRight: 5,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
    letterSpacing: 0.4,
  },
  dotSeparator: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 6,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.5,
  },
  jurisdictionText: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.36)',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

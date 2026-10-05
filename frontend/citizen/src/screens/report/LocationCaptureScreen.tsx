import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

type LocationStatus = 'idle' | 'requesting' | 'locating' | 'success' | 'denied' | 'error';

interface Coords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/** Jimma City centre — used as fallback when GPS is unavailable */
const JIMMA_CENTER: Coords = { latitude: 7.6734, longitude: 36.8344 };

export const LocationCaptureScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoryId = route?.params?.categoryId || 'cat-roads-001';
  const subIssue: string | undefined = route?.params?.subIssue;
  const photoUri: string | null = route?.params?.photoUri ?? null;
  const isPhotoSkipped: boolean = route?.params?.isPhotoSkipped ?? false;

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  // ─── State ────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [addressText, setAddressText] = useState('');
  const [landmark, setLandmark] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Pulse animation for the location pin while locating
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Auto-start location detection on mount
    handleGetLocation();
  }, []);

  useEffect(() => {
    if (status === 'locating') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  // ─── Location Logic ───────────────────────────────────────────────────────
  const handleGetLocation = async () => {
    setStatus('requesting');
    setAddressText('');
    setCoords(null);

    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

      if (permStatus !== 'granted') {
        setPermissionDenied(true);
        setStatus('denied');
        // Fall back to Jimma city centre
        setCoords(JIMMA_CENTER);
        setAddressText('Jimma City Center, Oromia (Default)');
        return;
      }

      setStatus('locating');

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const detected: Coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
      };

      setCoords(detected);

      // Reverse geocode to human-readable address
      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: detected.latitude,
          longitude: detected.longitude,
        });

        if (place) {
          const parts = [
            place.street || place.name,
            place.district || place.subregion,
            place.city || 'Jimma',
          ].filter(Boolean);
          setAddressText(parts.join(', '));
        } else {
          setAddressText(
            `Lat ${detected.latitude.toFixed(5)}, Lng ${detected.longitude.toFixed(5)}`
          );
        }
      } catch {
        setAddressText(
          `Lat ${detected.latitude.toFixed(5)}, Lng ${detected.longitude.toFixed(5)}`
        );
      }

      setStatus('success');
    } catch {
      // GPS error — fall back to Jimma centre
      setCoords(JIMMA_CENTER);
      setAddressText('Jimma City, Oromia Region (Approximate)');
      setStatus('error');
    }
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const handleConfirm = () => {
    navigation.navigate('ReportForm', {
      categoryId: category.id,
      subIssue,
      photoUri,
      isPhotoSkipped,
      coords: coords ?? JIMMA_CENTER,
      addressText: addressText || 'Jimma City, Oromia Region',
      landmark: landmark.trim(),
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const isReady = status === 'success' || status === 'denied' || status === 'error';

  const accuracyLabel = (acc?: number) => {
    if (!acc) return '';
    if (acc <= 10) return '± <10 m (Excellent)';
    if (acc <= 30) return `± ${Math.round(acc)} m (Good)`;
    if (acc <= 100) return `± ${Math.round(acc)} m (Fair)`;
    return `± ${Math.round(acc)} m (Weak signal)`;
  };

  const statusColor = () => {
    if (status === 'success') return '#16A34A';
    if (status === 'denied' || status === 'error') return '#D97706';
    return Colors.primary;
  };

  const statusMessage = () => {
    switch (status) {
      case 'idle':
        return 'Tap "Get My Location" to begin';
      case 'requesting':
        return 'Requesting location permission…';
      case 'locating':
        return 'Getting GPS signal…';
      case 'success':
        return 'Location detected successfully';
      case 'denied':
        return 'Permission denied — using Jimma City centre';
      case 'error':
        return 'GPS unavailable — using approximate location';
      default:
        return '';
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle}>Where is the Problem?</Text>
          <Text style={styles.headerSub}>Step 3 of 5 — Location</Text>
        </View>
        {/* Step dots */}
        <View style={styles.stepDots}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[styles.dot, s === 3 && styles.dotActive, s < 3 && styles.dotDone]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Category recap pill ── */}
        <View style={[styles.categoryPill, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
          <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
        </View>

        {/* ── GPS Visual Card ── */}
        <View style={styles.gpsCard}>
          {/* Map placeholder with pin */}
          <View style={styles.mapPlaceholder}>
            {/* Grid lines for faux-map effect */}
            {[...Array(4)].map((_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${25 * (i + 1)}%` as any }]} />
            ))}
            {[...Array(4)].map((_, i) => (
              <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${25 * (i + 1)}%` as any }]} />
            ))}

            {/* Animated location pin */}
            <View style={styles.pinContainer}>
              {(status === 'locating' || status === 'requesting') && (
                <Animated.View
                  style={[
                    styles.pulsRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              )}
              <View
                style={[
                  styles.pinCircle,
                  { backgroundColor: statusColor() },
                  status === 'success' && styles.pinSuccess,
                ]}
              >
                {status === 'locating' || status === 'requesting' ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name={
                      status === 'success'
                        ? 'checkmark'
                        : status === 'denied' || status === 'error'
                        ? 'warning'
                        : 'locate'
                    }
                    size={22}
                    color="#fff"
                  />
                )}
              </View>
              <View style={[styles.pinTail, { borderTopColor: statusColor() }]} />
            </View>

            {/* Accuracy ring (shown on success) */}
            {status === 'success' && (
              <View style={styles.accuracyRing} />
            )}
          </View>

          {/* Status row */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor() }]} />
            <Text style={[styles.statusText, { color: statusColor() }]}>{statusMessage()}</Text>
          </View>

          {/* Address display */}
          {addressText !== '' && (
            <View style={styles.addressBox}>
              <Ionicons name="location" size={16} color={Colors.primary} style={styles.addressIcon} />
              <Text style={styles.addressText}>{addressText}</Text>
            </View>
          )}

          {/* Coordinates + Accuracy */}
          {coords && (
            <View style={styles.coordsRow}>
              <View style={styles.coordChip}>
                <Feather name="map-pin" size={11} color="#6B7280" />
                <Text style={styles.coordText}>
                  {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                </Text>
              </View>
              {coords.accuracy && status === 'success' && (
                <View style={styles.coordChip}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={11} color="#6B7280" />
                  <Text style={styles.coordText}>{accuracyLabel(coords.accuracy)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.getLocationBtn,
                (status === 'locating' || status === 'requesting') && styles.btnDisabled,
              ]}
              onPress={handleGetLocation}
              disabled={status === 'locating' || status === 'requesting'}
            >
              {status === 'locating' || status === 'requesting' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="locate" size={18} color="#fff" />
              )}
              <Text style={styles.getLocationBtnText}>
                {isReady ? 'Refresh Location' : 'Get My Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Permission Denied Info ── */}
        {permissionDenied && (
          <View style={styles.permissionBanner}>
            <Ionicons name="information-circle" size={18} color="#92400E" />
            <Text style={styles.permissionText}>
              Location access was denied. A default Jimma City coordinate is used. You can still
              add a landmark below to help staff find the exact spot.
            </Text>
          </View>
        )}

        {/* ── Landmark Input ── */}
        <View style={styles.landmarkSection}>
          <Text style={styles.sectionLabel}>
            Landmark / Cross Street{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <Text style={styles.sectionHint}>
            Add a nearby landmark to help field staff locate the problem quickly.
          </Text>
          <View style={styles.landmarkInputWrapper}>
            <Feather name="map-pin" size={16} color="#9CA3AF" style={styles.landmarkIcon} />
            <TextInput
              style={styles.landmarkInput}
              placeholder="e.g. Near Jimma University gate, opposite Sobel Hotel…"
              placeholderTextColor="#9CA3AF"
              value={landmark}
              onChangeText={setLandmark}
              maxLength={120}
              multiline
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{landmark.length}/120</Text>
        </View>

        {/* ── Tips Card ── */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb-outline" size={16} color="#D97706" />
          <View style={styles.tipsList}>
            <Text style={styles.tipsTitle}>Tips for accurate location</Text>
            <Text style={styles.tipItem}>• Step outside if GPS is weak indoors</Text>
            <Text style={styles.tipItem}>• Stand still for 5–10 seconds for best accuracy</Text>
            <Text style={styles.tipItem}>• Adding a landmark speeds up dispatch significantly</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Bottom CTA ── */}
      <View style={styles.footer}>
        {/* Skip row */}
        <TouchableOpacity
          style={styles.useDefaultBtn}
          onPress={() => {
            setCoords(JIMMA_CENTER);
            setAddressText('Jimma City, Oromia Region (Approximate)');
            setStatus('error');
          }}
        >
          <Text style={styles.useDefaultText}>
            Use approximate location instead
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            !isReady && styles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!isReady}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerMid: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotDone: {
    backgroundColor: Colors.primary,
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Category pill
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  categoryEmoji: { fontSize: 16 },
  categoryName: { fontSize: 13, fontWeight: '600' },

  // GPS Card
  gpsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Map placeholder
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#EEF2F7',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#D1D9E6',
  },
  gridH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  pinContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  pulsRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '30',
    top: -10,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  pinSuccess: {
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  accuracyRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primary + '10',
  },

  // Status row
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Address
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  addressIcon: { marginTop: 1 },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Coords
  coordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  coordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coordText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Action buttons
  actionRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  getLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  getLocationBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Permission banner
  permissionBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  permissionText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },

  // Landmark
  landmarkSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  sectionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 17,
  },
  landmarkInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingTop: 10,
    minHeight: 72,
  },
  landmarkIcon: { marginTop: 2, marginRight: 8 },
  landmarkInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    minHeight: 52,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  tipsList: { flex: 1 },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  tipItem: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 19,
  },

  // Footer
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    gap: 10,
  },
  useDefaultBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  useDefaultText: {
    fontSize: 13,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { EvidenceUploader } from '../../components/report/EvidenceUploader';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

const JIMMA_DEFAULT = { latitude: 7.6734, longitude: 36.8344 };

export const PhotoLocationScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoryId = route?.params?.categoryId || 'cat-roads-001';
  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  // Photo State (Camera only)
  const [photoUri, setPhotoUri] = useState<string | null>(route?.params?.photoUri || null);
  const [isPhotoSkipped, setIsPhotoSkipped] = useState<boolean>(route?.params?.isPhotoSkipped || false);

  // Location State
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState('Detecting GPS location in Jimma...');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsLocating(true);
    setLocationError(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCoords(JIMMA_DEFAULT);
        setAddressText('Jimma City Center, Oromia (Default Coordinate)');
        setLocationError(true);
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const detected = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCoords(detected);

      try {
        const reverse = await Location.reverseGeocodeAsync(detected);
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const parts = [
            item.street || item.name || 'Kebele',
            item.subregion || item.city || 'Jimma',
          ].filter(Boolean);
          setAddressText(parts.join(', '));
        } else {
          setAddressText(`Jimma City (Lat: ${detected.latitude.toFixed(4)}, Lng: ${detected.longitude.toFixed(4)})`);
        }
      } catch {
        setAddressText(`Jimma City (Lat: ${detected.latitude.toFixed(4)}, Lng: ${detected.longitude.toFixed(4)})`);
      }
    } catch {
      setCoords(JIMMA_DEFAULT);
      setAddressText('Jimma City, Oromia Region');
      setLocationError(true);
    } finally {
      setIsLocating(false);
    }
  };

  const handleContinue = () => {
    if (!photoUri && !isPhotoSkipped) {
      Alert.alert(
        'Photo Required',
        'Please take a photo with the camera, or choose "Skip photo capture" if you are in a dark or hazardous condition.',
        [
          { text: 'Take Photo', style: 'cancel' },
          {
            text: 'Skip Photo & Proceed',
            onPress: () => {
              setIsPhotoSkipped(true);
              proceedToDetails(null, true);
            },
          },
        ]
      );
      return;
    }

    proceedToDetails(photoUri, isPhotoSkipped);
  };

  const proceedToDetails = (pUri: string | null, pSkipped: boolean) => {
    navigation.navigate('ReportDetails', {
      categoryId: category.id,
      photoUri: pUri,
      isPhotoSkipped: pSkipped,
      coords: coords || JIMMA_DEFAULT,
      addressText: addressText || 'Jimma City, Oromia Region',
      landmark: landmark.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 2 of 4: Evidence & Location</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Recap Banner (Centered) */}
        <View style={styles.categoryPillWrap}>
          <View style={[styles.categoryPill, { borderLeftColor: category.color }]}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={styles.categoryPillText}>{category.name}</Text>
            {category.nameLocal && (
              <Text style={styles.categoryLocalText}>• {category.nameLocal}</Text>
            )}
          </View>
        </View>

        {/* Section Headline */}
        <View style={styles.headingGroup}>
          <Text style={styles.title}>Photo Evidence & Location</Text>
          <Text style={styles.subtitle}>
            Take a live photo at the site and verify your GPS coordinates so maintenance crews can locate the problem instantly.
          </Text>
        </View>

        {/* ── PART 1: Camera Only Photo Evidence ── */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardSectionTitle}>1. Photographic Evidence (Camera Only)</Text>
          </View>

          <EvidenceUploader
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            isSkipped={isPhotoSkipped}
            onToggleSkip={setIsPhotoSkipped}
          />
        </View>

        {/* ── PART 2: Location Check (GPS + Landmark) ── */}
        <View style={styles.cardSection}>
          <View style={styles.cardSectionHeader}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardSectionTitle}>2. Location Check (GPS)</Text>
          </View>

          {/* GPS Coordinate Box */}
          <View style={styles.locationBox}>
            <View style={styles.locationPinHeader}>
              <View style={styles.locationPinCircle}>
                <Ionicons name="location" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.locationCoordsLabel}>
                  {coords
                    ? `${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E`
                    : 'Locating via GPS...'}
                </Text>
                {isLocating ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                ) : (
                  <Text style={styles.locationAddressText} numberOfLines={2}>
                    {addressText}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.refreshLocBtn}
              onPress={fetchLocation}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={15} color={Colors.primary} />
              <Text style={styles.refreshLocText}>Refresh GPS Signal</Text>
            </TouchableOpacity>
          </View>

          {/* Optional Landmark / Cross Street */}
          <Text style={styles.inputLabel}>Nearby Landmark or Kebele (Optional)</Text>
          <View style={styles.landmarkWrapper}>
            <Feather name="map-pin" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.landmarkInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Aba Jifar Palace gate, near pharmacy"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.statusIndicatorRow}>
          <Ionicons
            name={photoUri ? 'checkmark-circle' : isPhotoSkipped ? 'ellipse-outline' : 'camera-outline'}
            size={16}
            color={photoUri ? '#16A34A' : isPhotoSkipped ? '#6B7280' : Colors.accent}
          />
          <Text style={styles.statusIndicatorText}>
            {photoUri
              ? 'Photo evidence captured ✓'
              : isPhotoSkipped
              ? 'Photo skipped (optional)'
              : 'Snap photo with camera to continue'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            Continue to Problem Details →
          </Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 110,
  },
  categoryPillWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  categoryLocalText: {
    fontSize: 12,
    color: '#008744',
    fontWeight: '700',
  },
  headingGroup: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  locationBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  locationPinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCoordsLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  locationAddressText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  refreshLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  refreshLocText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  landmarkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  landmarkInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    justifyContent: 'center',
  },
  statusIndicatorText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  continueBtn: {
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

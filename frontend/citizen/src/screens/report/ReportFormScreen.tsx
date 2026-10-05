import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

const URGENCY_OPTIONS: {
  level: UrgencyLevel;
  label: string;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    level: 'low',
    label: 'Low',
    desc: 'Minor defect, no immediate hazard',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  {
    level: 'medium',
    label: 'Medium',
    desc: 'Normal civic issue needing repair',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    level: 'high',
    label: 'High',
    desc: 'Serious disruption or safety concern',
    color: '#EA580C',
    bg: '#FFEDD5',
  },
  {
    level: 'emergency',
    label: 'Emergency',
    desc: 'Immediate public danger or spark/flood risk',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
];

export const ReportFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoryId = route?.params?.categoryId || 'cat-roads-001';
  const initialSubIssue = route?.params?.subIssue;

  // Selected Category
  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  // Form Fields
  const [title, setTitle] = useState(initialSubIssue || '');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  // Location State
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState('Detecting GPS location in Jimma City...');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Photo State (passed from PhotoEvidenceScreen or captured here)
  const [photoUri, setPhotoUri] = useState<string | null>(route?.params?.photoUri || null);
  const [isPhotoSkipped, setIsPhotoSkipped] = useState<boolean>(route?.params?.isPhotoSkipped || false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);

  // Auto-detect GPS on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to Jimma City center coordinates
        setCoords({ latitude: 7.6734, longitude: 36.8344 });
        setAddressText('Jimma City Center, Oromia (Default Coordinate)');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // Reverse geocode
      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          setAddressText(
            `${item.street || item.name || 'Kebele'}, ${item.subregion || item.city || 'Jimma'}`
          );
        } else {
          setAddressText(
            `Jimma City (Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)})`
          );
        }
      } catch {
        setAddressText(`Jimma City (Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)})`);
      }
    } catch {
      setCoords({ latitude: 7.6734, longitude: 36.8344 });
      setAddressText('Jimma City, Oromia Region');
    } finally {
      setIsLocating(false);
    }
  };

  // Photo Capture
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Please allow camera access to attach photo evidence.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setIsPhotoSkipped(false);
    }
  };

  const handlePickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setIsPhotoSkipped(false);
    }
  };

  const handleSkipPhoto = () => {
    setPhotoUri(null);
    setIsPhotoSkipped(true);
  };

  // Form Validation & Submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a short headline or title for this problem.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please provide details explaining the problem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category_id: category.id,
        title: title.trim(),
        description: description.trim(),
        latitude: coords?.latitude || 7.6734,
        longitude: coords?.longitude || 36.8344,
        address_text: addressText,
        landmark: landmark.trim() || undefined,
        photo_url: photoUri || undefined,
        urgency,
        sub_issue: initialSubIssue,
      };

      const newReport = await ReportsApi.submitReport(payload);
      setIsSubmitting(false);
      setSubmittedReport(newReport);
    } catch {
      setIsSubmitting(false);
      Alert.alert('Submission Error', 'Could not submit report. Please try again.');
    }
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
        <Text style={styles.headerTitle}>Report Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Category & Direct Service Routing Banner */}
          <View style={[styles.categoryBanner, { borderLeftColor: category.color }]}>
            <View style={styles.categoryBannerLeft}>
              <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '20' }]}>
                <Text style={styles.categoryEmoji}>
                  {category.key === 'roads'
                    ? '🚧'
                    : category.key === 'water'
                    ? '💧'
                    : category.key === 'waste'
                    ? '🗑️'
                    : '💡'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerCategoryName}>{category.name}</Text>
                <Text style={styles.bannerCategoryLocal}>{category.nameLocal}</Text>
                <View style={styles.routingRow}>
                  <Ionicons name="git-network-outline" size={13} color={Colors.primary} />
                  <Text style={styles.routingText} numberOfLines={1}>
                    Routes to: {category.responsibleInstitution}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.changeCategoryBtn}
              onPress={() => navigation.navigate('CategorySelection', { categoryId: category.id })}
            >
              <Text style={styles.changeCategoryText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* SECTION 1: Problem Title */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Problem Title / Headline *</Text>
              <Text style={styles.charCount}>{title.length}/80</Text>
            </View>
            <TextInput
              style={styles.inputTitle}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Deep pothole causing vehicle damage"
              placeholderTextColor="#9CA3AF"
              maxLength={80}
            />

            {/* Quick title suggestions based on subIssues */}
            {category.subIssues && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionLabel}>Quick suggestions:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsRow}>
                  {category.subIssues.slice(0, 4).map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      style={[
                        styles.suggestionPill,
                        title === sub && { backgroundColor: category.color, borderColor: category.color },
                      ]}
                      onPress={() => setTitle(sub)}
                    >
                      <Text
                        style={[
                          styles.suggestionText,
                          title === sub && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                      >
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* SECTION 2: Problem Description */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Problem Description *</Text>
              <Text style={styles.charCount}>{description.length} chars</Text>
            </View>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Explain the severity, how long it has been there, and immediate risks (e.g. traffic blockage, contaminated water, spark hazard)..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={5}
            />
          </View>

          {/* SECTION 3: Urgency Level */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Urgency / Hazard Level</Text>
            <Text style={styles.sectionHint}>Help dispatch teams prioritize civic repairs</Text>

            <View style={styles.urgencyGrid}>
              {URGENCY_OPTIONS.map((opt) => {
                const isSelected = urgency === opt.level;
                return (
                  <TouchableOpacity
                    key={opt.level}
                    style={[
                      styles.urgencyCard,
                      isSelected && { borderColor: opt.color, backgroundColor: opt.bg },
                    ]}
                    onPress={() => setUrgency(opt.level)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.urgencyTop}>
                      <View style={[styles.urgencyDot, { backgroundColor: opt.color }]} />
                      <Text
                        style={[
                          styles.urgencyLabel,
                          isSelected && { color: opt.color, fontWeight: '800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <Text style={styles.urgencyDesc} numberOfLines={2}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 4: Location (GPS + Landmark) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Incident Location (GPS)</Text>
            <Text style={styles.sectionHint}>
              Exact coordinates ensure maintenance crews find the fault without phone delays
            </Text>

            <View style={styles.locationBox}>
              <View style={styles.locationHeaderRow}>
                <View style={styles.locationPinCircle}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.locationTitle}>
                    {coords
                      ? `${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E`
                      : 'Locating...'}
                  </Text>
                  {isLocating ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: 'flex-start' }} />
                  ) : (
                    <Text style={styles.locationAddressText} numberOfLines={2}>
                      {addressText}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.refreshLocBtn} onPress={fetchLocation} activeOpacity={0.8}>
                <Ionicons name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.refreshLocText}>Refresh GPS Coordinates</Text>
              </TouchableOpacity>
            </View>

            {/* Landmark text input */}
            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Nearby Landmark (Optional)</Text>
            <TextInput
              style={styles.inputTitle}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Aba Jifar Palace gate, near pharmacy"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* SECTION 5: Photographic Evidence */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Photographic Evidence</Text>
            <Text style={styles.sectionHint}>
              Visual proof prevents duplicate dispatches and guides repair crews
            </Text>

            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.photoPreviewImage} />
                <View style={styles.photoActionRow}>
                  <TouchableOpacity style={styles.photoActionBtn} onPress={handleTakePhoto}>
                    <Ionicons name="camera-outline" size={16} color="#374151" />
                    <Text style={styles.photoActionBtnText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoActionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => setPhotoUri(null)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text style={[styles.photoActionBtnText, { color: '#DC2626' }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoButtonGrid}>
                <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
                  <Ionicons name="camera" size={26} color={Colors.primary} />
                  <Text style={styles.photoBtnTitle}>Take Photo</Text>
                  <Text style={styles.photoBtnSubtitle}>Capture on site</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoBtn} onPress={handlePickGallery} activeOpacity={0.8}>
                  <Ionicons name="images" size={26} color="#1E6FE0" />
                  <Text style={styles.photoBtnTitle}>Choose Gallery</Text>
                  <Text style={styles.photoBtnSubtitle}>Upload saved image</Text>
                </TouchableOpacity>
              </View>
            )}

            {!photoUri && (
              <TouchableOpacity
                style={[styles.skipPhotoCard, isPhotoSkipped && styles.skipPhotoCardActive]}
                onPress={handleSkipPhoto}
                activeOpacity={0.7}
              >
                <Text style={styles.skipPhotoText}>
                  {isPhotoSkipped ? '✓ Photo skipped (Night / Low light condition)' : 'Skip photo (Low light / safety hazard)'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>🚀 Submit & Dispatch Report</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal / Screen on Successful Submission */}
      {submittedReport && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>Report Dispatched!</Text>
            <Text style={styles.successSubtitle}>
              Your civic report has been received and routed directly to the designated department.
            </Text>

            <View style={styles.trackingPillCard}>
              <Text style={styles.trackingPillLabel}>TICKET TRACKING NUMBER</Text>
              <Text style={styles.trackingPillValue}>{submittedReport.tracking_number}</Text>
            </View>

            <View style={styles.modalInstRow}>
              <Text style={styles.modalInstLabel}>Routed Institution:</Text>
              <Text style={styles.modalInstValue}>{submittedReport.institution_name}</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.trackReportBtn}
                onPress={() => {
                  const repId = submittedReport.id;
                  setSubmittedReport(null);
                  navigation.replace('ReportDetail', { reportId: repId });
                }}
              >
                <Text style={styles.trackReportBtnText}>Track Ticket Progress →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.returnHomeBtn}
                onPress={() => {
                  setSubmittedReport(null);
                  navigation.navigate('MainTabs');
                }}
              >
                <Text style={styles.returnHomeBtnText}>Return to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  categoryBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  bannerCategoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  bannerCategoryLocal: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  routingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  routingText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  changeCategoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginLeft: 8,
  },
  changeCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionCard: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  inputTitle: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  suggestionsRow: {
    flexDirection: 'row',
  },
  suggestionPill: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    height: 110,
    textAlignVertical: 'top',
  },
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyCard: {
    width: '48.5%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
  },
  urgencyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  urgencyDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
  locationBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  locationHeaderRow: {
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
  locationTitle: {
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  refreshLocText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  photoButtonGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  photoBtnSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  photoPreviewWrapper: {
    alignItems: 'center',
  },
  photoPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  photoActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  skipPhotoCard: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  skipPhotoCardActive: {
    backgroundColor: '#E6F4EA',
  },
  skipPhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
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
    opacity: 0.6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  trackingPillCard: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  trackingPillLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  trackingPillValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  modalInstRow: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalInstLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalInstValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 2,
  },
  modalActions: {
    width: '100%',
    gap: 10,
  },
  trackReportBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackReportBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  returnHomeBtn: {
    backgroundColor: '#F3F4F6',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnHomeBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 14,
  },
});

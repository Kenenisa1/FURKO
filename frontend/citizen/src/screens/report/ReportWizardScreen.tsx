import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { ProblemCategory } from '../../types';
import { CategoryCard } from '../../components/report/CategoryCard';

interface Props {
  navigation: any;
  route: any;
}

export const ReportWizardScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialCategory = route?.params?.categoryId;
  const initialSubIssue = route?.params?.subIssue;
  const initialStepParam = route?.params?.initialStep;

  // Wizard state: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(initialStepParam || 1);

  // Step 1: Category
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | null>(
    PROBLEM_CATEGORIES.find((c) => c.id === initialCategory) || null
  );
  const [selectedSubIssue, setSelectedSubIssue] = useState<string | undefined>(initialSubIssue);

  // Step 2: Photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [skippedPhoto, setSkippedPhoto] = useState(false);

  // Step 3: Location
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState('Capturing GPS...');
  const [landmark, setLandmark] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Step 4: Description
  const [title, setTitle] = useState(initialSubIssue || '');
  const [description, setDescription] = useState('');

  // Step 5: Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-request location when reaching step 3
  useEffect(() => {
    if (currentStep === 3 && !coords) {
      detectLocation();
    }
  }, [currentStep]);

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to Jimma City default coordinates if permission denied
        setCoords({ latitude: 7.6734, longitude: 36.8344 });
        setAddressText('Jimma City Center (Default Pilot Coordinate)');
        setIsLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // Reverse geocode to address text
      const reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        setAddressText(
          `${item.street || item.name || 'Kebele'}, ${item.city || item.subregion || 'Jimma'}`
        );
      } else {
        setAddressText(`Jimma City (Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)})`);
      }
    } catch {
      // Fallback coordinate for Jimma pilot
      setCoords({ latitude: 7.6734, longitude: 36.8344 });
      setAddressText('Jimma City, Oromia Region');
    } finally {
      setIsLocating(false);
    }
  };

  // Image pickers
  const takePhoto = async () => {
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
      setSkippedPhoto(false);
      setCurrentStep(3); // Advance to Location
    }
  };

  const pickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setSkippedPhoto(false);
      setCurrentStep(3);
    }
  };

  const skipPhoto = () => {
    setPhotoUri(null);
    setSkippedPhoto(true);
    setCurrentStep(3);
  };

  // Submission handler
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Details', 'Please provide a title and description.');
      return;
    }
    setIsSubmitting(true);
    try {
      const newReport = await ReportsApi.submitReport({
        category_id: selectedCategory.id,
        title: title.trim(),
        description: description.trim(),
        latitude: coords?.latitude || 7.6734,
        longitude: coords?.longitude || 36.8344,
        address_text: addressText,
        landmark: landmark.trim() || undefined,
        photo_url: photoUri || undefined,
      });
      setIsSubmitting(false);

      Alert.alert(
        '🎉 Report Dispatched!',
        `Your tracking number is ${newReport.tracking_number}.\n\nDirectly routed to:\n${newReport.institution_name}`,
        [
          {
            text: 'Track Ticket',
            onPress: () => {
              navigation.replace('ReportDetail', { reportId: newReport.id });
            },
          },
          {
            text: 'Go to Home',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch {
      setIsSubmitting(false);
      Alert.alert('Error', 'Could not submit report. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Progress Indicator Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.stepsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[
                styles.stepSegment,
                currentStep >= s ? styles.stepActive : styles.stepInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepTitleText}>
          {currentStep === 1 && 'Step 1: Select Problem Category'}
          {currentStep === 2 && 'Step 2: Photographic Evidence'}
          {currentStep === 3 && 'Step 3: Incident Location (GPS)'}
          {currentStep === 4 && 'Step 4: Problem Description'}
          {currentStep === 5 && 'Step 5: Review & Direct Dispatch'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* STEP 1: Category Picker */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.instruction}>
              Choose the department category for your issue. No need to know which office handles it.
            </Text>
            {PROBLEM_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={selectedCategory?.id === cat.id}
                selectedSubIssue={selectedSubIssue}
                onSelectCategory={(c) => {
                  setSelectedCategory(c);
                  if (selectedCategory?.id !== c.id) {
                    setSelectedSubIssue(undefined);
                  }
                }}
                onSelectSubIssue={(sub) => {
                  setSelectedSubIssue(sub);
                  if (!title || title.trim() === '') {
                    setTitle(sub);
                  }
                }}
              />
            ))}
          </View>
        )}

        {/* STEP 2: Photo Capture */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.instruction}>
              Attach a photo to help dispatch crews identify and locate the damage quickly.
            </Text>

            {photoUri ? (
              <View style={styles.photoPreviewCard}>
                <Image source={{ uri: photoUri }} style={styles.photoPreviewImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={styles.retakeText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoOptionsContainer}>
                <TouchableOpacity style={styles.photoActionCard} onPress={takePhoto}>
                  <Text style={styles.photoActionEmoji}>📷</Text>
                  <Text style={styles.photoActionTitle}>Use Camera</Text>
                  <Text style={styles.photoActionSubtitle}>Snap photo directly at site</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionCard} onPress={pickGallery}>
                  <Text style={styles.photoActionEmoji}>🖼️</Text>
                  <Text style={styles.photoActionTitle}>Choose from Gallery</Text>
                  <Text style={styles.photoActionSubtitle}>Upload from saved photos</Text>
                </TouchableOpacity>

                {/* Non-punitive skip option per SRS FR-004 */}
                <TouchableOpacity style={styles.skipPhotoCard} onPress={skipPhoto}>
                  <Text style={styles.skipPhotoTitle}>Skip Photo</Text>
                  <Text style={styles.skipPhotoSubtitle}>
                    Use if low light, night hazard, or camera is unavailable.
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: Location (GPS) */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.instruction}>
              We automatically detect your GPS coordinates so maintenance crews find the exact spot.
            </Text>

            <View style={styles.locationCard}>
              <View style={styles.locationPinHeader}>
                <Text style={{ fontSize: 28 }}>📍</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.locationCoordsLabel}>Detected Coordinates</Text>
                  {isLocating ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.locationCoordsValue}>
                      {coords
                        ? `${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E`
                        : 'GPS not available'}
                    </Text>
                  )}
                  <Text style={styles.locationAddressText}>{addressText}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.refreshLocBtn} onPress={detectLocation}>
                <Text style={styles.refreshLocText}>🔄 Refresh GPS Location</Text>
              </TouchableOpacity>
            </View>

            {/* Landmark text input */}
            <Text style={styles.inputLabel}>Nearby Landmark (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Opposite Aba Jifar Palace gate, near pharmacy"
            />
          </View>
        )}

        {/* STEP 4: Description */}
        {currentStep === 4 && (
          <View>
            <Text style={styles.instruction}>
              Give a clear title and describe what is broken and any safety hazards.
            </Text>

            <Text style={styles.inputLabel}>Short Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Large deep pothole on main road"
            />

            <Text style={styles.inputLabel}>Detailed Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Explain the severity, how long it has been there, and immediate risks..."
              multiline
              numberOfLines={5}
            />
            <Text style={styles.charCount}>{description.length} characters</Text>
          </View>
        )}

        {/* STEP 5: Review & Direct Dispatch */}
        {currentStep === 5 && (
          <View>
            <Text style={styles.instruction}>
              Review your report before submitting. Our routing engine will instantly dispatch it.
            </Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>{selectedCategory?.name}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Target Institution</Text>
                <Text style={[styles.reviewValue, { color: Colors.primary, fontWeight: '700' }]}>
                  {selectedCategory?.responsibleInstitution}
                </Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Title</Text>
                <Text style={styles.reviewValue}>{title}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Location</Text>
                <Text style={styles.reviewValue}>{addressText}</Text>
              </View>

              {landmark ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Landmark</Text>
                  <Text style={styles.reviewValue}>{landmark}</Text>
                </View>
              ) : null}

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Evidence</Text>
                <Text style={styles.reviewValue}>
                  {photoUri ? '📷 1 Photo Attached' : 'Skipped (No Photo)'}
                </Text>
              </View>
            </View>

            <View style={styles.dispatchNotice}>
              <Text style={styles.dispatchNoticeText}>
                ⚡ <strong>Direct Service Routing:</strong> Upon tapping Submit, this report
                will be sent directly to {selectedCategory?.responsibleInstitution}'s active queue.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Buttons */}
      <View style={styles.bottomBar}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep((prev) => prev - 1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}

        {currentStep < 5 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 1 && !selectedCategory && styles.buttonDisabled,
              currentStep === 4 && (!title.trim() || !description.trim()) && styles.buttonDisabled,
            ]}
            onPress={() => {
              if (currentStep === 1 && !selectedCategory) {
                Alert.alert('Select Category', 'Please select a problem category to continue.');
                return;
              }
              if (currentStep === 4 && (!title.trim() || !description.trim())) {
                Alert.alert('Required Fields', 'Please fill in both title and description.');
                return;
              }
              setCurrentStep((prev) => prev + 1);
            }}
            disabled={
              (currentStep === 1 && !selectedCategory) ||
              (currentStep === 4 && (!title.trim() || !description.trim()))
            }
          >
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>🚀 Submit & Dispatch Report</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    backgroundColor: Colors.surface,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepInactive: {
    backgroundColor: Colors.border,
  },
  stepTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  instruction: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  catSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  catSelectIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  catSelectTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catSelectLocal: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  catSelectDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  catSelectInst: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  photoOptionsContainer: {
    marginTop: 8,
  },
  photoActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoActionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  photoActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  photoActionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  skipPhotoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  skipPhotoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  skipPhotoSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  photoPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  photoPreviewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  retakeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  retakeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationPinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationCoordsLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  locationCoordsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  locationAddressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  refreshLocBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  refreshLocText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: -8,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  reviewRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  reviewLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  reviewValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  dispatchNotice: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
  },
  dispatchNoticeText: {
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

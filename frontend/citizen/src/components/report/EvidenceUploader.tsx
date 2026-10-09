import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';

interface Props {
  photoUri: string | null;
  onPhotoSelected: (uri: string | null) => void;
  isSkipped: boolean;
  onToggleSkip: (skipped: boolean) => void;
}

export const EvidenceUploader: React.FC<Props> = ({
  photoUri,
  onPhotoSelected,
  isSkipped,
  onToggleSkip,
}) => {
  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Camera access is needed to capture evidence on site. Please enable it in Settings.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
        onToggleSkip(false);
      }
    } catch {
      Alert.alert('Error', 'Unable to launch camera. Please try again.');
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
        onToggleSkip(false);
      }
    } catch {
      Alert.alert('Error', 'Unable to open photo library. Please try again.');
    }
  };

  const handleRemove = () => {
    onPhotoSelected(null);
  };

  const handleSkip = () => {
    onPhotoSelected(null);
    onToggleSkip(true);
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        /* PREVIEW MODE */
        <View style={styles.previewContainer}>
          <View style={styles.imageCard}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />

            {/* Ready Badge Overlay */}
            <View style={styles.badgeOverlay}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.badgeText}>Evidence Photo Attached</Text>
            </View>
          </View>

          {/* Action Buttons for Preview */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCamera} activeOpacity={0.8}>
              <Ionicons name="camera-reverse-outline" size={18} color="#374151" />
              <Text style={styles.actionBtnText}>Retake Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleRemove}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* CAPTURE / LIBRARY SELECTION MODE */
        <View style={styles.optionsContainer}>
          {/* Two-button row: Camera + Gallery */}
          <View style={styles.captureRow}>
            <TouchableOpacity style={styles.captureCard} onPress={handleCamera} activeOpacity={0.85}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.cameraTitle}>Take Photo</Text>
              <Text style={styles.cameraSubtitle}>Capture live evidence on site</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.captureCard, styles.galleryCard]} onPress={handleGallery} activeOpacity={0.85}>
              <View style={[styles.cameraCircle, styles.galleryCircle]}>
                <Ionicons name="images" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.cameraTitle}>From Gallery</Text>
              <Text style={styles.cameraSubtitle}>Choose an existing photo</Text>
            </TouchableOpacity>
          </View>

          {/* Non-punitive Skip Option */}
          <TouchableOpacity
            style={[styles.skipCard, isSkipped && styles.skipCardActive]}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <View style={styles.skipRow}>
              <Ionicons
                name={isSkipped ? 'checkmark-circle' : 'moon-outline'}
                size={20}
                color={isSkipped ? Colors.primary : '#6B7280'}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.skipTitle, isSkipped && { color: Colors.primary, fontWeight: '800' }]}>
                  {isSkipped ? 'Photo capture skipped' : 'Skip photo capture'}
                </Text>
                <Text style={styles.skipSubtitle}>
                  For night hazards, low lighting, or immediate safety concerns.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  previewContainer: {
    width: '100%',
  },
  imageCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: 260,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    flex: 0.8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  optionsContainer: {
    width: '100%',
    gap: 14,
  },
  captureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  captureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  galleryCard: {
    borderColor: Colors.blueAccent || '#1E6FE0',
  },
  galleryCircle: {
    backgroundColor: Colors.blueAccent || '#1E6FE0',
  },
  cameraCaptureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cameraCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  cameraSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  skipCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  skipCardActive: {
    backgroundColor: '#E6F4EA',
    borderColor: Colors.primary,
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  skipSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

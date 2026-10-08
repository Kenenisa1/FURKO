import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { EvidenceUploader } from '../../components/report/EvidenceUploader';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

export const PhotoEvidenceScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoryId = route?.params?.categoryId || 'cat-roads-001';
  const initialPhotoUri = route?.params?.photoUri || null;

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri);
  const [isSkipped, setIsSkipped] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const handleContinue = () => {
    if (!photoUri && !isSkipped) {
      Alert.alert(
        'Photo Evidence',
        'Would you like to take a photo or proceed without one?',
        [
          { text: 'Take Photo', style: 'cancel' },
          {
            text: 'Proceed Without Photo',
            onPress: () => {
              setIsSkipped(true);
              navigation.navigate('LocationCapture', {
                categoryId: category.id,
                photoUri: null,
                isPhotoSkipped: true,
              });
            },
          },
        ]
      );
      return;
    }

    navigation.navigate('LocationCapture', {
      categoryId: category.id,
      photoUri,
      isPhotoSkipped: isSkipped,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 2 of 5</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Centered Category Recap Pill */}
        <View style={styles.categoryPillCenter}>
          <View style={styles.categoryPill}>
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
            <Text style={styles.categoryPillText}>{category.name}</Text>
          </View>
        </View>

        {/* Title & Guidance */}
        <View style={styles.headingGroup}>
          <Text style={styles.title}>Add Photo Evidence</Text>
          <Text style={styles.subtitle}>
            A picture helps Jimma City maintenance crews identify the required materials and machinery before heading to the site.
          </Text>
        </View>

        {/* Civic Photography Tips Collapsible */}
        <TouchableOpacity
          style={styles.tipsToggle}
          onPress={() => setShowTips(!showTips)}
          activeOpacity={0.8}
        >
          <View style={styles.tipsToggleLeft}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" />
            <Text style={styles.tipsToggleText}>Photo capture tips for faster resolution</Text>
          </View>
          <Ionicons
            name={showTips ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>

        {showTips && (
          <View style={styles.tipsCard}>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>1.</Text>
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Close-up:</Text> Clearly display the fault depth or damage.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>2.</Text>
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Context:</Text> Include nearby road edges or utility poles.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipBullet}>3.</Text>
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Safety:</Text> Do not step into hazardous live wires or deep trenches.
              </Text>
            </View>
          </View>
        )}

        {/* Evidence Uploader Component */}
        <View style={styles.uploaderWrapper}>
          <EvidenceUploader
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            isSkipped={isSkipped}
            onToggleSkip={setIsSkipped}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.statusIndicatorRow}>
          <Ionicons
            name={photoUri ? 'checkmark-circle' : isSkipped ? 'ellipse-outline' : 'camera-outline'}
            size={16}
            color={photoUri ? Colors.primary : isSkipped ? '#6B7280' : Colors.accent}
          />
          <Text style={styles.statusIndicatorText}>
            {photoUri
              ? 'Photo ready for attachment'
              : isSkipped
              ? 'Proceeding without photo evidence'
              : 'Take or choose a photo to continue'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueBtn,
            !photoUri && !isSkipped && styles.continueBtnNeutral,
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {photoUri ? 'Continue with Photo →' : isSkipped ? 'Continue without Photo →' : 'Continue →'}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  categoryPillCenter: {
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  headingGroup: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 12,
  },
  tipsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tipsToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 18,
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginRight: 6,
    width: 14,
  },
  tipText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 16,
    flex: 1,
  },
  uploaderWrapper: {
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
    marginBottom: 10,
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
  continueBtnNeutral: {
    backgroundColor: '#374151',
    shadowColor: '#374151',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

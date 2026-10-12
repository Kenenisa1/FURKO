import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

const URGENCY_OPTIONS: {
  level: UrgencyLevel;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}[] = [
  { level: 'low',       label: 'Low',       icon: 'remove-circle-outline', color: '#16A34A', bg: '#DCFCE7' },
  { level: 'medium',    label: 'Medium',    icon: 'alert-circle-outline',  color: '#D97706', bg: '#FEF3C7' },
  { level: 'high',      label: 'High',      icon: 'warning-outline',       color: '#EA580C', bg: '#FFEDD5' },
  { level: 'emergency', label: 'Emergency', icon: 'flash-outline',         color: '#DC2626', bg: '#FEE2E2' },
];

export const ReportDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const categoryId = route?.params?.categoryId || 'cat-roads-001';
  const photoUri = route?.params?.photoUri ?? null;
  const isPhotoSkipped = route?.params?.isPhotoSkipped ?? false;
  const coords = route?.params?.coords;
  const addressText = route?.params?.addressText || 'Jimma City, Oromia';
  const landmark = route?.params?.landmark;

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  const isFormValid = title.trim().length >= 4 && description.trim().length >= 8;

  const handleContinue = () => {
    if (!title.trim() || title.trim().length < 4) {
      Alert.alert('Title Required', 'Please enter a short headline or title (at least 4 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 8) {
      Alert.alert('Description Required', 'Please describe the issue (at least 8 characters).');
      return;
    }

    navigation.navigate('RoutingPreview', {
      categoryId,
      photoUri,
      isPhotoSkipped,
      coords,
      addressText,
      landmark,
      title: title.trim(),
      description: description.trim(),
      urgency,
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
          <Text style={styles.stepBadgeText}>Step 3 of 4: Details</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Centered Category Recap Pill */}
          <View style={styles.categoryPillWrap}>
            <View style={[styles.categoryPill, { borderLeftColor: category.color }]}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryPillText}>{category.name}</Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.headingGroup}>
            <Text style={styles.title}>Describe the Problem</Text>
            <Text style={styles.subtitle}>
              Provide a clear title and brief description so the assigned technicians understand the issue and bring the right equipment.
            </Text>
          </View>

          {/* Title Field */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Problem Title *</Text>
              <Text style={styles.charCount}>{title.length}/80</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Broken water pipe flooding road"
              placeholderTextColor="#9CA3AF"
              maxLength={80}
            />
          </View>

          {/* Description Field */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Detailed Description *</Text>
              <Text style={styles.charCount}>{description.length} chars</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Explain how severe the problem is, how long it has been there, and any safety hazards..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Urgency Level Selector */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Urgency / Hazard Level</Text>
            <Text style={styles.fieldHint}>Help dispatch teams prioritize repair response</Text>

            <View style={styles.urgencyGrid}>
              {URGENCY_OPTIONS.map((opt) => {
                const active = urgency === opt.level;
                return (
                  <TouchableOpacity
                    key={opt.level}
                    style={[
                      styles.urgencyBtn,
                      active && {
                        backgroundColor: opt.bg,
                        borderColor: opt.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setUrgency(opt.level)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={active ? opt.color : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        styles.urgencyBtnText,
                        active && { color: opt.color, fontWeight: '800' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.continueBtn, !isFormValid && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!isFormValid}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              Continue to Routing Preview →
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  fieldHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    marginTop: 2,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  urgencyBtnText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
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
  continueBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

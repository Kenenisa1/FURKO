import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { ProblemCategory, Report } from '../../types';

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
  { level: 'low',       label: 'Low',       icon: 'remove-circle-outline',  color: '#16A34A', bg: '#DCFCE7' },
  { level: 'medium',    label: 'Medium',    icon: 'alert-circle-outline',   color: '#D97706', bg: '#FEF3C7' },
  { level: 'high',      label: 'High',      icon: 'warning-outline',        color: '#EA580C', bg: '#FFEDD5' },
  { level: 'emergency', label: 'Emergency', icon: 'flash-outline',          color: '#DC2626', bg: '#FEE2E2' },
];

// ─── Institution lookup (mirrors RoutingPreviewScreen) ────────────────────────
const INSTITUTION_MAP: Record<string, { short: string; sla: string }> = {
  'cat-roads-001':  { short: 'Road Bureau',       sla: '3–7 days' },
  'cat-water-002':  { short: 'Water Authority',    sla: '1–5 days' },
  'cat-waste-003':  { short: 'Sanitation Office',  sla: '2–5 days' },
  'cat-lighting-004': { short: 'EEU Jimma',        sla: '2–7 days' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const ReviewSubmitScreen: React.FC<Props> = ({ navigation, route }) => {
  // ── Wizard params ──────────────────────────────────────────────────────────
  const categoryId: string     = route?.params?.categoryId  || 'cat-roads-001';
  const subIssue: string | undefined = route?.params?.subIssue;
  const photoUri: string | null      = route?.params?.photoUri ?? null;
  const isPhotoSkipped: boolean      = route?.params?.isPhotoSkipped ?? false;
  const coords: { latitude: number; longitude: number } | undefined = route?.params?.coords;
  const addressText: string | undefined = route?.params?.addressText;
  const landmark: string | undefined   = route?.params?.landmark;

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];
  const institution = INSTITUTION_MAP[categoryId] || { short: 'FURKO Admin', sla: '5–10 days' };

  // ── Form State ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState<string>(subIssue || '');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  // ── UI State ───────────────────────────────────────────────────────────────
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Success animation
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // ── Suggestions (populated from sub-issues of the category) ───────────────
  const suggestions = category.subIssues?.slice(0, 4) || [];

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isFormValid = title.trim().length >= 5 && description.trim().length >= 10;

  const urgentLabel = () => {
    const opt = URGENCY_OPTIONS.find((o) => o.level === urgency)!;
    return { label: opt.label, color: opt.color, bg: opt.bg, icon: opt.icon };
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please write a short title describing the problem.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Missing Description', 'Please describe the problem in at least 10 characters.');
      return;
    }

    Alert.alert(
      'Submit Report?',
      `Your report will be dispatched to ${institution.short}. Continue?`,
      [
        { text: 'Review Again', style: 'cancel' },
        {
          text: 'Submit',
          style: 'default',
          onPress: () => doSubmit(),
        },
      ]
    );
  };

  const doSubmit = async () => {
    setIsSubmitting(true);
    try {
      const report = await ReportsApi.submitReport({
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        latitude: coords?.latitude ?? 7.6734,
        longitude: coords?.longitude ?? 36.8344,
        address_text: addressText || 'Jimma City, Oromia Region',
        landmark: landmark?.trim() || undefined,
        photo_url: photoUri || undefined,
        urgency,
        sub_issue: subIssue,
      });
      setIsSubmitting(false);
      setSubmittedReport(report);

      // Animate the success screen in
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setIsSubmitting(false);
      Alert.alert('Submission Failed', 'Could not send your report. Please try again.');
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submittedReport) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <Animated.View
          style={[
            styles.successScreen,
            { transform: [{ scale: successScale }], opacity: successOpacity },
          ]}
        >
          {/* Check icon */}
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={44} color="#fff" />
            </View>
          </View>

          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successSubtitle}>
            Your civic report has been dispatched to{' '}
            <Text style={{ fontWeight: '800' }}>{institution.short}</Text>.
          </Text>

          {/* Tracking number card */}
          <View style={styles.trackingCard}>
            <Text style={styles.trackingLabel}>Tracking Number</Text>
            <Text style={styles.trackingNumber}>{submittedReport.tracking_number}</Text>
            <Text style={styles.trackingHint}>
              Use this number to follow your report's progress in "My Reports"
            </Text>
          </View>

          {/* Timeline preview */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
              <View>
                <Text style={styles.timelineStep}>Submitted</Text>
                <Text style={styles.timelineTime}>Just now</Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#D1D5DB' }]} />
              <View>
                <Text style={[styles.timelineStep, { color: '#9CA3AF' }]}>Under Review</Text>
                <Text style={styles.timelineTime}>Expected within {institution.sla}</Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#D1D5DB' }]} />
              <View>
                <Text style={[styles.timelineStep, { color: '#9CA3AF' }]}>Resolved</Text>
                <Text style={styles.timelineTime}>After field work is complete</Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => {
                navigation.navigate('ReportsTab');
              }}
            >
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
              <Text style={styles.trackBtnText}>View My Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="home" size={18} color="#fff" />
              <Text style={styles.homeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── Main Review & Submit Form ───────────────────────────────────────────────
  const urg = urgentLabel();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle}>Review & Submit</Text>
          <Text style={styles.headerSub}>Step 5 of 5 — Final Details</Text>
        </View>
        <View style={styles.stepDots}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[styles.dot, s === 5 && styles.dotActive, s < 5 && styles.dotDone]}
            />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Wizard Summary (collapsible) ── */}
          <TouchableOpacity
            style={styles.summaryToggle}
            onPress={() => setSummaryExpanded((v) => !v)}
            activeOpacity={0.85}
          >
            <View style={styles.summaryToggleLeft}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={Colors.primary} />
              <Text style={styles.summaryToggleText}>Report Summary</Text>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>
                  {[
                    category.name,
                    addressText ? 'Location ✓' : null,
                    photoUri ? 'Photo ✓' : null,
                  ]
                    .filter(Boolean)
                    .length}{' '}
                  of 3 collected
                </Text>
              </View>
            </View>
            <Ionicons
              name={summaryExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6B7280"
            />
          </TouchableOpacity>

          {summaryExpanded && (
            <View style={styles.summaryPanel}>
              {/* Category */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemEmoji}>{category.icon}</Text>
                <View style={styles.summaryItemBody}>
                  <Text style={styles.summaryItemLabel}>Category</Text>
                  <Text style={styles.summaryItemValue}>{category.name}</Text>
                  {subIssue && (
                    <View style={[styles.pill, { backgroundColor: category.color + '18' }]}>
                      <Text style={[styles.pillText, { color: category.color }]}>{subIssue}</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </View>

              <View style={styles.summaryDivider} />

              {/* Photo */}
              <View style={styles.summaryItem}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.summaryThumb} />
                ) : (
                  <View style={styles.summaryPhotoPlaceholder}>
                    <Ionicons
                      name={isPhotoSkipped ? 'image-outline' : 'camera-outline'}
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                )}
                <View style={styles.summaryItemBody}>
                  <Text style={styles.summaryItemLabel}>Photo</Text>
                  <Text style={styles.summaryItemValue}>
                    {photoUri ? 'Attached' : isPhotoSkipped ? 'Skipped' : 'None'}
                  </Text>
                </View>
                <Ionicons
                  name={photoUri ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={photoUri ? '#16A34A' : '#D1D5DB'}
                />
              </View>

              <View style={styles.summaryDivider} />

              {/* Location */}
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="location" size={16} color="#1E40AF" />
                </View>
                <View style={styles.summaryItemBody}>
                  <Text style={styles.summaryItemLabel}>Location</Text>
                  <Text style={styles.summaryItemValue} numberOfLines={2}>
                    {addressText || 'Jimma City, Oromia'}
                  </Text>
                  {landmark ? <Text style={styles.summaryItemSub}>📍 {landmark}</Text> : null}
                </View>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </View>

              <View style={styles.summaryDivider} />

              {/* Routing */}
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconBox, { backgroundColor: Colors.primary + '15' }]}>
                  <MaterialCommunityIcons name="office-building" size={16} color={Colors.primary} />
                </View>
                <View style={styles.summaryItemBody}>
                  <Text style={styles.summaryItemLabel}>Routed to</Text>
                  <Text style={styles.summaryItemValue}>{institution.short}</Text>
                  <Text style={styles.summaryItemSub}>Expected: {institution.sla}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </View>
            </View>
          )}

          {/* ── Title ── */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>
              Report Title <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldHint}>
              A short, clear headline — e.g. "Deep pothole on Aba Jifar Road"
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                title.length > 0 && title.trim().length < 5 && styles.inputError,
              ]}
              placeholder="Describe the problem in one sentence…"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="done"
            />
            <Text
              style={[
                styles.charCount,
                title.trim().length < 5 && title.length > 0 && styles.charCountError,
              ]}
            >
              {title.length}/80{title.trim().length < 5 && title.length > 0 ? ' — min 5 chars' : ''}
            </Text>

            {/* Quick suggestions */}
            {suggestions.length > 0 && (
              <View>
                <Text style={styles.suggestionsLabel}>Quick suggestions:</Text>
                <View style={styles.suggestionsRow}>
                  {suggestions.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.suggestionPill,
                        title === s && { backgroundColor: category.color + '20', borderColor: category.color },
                      ]}
                      onPress={() => setTitle(s)}
                    >
                      <Text
                        style={[
                          styles.suggestionPillText,
                          title === s && { color: category.color },
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* ── Description ── */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fieldHint}>
              Explain clearly — when did it start? Is it dangerous? How many people are affected?
            </Text>
            <TextInput
              style={[
                styles.descriptionInput,
                description.length > 0 && description.trim().length < 10 && styles.inputError,
              ]}
              placeholder="e.g. The pothole has been getting worse for 2 weeks, vehicles are swerving into oncoming traffic…"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              multiline
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.charCount,
                description.trim().length < 10 && description.length > 0 && styles.charCountError,
              ]}
            >
              {description.length}/500
              {description.trim().length < 10 && description.length > 0 ? ' — min 10 chars' : ''}
            </Text>
          </View>

          {/* ── Urgency ── */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Urgency Level</Text>
            <Text style={styles.fieldHint}>
              How urgent is this for public safety or daily life?
            </Text>
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
                        active && { color: opt.color, fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Current urgency banner */}
            <View style={[styles.urgencyBanner, { backgroundColor: urg.bg, borderColor: urg.color + '60' }]}>
              <Ionicons name={urg.icon} size={14} color={urg.color} />
              <Text style={[styles.urgencyBannerText, { color: urg.color }]}>
                {urgency === 'emergency'
                  ? 'Emergency — will be escalated within 24 hours'
                  : urgency === 'high'
                  ? 'High priority — flagged for faster dispatch'
                  : urgency === 'medium'
                  ? 'Standard priority — typical response time'
                  : 'Low priority — scheduled in normal queue'}
              </Text>
            </View>
          </View>

          {/* ── Final Declaration ── */}
          <View style={styles.declarationBox}>
            <Feather name="shield" size={13} color="#6B7280" />
            <Text style={styles.declarationText}>
              By submitting, you confirm this report is accurate. False reports may be rejected.
              Your identity is kept private from the public.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ── Sticky Footer ── */}
        <View style={styles.footer}>
          {/* Readiness indicators */}
          <View style={styles.readinessRow}>
            <View style={styles.readinessItem}>
              <Ionicons
                name={title.trim().length >= 5 ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={title.trim().length >= 5 ? '#16A34A' : '#D1D5DB'}
              />
              <Text
                style={[
                  styles.readinessLabel,
                  title.trim().length >= 5 && styles.readinessLabelDone,
                ]}
              >
                Title
              </Text>
            </View>
            <View style={styles.readinessItem}>
              <Ionicons
                name={description.trim().length >= 10 ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={description.trim().length >= 10 ? '#16A34A' : '#D1D5DB'}
              />
              <Text
                style={[
                  styles.readinessLabel,
                  description.trim().length >= 10 && styles.readinessLabelDone,
                ]}
              >
                Description
              </Text>
            </View>
            <View style={styles.readinessItem}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.readinessLabelDone}>Location</Text>
            </View>
            <View style={styles.readinessItem}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.readinessLabelDone}>Routing</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="paper-plane" size={18} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Submitting…' : 'Submit Report to FURKO'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  // ── Header ──────────────────────────────────────────────────────────────────
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
  headerMid: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  stepDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotDone: { backgroundColor: Colors.primary },
  dotActive: { width: 16, backgroundColor: Colors.primary, borderRadius: 3 },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  // ── Summary toggle ───────────────────────────────────────────────────────────
  summaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  summaryToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryToggleText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  summaryBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  summaryBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },

  // ── Summary panel ────────────────────────────────────────────────────────────
  summaryPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryThumb: { width: 36, height: 36, borderRadius: 8 },
  summaryPhotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryItemEmoji: { fontSize: 22, width: 36, textAlign: 'center' },
  summaryItemBody: { flex: 1 },
  summaryItemLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  summaryItemValue: { fontSize: 13, color: '#111827', fontWeight: '600', lineHeight: 18 },
  summaryItemSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6' },
  pill: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },
  pillText: { fontSize: 11, fontWeight: '600' },

  // ── Field cards ───────────────────────────────────────────────────────────────
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldLabel: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 3 },
  required: { color: '#EF4444' },
  fieldHint: { fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 17 },

  // Title input
  titleInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  inputError: { borderColor: '#FCA5A5' },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  charCountError: { color: '#EF4444' },

  // Suggestions
  suggestionsLabel: { fontSize: 11, color: '#6B7280', marginTop: 10, marginBottom: 6 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggestionPill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  suggestionPillText: { fontSize: 12, color: '#374151' },

  // Description input
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 110,
    lineHeight: 20,
  },

  // Urgency
  urgencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
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
  urgencyBtnText: { fontSize: 13, color: '#9CA3AF' },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  urgencyBannerText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // Declaration
  declarationBox: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  declarationText: { flex: 1, fontSize: 11, color: '#9CA3AF', lineHeight: 16 },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    gap: 10,
  },
  readinessRow: { flexDirection: 'row', justifyContent: 'space-around' },
  readinessItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readinessLabel: { fontSize: 11, color: '#D1D5DB' },
  readinessLabelDone: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  // ── Success Screen ───────────────────────────────────────────────────────────
  successScreen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIconInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  trackingCard: {
    width: '100%',
    backgroundColor: Colors.primary + '0D',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  trackingLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, letterSpacing: 0.8 },
  trackingNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
    marginVertical: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  trackingHint: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 17 },

  // Timeline
  timelineCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 24,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineConnector: { width: 2, height: 20, backgroundColor: '#E5E7EB', marginLeft: 5, marginVertical: 2 },
  timelineStep: { fontSize: 13, fontWeight: '700', color: '#111827' },
  timelineTime: { fontSize: 11, color: '#6B7280', marginTop: 1 },

  // Success actions
  successActions: { width: '100%', gap: 10 },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primary + '08',
  },
  trackBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

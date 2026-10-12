import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { ProblemCategory, Report } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

// ─── Routing & SLA configuration per category ─────────────────────────────────
interface RoutingConfig {
  institution: string;
  institutionShort: string;
  institutionCode: string;
  department: string;
  phone: string;
  slaLabel: string;
  slaDays: string;
  processSteps: string[];
  escalationNote: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

const ROUTING_CONFIG: Record<string, RoutingConfig> = {
  'cat-roads-001': {
    institution: 'Jimma City Road & Infrastructure Development Bureau',
    institutionShort: 'Road Bureau',
    institutionCode: 'JCRIDB',
    department: 'Maintenance & Repair Division',
    phone: '+251 471 11 00 00',
    slaLabel: '3–7 Working Days',
    slaDays: '3–7',
    processSteps: [
      'Ticket dispatched to Road Bureau active inbox',
      'Site inspector assigned for survey',
      'Road repair work crew deployed',
      'Completed with photographic evidence',
    ],
    escalationNote: 'Emergency road hazards are escalated within 24 hours.',
    icon: 'construct-outline',
    iconColor: '#92400E',
    iconBg: '#FEF3C7',
  },
  'cat-water-002': {
    institution: 'Jimma City Water & Sewerage Authority',
    institutionShort: 'Water Authority',
    institutionCode: 'JCWSA',
    department: 'Network Operations Center',
    phone: '+251 471 11 10 00',
    slaLabel: '1–5 Working Days',
    slaDays: '1–5',
    processSteps: [
      'Ticket dispatched to JCWSA operations center',
      'Water utility technician assigned',
      'Pipe/leak repair work initiated',
      'Water pressure and service restored',
    ],
    escalationNote: 'Pipe bursts and sewage overflow are emergency-flagged (< 24 h).',
    icon: 'water-outline',
    iconColor: '#1E40AF',
    iconBg: '#DBEAFE',
  },
  'cat-waste-003': {
    institution: 'Jimma City Sanitation & Waste Management Office',
    institutionShort: 'Sanitation Office',
    institutionCode: 'JCSWMO',
    department: 'Collection & Disposal Unit',
    phone: '+251 471 11 20 00',
    slaLabel: '2–5 Working Days',
    slaDays: '2–5',
    processSteps: [
      'Ticket dispatched to Sanitation Office inbox',
      'Nearest neighborhood cleanup crew notified',
      'Debris collected and area sanitized',
      'Ticket closed with photo proof',
    ],
    escalationNote: 'Hazardous and medical waste is treated as priority (< 48 h).',
    icon: 'trash-outline',
    iconColor: '#065F46',
    iconBg: '#D1FAE5',
  },
  'cat-lighting-004': {
    institution: 'Ethiopian Electric Utility (EEU) – Jimma Branch',
    institutionShort: 'EEU Jimma',
    institutionCode: 'EEU-JMM',
    department: 'Distribution & Street Lighting Unit',
    phone: '+251 471 11 30 00',
    slaLabel: '2–7 Working Days',
    slaDays: '2–7',
    processSteps: [
      'Ticket dispatched to EEU Jimma Branch inbox',
      'Linesman and electrical technician assigned',
      'Transformer or streetlight lamp replaced',
      'Power restored and verified',
    ],
    escalationNote: 'Dangling high-voltage wires and sparks are escalated immediately.',
    icon: 'flash-outline',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
};

export const RoutingPreviewScreen: React.FC<Props> = ({ navigation, route }) => {
  // Params from wizard chain
  const categoryId: string = route?.params?.categoryId || 'cat-roads-001';
  const photoUri: string | null = route?.params?.photoUri ?? null;
  const isPhotoSkipped: boolean = route?.params?.isPhotoSkipped ?? false;
  const coords = route?.params?.coords || { latitude: 7.6734, longitude: 36.8344 };
  const addressText: string = route?.params?.addressText || 'Jimma City, Oromia Region';
  const landmark: string | undefined = route?.params?.landmark;
  const title: string = route?.params?.title || 'Civic Infrastructure Report';
  const description: string = route?.params?.description || '';
  const urgency = (route?.params?.urgency as 'low' | 'medium' | 'high' | 'emergency') || 'medium';

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];
  const routing = ROUTING_CONFIG[categoryId] || ROUTING_CONFIG['cat-roads-001'];

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  // Animations
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Success animations
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 70,
        friction: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 6, duration: 600, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newReport = await ReportsApi.submitReport({
        category_id: category.id,
        title: title.trim(),
        description: description.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        address_text: addressText,
        landmark: landmark?.trim() || undefined,
        photo_url: photoUri || undefined,
        urgency,
      });

      setIsSubmitting(false);
      setSubmittedReport(newReport);

      // Animate success screen in
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
      Alert.alert(
        'Submission Failed',
        'Could not dispatch your report to FURKO. Please check your internet connection and try again.'
      );
    }
  };

  // ── SUCCESS SCREEN (Step 5 Result) ──────────────────────────────────────────
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
          {/* Animated Green Badge */}
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.successTitle}>Report Dispatched!</Text>
          <Text style={styles.successSubtitle}>
            Your civic report was delivered directly to{' '}
            <Text style={{ fontWeight: '800', color: Colors.primaryDark }}>
              {submittedReport.institution_name || routing.institutionShort}
            </Text>
            .
          </Text>

          {/* Tracking Ticket Pill */}
          <View style={styles.trackingCard}>
            <Text style={styles.trackingLabel}>TICKET TRACKING NUMBER</Text>
            <Text style={styles.trackingNumber}>{submittedReport.tracking_number}</Text>
            <Text style={styles.trackingHint}>
              Keep this number to track your report progress anytime in "Reports".
            </Text>
          </View>

          {/* Next steps timeline */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.primary }]} />
              <View>
                <Text style={styles.timelineStep}>Submitted</Text>
                <Text style={styles.timelineTime}>Ticket queued for public bureau</Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#D1D5DB' }]} />
              <View>
                <Text style={[styles.timelineStep, { color: '#9CA3AF' }]}>Under Review</Text>
                <Text style={styles.timelineTime}>Direct inbox SLA: {routing.slaLabel}</Text>
              </View>
            </View>
            <View style={styles.timelineConnector} />
            <View style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: '#D1D5DB' }]} />
              <View>
                <Text style={[styles.timelineStep, { color: '#9CA3AF' }]}>Resolution</Text>
                <Text style={styles.timelineTime}>Fixed with photo completion proof</Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => {
                const repId = submittedReport.id;
                setSubmittedReport(null);
                navigation.replace('ReportDetail', { reportId: repId });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
              <Text style={styles.trackBtnText}>Track Ticket Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => {
                setSubmittedReport(null);
                navigation.navigate('MainTabs');
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="home" size={18} color="#FFFFFF" />
              <Text style={styles.homeBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ── ROUTING PREVIEW (Step 4) ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle}>Routing Preview</Text>
          <Text style={styles.headerSub}>Step 4 of 4 — Review & Direct Dispatch</Text>
        </View>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Final Step</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Dispatch Flow Diagram ── */}
        <Animated.View
          style={[
            styles.dispatchCard,
            { transform: [{ scale: cardScale }], opacity: cardOpacity },
          ]}
        >
          {/* Top row: Citizen → FURKO → Institution */}
          <View style={styles.dispatchRow}>
            {/* Citizen block */}
            <View style={styles.dispatchBlock}>
              <View style={[styles.dispatchIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={22} color="#1E40AF" />
              </View>
              <Text style={styles.dispatchLabel}>Citizen</Text>
              <Text style={styles.dispatchSub}>You</Text>
            </View>

            {/* Arrow + FURKO routing middleware */}
            <View style={styles.arrowWrapper}>
              <Animated.View style={{ transform: [{ translateX: arrowAnim }] }}>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </Animated.View>
              <View style={styles.furkoChip}>
                <Text style={styles.furkoChipText}>FURKO</Text>
              </View>
              <Animated.View style={{ transform: [{ translateX: arrowAnim }] }}>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </Animated.View>
            </View>

            {/* Institution block */}
            <View style={styles.dispatchBlock}>
              <View style={[styles.dispatchIcon, { backgroundColor: routing.iconBg }]}>
                <Ionicons name={routing.icon} size={22} color={routing.iconColor} />
              </View>
              <Text style={styles.dispatchLabel} numberOfLines={2}>
                {routing.institutionShort}
              </Text>
              <Text style={styles.dispatchSub}>{routing.institutionCode}</Text>
            </View>
          </View>

          {/* Institution detail banner */}
          <View style={[styles.institutionBanner, { borderLeftColor: category.color }]}>
            <View style={styles.institutionBannerHeader}>
              <Ionicons name="business" size={16} color={category.color} />
              <Text style={[styles.institutionBannerTitle, { color: category.color }]}>
                Assigned Public Bureau
              </Text>
            </View>
            <Text style={styles.institutionName}>{routing.institution}</Text>
            <Text style={styles.institutionDept}>{routing.department}</Text>
            <View style={styles.institutionContact}>
              <Ionicons name="call-outline" size={13} color="#6B7280" />
              <Text style={styles.institutionPhone}>{routing.phone}</Text>
            </View>
          </View>

          {/* SLA badge */}
          <View style={styles.slaBadgeRow}>
            <View style={styles.slaBadge}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.slaBadgeLabel}>Expected Bureau Response:</Text>
              <Text style={styles.slaBadgeValue}>{routing.slaLabel}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Report Summary ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Summary</Text>
          <View style={styles.summaryCard}>
            {/* Title & Description row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Problem Title</Text>
                <Text style={styles.summaryRowValue}>{title}</Text>
                {description ? (
                  <Text style={styles.summaryRowDesc} numberOfLines={3}>
                    {description}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {/* Category row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                <Text style={styles.summaryEmoji}>
                  {category.key === 'roads'
                    ? '🚧'
                    : category.key === 'water'
                    ? '💧'
                    : category.key === 'waste'
                    ? '🗑️'
                    : '💡'}
                </Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Category</Text>
                <Text style={styles.summaryRowValue}>{category.name}</Text>
                {category.nameLocal && (
                  <Text style={styles.summaryRowSub}>{category.nameLocal}</Text>
                )}
              </View>
              <View style={[styles.summaryCheck, { backgroundColor: category.color + '20' }]}>
                <Ionicons name="checkmark" size={14} color={category.color} />
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {/* Location row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                <Ionicons name="location" size={20} color={Colors.primary} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Location</Text>
                <Text style={styles.summaryRowValue} numberOfLines={2}>
                  {addressText}
                </Text>
                {landmark ? (
                  <Text style={styles.summaryRowSub}>📍 {landmark}</Text>
                ) : null}
              </View>
              <View style={[styles.summaryCheck, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark" size={14} color="#059669" />
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {/* Live Camera Photo row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.summaryThumb} />
                ) : (
                  <Ionicons
                    name={isPhotoSkipped ? 'image-outline' : 'camera-outline'}
                    size={20}
                    color={isPhotoSkipped ? '#9CA3AF' : '#D97706'}
                  />
                )}
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Photo Evidence (Camera)</Text>
                <Text
                  style={[
                    styles.summaryRowValue,
                    !photoUri && { color: isPhotoSkipped ? '#9CA3AF' : '#D97706' },
                  ]}
                >
                  {photoUri
                    ? 'Live Camera Photo Attached ✓'
                    : isPhotoSkipped
                    ? 'Skipped (Night/Safety)'
                    : 'No photo'}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryCheck,
                  { backgroundColor: photoUri ? '#D1FAE5' : '#F3F4F6' },
                ]}
              >
                <Ionicons
                  name={photoUri ? 'checkmark' : 'remove'}
                  size={14}
                  color={photoUri ? '#059669' : '#9CA3AF'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Process Steps ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens After Submission</Text>
          {routing.processSteps.map((step, i) => (
            <View key={i} style={styles.processStep}>
              <View style={styles.processStepLeft}>
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: i === 0 ? Colors.primary : '#E5E7EB' },
                  ]}
                >
                  <Text style={[styles.stepNum, { color: i === 0 ? '#FFFFFF' : '#9CA3AF' }]}>
                    {i + 1}
                  </Text>
                </View>
                {i < routing.processSteps.length - 1 && <View style={styles.stepConnector} />}
              </View>
              <Text style={[styles.stepText, i === 0 && styles.stepTextActive]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Submit Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Dispatching to Office...' : 'Submit & Dispatch Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
  stepBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Dispatch card
  dispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  dispatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#F9FAFB',
  },
  dispatchBlock: { alignItems: 'center', flex: 1 },
  dispatchIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dispatchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  dispatchSub: { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  arrowWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  furkoChip: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  furkoChipText: { fontSize: 10, fontWeight: '800', color: Colors.primary },

  institutionBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  institutionBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  institutionBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  institutionName: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  institutionDept: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  institutionContact: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  institutionPhone: { fontSize: 12, color: '#374151', fontWeight: '500' },

  slaBadgeRow: { paddingHorizontal: 16, paddingBottom: 16 },
  slaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '12',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  slaBadgeLabel: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
  slaBadgeValue: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  summaryIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmoji: { fontSize: 18 },
  summaryContent: { flex: 1 },
  summaryRowLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 2 },
  summaryRowValue: { fontSize: 13, color: '#111827', fontWeight: '700', lineHeight: 18 },
  summaryRowDesc: { fontSize: 12, color: '#4B5563', marginTop: 2, lineHeight: 16 },
  summaryRowSub: { fontSize: 11, color: '#008744', marginTop: 2, fontWeight: '600' },
  summaryThumb: { width: 34, height: 34, borderRadius: 6 },
  summaryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6' },

  processStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  processStepLeft: { alignItems: 'center', width: 28, marginRight: 10 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 11, fontWeight: '800' },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    paddingTop: 2,
    paddingBottom: 16,
  },
  stepTextActive: { color: '#111827', fontWeight: '600' },

  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  submitBtn: {
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  // Success screen
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  successIconOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  trackingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  trackingNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  trackingHint: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineConnector: {
    width: 2,
    height: 14,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 2,
  },
  timelineStep: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  timelineTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  successActions: {
    width: '100%',
    gap: 10,
    marginTop: 24,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E6F4EA',
    paddingVertical: 14,
    borderRadius: 12,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

import React, { useRef, useEffect } from 'react';
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

// ─── Routing & SLA config per category ────────────────────────────────────────
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
      'Ticket dispatched to Road Bureau inbox',
      'Inspector assigned & site visit scheduled',
      'Repair work ordered and carried out',
      'Completion confirmed with photo proof',
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
      'Water technician assigned to report',
      'On-site inspection and repair initiated',
      'Water supply restored and report closed',
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
      'Ticket dispatched to Sanitation Office',
      'Nearest collection crew notified',
      'Site visit and debris cleared',
      'Sanitation report closed with photo',
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
    department: 'Distribution & Street Lighting',
    phone: '+251 471 11 30 00',
    slaLabel: '2–7 Working Days',
    slaDays: '2–7',
    processSteps: [
      'Ticket dispatched to EEU Jimma Branch',
      'Electrical team assigned to fault',
      'Site inspection and repair carried out',
      'Light restored and closure confirmed',
    ],
    escalationNote: 'Dangling wires and sparking transformers are escalated immediately.',
    icon: 'flash-outline',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export const RoutingPreviewScreen: React.FC<Props> = ({ navigation, route }) => {
  // Params from wizard chain
  const categoryId: string = route?.params?.categoryId || 'cat-roads-001';
  const subIssue: string | undefined = route?.params?.subIssue;
  const photoUri: string | null = route?.params?.photoUri ?? null;
  const isPhotoSkipped: boolean = route?.params?.isPhotoSkipped ?? false;
  const coords: { latitude: number; longitude: number } | undefined = route?.params?.coords;
  const addressText: string | undefined = route?.params?.addressText;
  const landmark: string | undefined = route?.params?.landmark;

  const category: ProblemCategory =
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[0];

  const routing = ROUTING_CONFIG[categoryId] || ROUTING_CONFIG['cat-roads-001'];

  // ─── Animations ─────────────────────────────────────────────────────────
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance
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

    // Arrow bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 6, duration: 600, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ─── Navigate to Review & Submit (Step 5) ───────────────────────────────
  const handleProceed = () => {
    navigation.navigate('ReviewSubmit', {
      categoryId,
      subIssue,
      photoUri,
      isPhotoSkipped,
      coords,
      addressText,
      landmark,
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle}>Routing Preview</Text>
          <Text style={styles.headerSub}>Step 4 of 5 — Review & Dispatch</Text>
        </View>
        <View style={styles.stepDots}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View
              key={s}
              style={[styles.dot, s === 4 && styles.dotActive, s < 4 && styles.dotDone]}
            />
          ))}
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
          {/* Top row: Citizen → Institution */}
          <View style={styles.dispatchRow}>
            {/* Citizen block */}
            <View style={styles.dispatchBlock}>
              <View style={[styles.dispatchIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person" size={22} color="#1E40AF" />
              </View>
              <Text style={styles.dispatchLabel}>You</Text>
              <Text style={styles.dispatchSub}>Citizen</Text>
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

          {/* Institution detail */}
          <View style={[styles.institutionBanner, { borderLeftColor: category.color }]}>
            <View style={styles.institutionBannerHeader}>
              <Ionicons name="business" size={16} color={category.color} />
              <Text style={[styles.institutionBannerTitle, { color: category.color }]}>
                Assigned Institution
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
              <Ionicons name="time-outline" size={15} color={Colors.primary} />
              <Text style={styles.slaBadgeLabel}>Expected Response</Text>
              <Text style={styles.slaBadgeValue}>{routing.slaLabel}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Process Steps ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens Next</Text>
          {routing.processSteps.map((step, i) => (
            <View key={i} style={styles.processStep}>
              <View style={styles.processStepLeft}>
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: i === 0 ? Colors.primary : '#E5E7EB' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNum,
                      { color: i === 0 ? '#fff' : '#9CA3AF' },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>
                {i < routing.processSteps.length - 1 && (
                  <View style={styles.stepConnector} />
                )}
              </View>
              <Text
                style={[
                  styles.stepText,
                  i === 0 && styles.stepTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
          {/* Escalation note */}
          <View style={styles.escalationNote}>
            <Ionicons name="alert-circle-outline" size={14} color="#D97706" />
            <Text style={styles.escalationText}>{routing.escalationNote}</Text>
          </View>
        </View>

        {/* ── Report Summary ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Report Summary</Text>
          <View style={styles.summaryCard}>
            {/* Category row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                <Text style={styles.summaryEmoji}>{category.icon}</Text>
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Category</Text>
                <Text style={styles.summaryRowValue}>{category.name}</Text>
                {subIssue && (
                  <View style={[styles.subIssuePill, { backgroundColor: category.color + '18' }]}>
                    <Text style={[styles.subIssuePillText, { color: category.color }]}>
                      {subIssue}
                    </Text>
                  </View>
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
                <Ionicons name="location" size={18} color={Colors.primary} />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Location</Text>
                <Text style={styles.summaryRowValue} numberOfLines={2}>
                  {addressText || 'Jimma City, Oromia Region'}
                </Text>
                {landmark ? (
                  <Text style={styles.summaryRowSub}>📍 {landmark}</Text>
                ) : null}
                {coords && (
                  <Text style={styles.summaryCoords}>
                    {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                  </Text>
                )}
              </View>
              <View style={[styles.summaryCheck, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark" size={14} color="#059669" />
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {/* Photo row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconWrap}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.summaryThumb} />
                ) : (
                  <Ionicons
                    name={isPhotoSkipped ? 'image-outline' : 'camera-outline'}
                    size={18}
                    color={isPhotoSkipped ? '#9CA3AF' : '#D97706'}
                  />
                )}
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryRowLabel}>Photo Evidence</Text>
                <Text
                  style={[
                    styles.summaryRowValue,
                    !photoUri && { color: isPhotoSkipped ? '#9CA3AF' : '#D97706' },
                  ]}
                >
                  {photoUri
                    ? 'Photo attached ✓'
                    : isPhotoSkipped
                    ? 'Skipped (optional)'
                    : 'No photo added'}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryCheck,
                  {
                    backgroundColor: photoUri
                      ? '#D1FAE5'
                      : isPhotoSkipped
                      ? '#F3F4F6'
                      : '#FEF3C7',
                  },
                ]}
              >
                <Ionicons
                  name={photoUri ? 'checkmark' : isPhotoSkipped ? 'remove' : 'alert'}
                  size={14}
                  color={
                    photoUri ? '#059669' : isPhotoSkipped ? '#9CA3AF' : '#D97706'
                  }
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Privacy Note ── */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
          <Text style={styles.privacyText}>
            Your name and contact details are never shared publicly. FURKO passes only the
            technical report to the assigned institution.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.editBtnText}>Edit Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedBtnText}>Confirm & Write Report</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

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
  headerMid: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerSub: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  stepDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotDone: { backgroundColor: Colors.primary },
  dotActive: { width: 16, backgroundColor: Colors.primary, borderRadius: 3 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  // ── Dispatch Card ──────────────────────────────────────────────────────────
  dispatchCard: {
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  dispatchBlock: { alignItems: 'center', flex: 1 },
  dispatchIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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

  // Institution banner
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
    letterSpacing: 0.5,
  },
  institutionName: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  institutionDept: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  institutionContact: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  institutionPhone: { fontSize: 12, color: '#374151', fontWeight: '500' },

  // SLA badge
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

  // ── Sections ──────────────────────────────────────────────────────────────
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  // Process steps
  processStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  processStepLeft: { alignItems: 'center', width: 32, marginRight: 12 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 12, fontWeight: '800' },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    paddingTop: 3,
    paddingBottom: 20,
  },
  stepTextActive: { color: '#111827', fontWeight: '600' },
  escalationNote: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'flex-start',
  },
  escalationText: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 17 },

  // ── Report Summary ─────────────────────────────────────────────────────────
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmoji: { fontSize: 20 },
  summaryContent: { flex: 1 },
  summaryRowLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 3 },
  summaryRowValue: { fontSize: 13, color: '#111827', fontWeight: '600', lineHeight: 18 },
  summaryRowSub: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  summaryCoords: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  subIssuePill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 5,
  },
  subIssuePillText: { fontSize: 11, fontWeight: '600' },
  summaryCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  summaryDivider: { height: 1, backgroundColor: '#F3F4F6' },
  summaryThumb: { width: 32, height: 32, borderRadius: 6 },

  // Privacy note
  privacyNote: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  privacyText: { flex: 1, fontSize: 12, color: '#9CA3AF', lineHeight: 17 },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.primary + '08',
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  proceedBtn: {
    flex: 1,
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
  proceedBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

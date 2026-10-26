import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { STATUS_META, PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { Report, ReportStatus } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

// Visual stepper status order
const STEPPER_STAGES: { status: ReportStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'submitted', label: 'Submitted', icon: 'paper-plane-outline' },
  { status: 'under_review', label: 'In Review', icon: 'search-outline' },
  { status: 'in_progress', label: 'In Progress', icon: 'construct-outline' },
  { status: 'resolved', label: 'Resolved', icon: 'checkmark-circle-outline' },
];

export const ReportDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const reportId = route?.params?.reportId;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reopen Modal state
  const [reopenModalVisible, setReopenModalVisible] = useState(false);
  const [reopenComment, setReopenComment] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Lightbox Zoom Modal state
  const [lightboxImage, setLightboxImage] = useState<{ uri: string; title: string } | null>(null);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = () => {
    setLoading(true);
    ReportsApi.getReportById(reportId)
      .then((res) => {
        if (res) {
          setReport(res);
          if (res.user_rating) {
            setRating(res.user_rating);
            setFeedbackSubmitted(true);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSendFeedback = async () => {
    if (!report) return;
    setSubmittingFeedback(true);
    try {
      await ReportsApi.submitFeedback(report.id, {
        rating,
        comment: feedbackComment.trim(),
      });
      setFeedbackSubmitted(true);
      Alert.alert('Feedback Recorded', 'Thank you for rating the service resolution!');
    } catch {
      Alert.alert('Error', 'Could not submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopen = async () => {
    if (!report) return;
    if (!reopenComment.trim()) {
      Alert.alert('Details Required', 'Please explain why this issue is not resolved.');
      return;
    }

    setSubmittingReopen(true);
    try {
      const updated = await ReportsApi.reopenReport(report.id, reopenComment.trim());
      setReport(updated);
      setReopenModalVisible(false);
      setReopenComment('');
      Alert.alert('Report Reopened', 'The ticket has been placed back in the active queue for investigation.');
    } catch {
      Alert.alert('Error', 'Could not reopen report. Please try again.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#6B7280' }}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[report.status] || STATUS_META.submitted;
  const cat = PROBLEM_CATEGORIES.find((c) => c.id === report.category_id);

  const evidencePhotos: string[] =
    report.evidence_photos && report.evidence_photos.length > 0
      ? report.evidence_photos
      : report.photo_url
      ? [report.photo_url]
      : [];

  const resolutionPhotos: string[] =
    report.resolution_photos && report.resolution_photos.length > 0
      ? report.resolution_photos
      : report.proof_photo_url
      ? [report.proof_photo_url]
      : [];

  // Stepper calculations
  const getStageIndex = (st: ReportStatus) => {
    switch (st) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'in_progress': return 2;
      case 'resolved': return 3;
      case 'reopened': return 2; // Treat reopened as active queue (between review & in_progress)
      case 'rejected': return -1;
      default: return 0;
    }
  };
  const currentStageIdx = getStageIndex(report.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTracking}>{report.tracking_number}</Text>
          <Text style={styles.headerSub}>{report.category_name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Card Banner */}
        <View style={[styles.statusBanner, { backgroundColor: meta.bg, borderColor: meta.color + '40' }]}>
          <View style={styles.statusBannerHeader}>
            <View style={[styles.statusIconCircle, { backgroundColor: meta.color }]}>
              <Ionicons
                name={
                  report.status === 'resolved'
                    ? 'checkmark'
                    : report.status === 'reopened'
                    ? 'refresh'
                    : report.status === 'rejected'
                    ? 'close'
                    : 'sync'
                }
                size={16}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerLabel, { color: meta.color }]}>
                {meta.label}
              </Text>
              <Text style={styles.statusBannerDesc}>{meta.description}</Text>
            </View>
          </View>

          {/* Stepper (for non-rejected reports) */}
          {report.status !== 'rejected' && (
            <View style={styles.stepperContainer}>
              {STEPPER_STAGES.map((st, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <View key={st.status} style={styles.stepItem}>
                    <View style={styles.stepNodeRow}>
                      {idx > 0 && (
                        <View
                          style={[
                            styles.stepLine,
                            { backgroundColor: idx <= currentStageIdx ? Colors.primary : '#E5E7EB' },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.stepNode,
                          isPassed && { backgroundColor: Colors.primary },
                          isCurrent && { borderWidth: 3, borderColor: '#A7F3D0' },
                        ]}
                      >
                        <Ionicons
                          name={isPassed ? 'checkmark' : st.icon}
                          size={12}
                          color={isPassed ? '#FFFFFF' : '#9CA3AF'}
                        />
                      </View>
                      {idx < STEPPER_STAGES.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            { backgroundColor: idx < currentStageIdx ? Colors.primary : '#E5E7EB' },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && { color: Colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {st.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Report Overview Card */}
        <View style={styles.card}>
          <View style={styles.chipsRow}>
            <View style={[styles.categoryBadge, { backgroundColor: (cat?.color || Colors.primary) + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: cat?.color || Colors.primary }]}>
                {report.category_name}
              </Text>
            </View>

            {report.sub_issue && (
              <View style={styles.subIssueBadge}>
                <Text style={styles.subIssueBadgeText}>{report.sub_issue}</Text>
              </View>
            )}

            {report.urgency && (
              <View
                style={[
                  styles.urgencyBadge,
                  report.urgency === 'emergency' && { backgroundColor: '#FEE2E2' },
                  report.urgency === 'high' && { backgroundColor: '#FFEDD5' },
                ]}
              >
                <Text
                  style={[
                    styles.urgencyBadgeText,
                    report.urgency === 'emergency' && { color: '#DC2626' },
                    report.urgency === 'high' && { color: '#EA580C' },
                  ]}
                >
                  {report.urgency.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDesc}>{report.description}</Text>

          {/* Citizen Evidence Photo(s) */}
          {evidencePhotos.length > 0 && (
            <View style={styles.photoContainer}>
              <View style={styles.photoHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="camera-outline" size={15} color="#4B5563" style={{ marginRight: 6 }} />
                  <Text style={styles.photoLabel}>
                    Citizen Evidence Photo{evidencePhotos.length > 1 ? `s (${evidencePhotos.length})` : ''}
                  </Text>
                </View>
                {evidencePhotos.length > 1 && (
                  <View style={styles.photoCountBadge}>
                    <Text style={styles.photoCountText}>{evidencePhotos.length} Attached</Text>
                  </View>
                )}
              </View>

              {evidencePhotos.length === 1 ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setLightboxImage({ uri: evidencePhotos[0], title: 'Citizen Evidence Photo' })}
                  style={styles.singlePhotoCard}
                >
                  <Image
                    source={{ uri: evidencePhotos[0] }}
                    style={styles.evidenceImage}
                    resizeMode="cover"
                  />
                  <View style={styles.expandPill}>
                    <Ionicons name="expand-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.expandPillText}>Tap to zoom</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                  {evidencePhotos.map((photoUri, pIdx) => (
                    <TouchableOpacity
                      key={pIdx}
                      activeOpacity={0.9}
                      onPress={() => setLightboxImage({ uri: photoUri, title: `Citizen Evidence #${pIdx + 1}` })}
                      style={styles.galleryThumbCard}
                    >
                      <Image source={{ uri: photoUri }} style={styles.galleryThumb} resizeMode="cover" />
                      <View style={styles.galleryIndexBadge}>
                        <Text style={styles.galleryIndexText}>{pIdx + 1}</Text>
                      </View>
                      <View style={styles.expandPillMini}>
                        <Ionicons name="expand" size={10} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          <View style={styles.metaDivider} />

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{report.address_text || 'Jimma City, Oromia'}</Text>
          </View>

          {report.landmark ? (
            <View style={styles.metaRow}>
              <Ionicons name="flag-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Landmark: {report.landmark}</Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              Submitted on {new Date(report.submitted_at).toLocaleDateString()} at{' '}
              {new Date(report.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Responsible Institution & Task Assignment Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderSmall}>Handling Institution & Assignment</Text>
          <View style={styles.instBox}>
            <Ionicons name="business" size={26} color={cat?.color || Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.instName}>{report.institution_name || 'Jimma City Administration'}</Text>
              <Text style={styles.instSub}>Designated Municipal Bureau</Text>
            </View>
          </View>

          {/* Assigned Staff Member / Field Operative */}
          <View style={styles.assignmentDivider} />
          <View style={styles.assignedStaffRow}>
            <View
              style={[
                styles.assignedStaffAvatar,
                { backgroundColor: report.assigned_staff_name ? '#DCFCE7' : '#F1F5F9' },
              ]}
            >
              <Ionicons
                name={report.assigned_staff_name ? 'person' : 'people-outline'}
                size={20}
                color={report.assigned_staff_name ? '#16A34A' : '#64748B'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.assignedStaffLabel}>Task Assigned To</Text>
              <Text style={styles.assignedStaffName}>
                {report.assigned_staff_name || 'Central Operations & Field Dispatch Unit'}
              </Text>
              {report.assigned_staff_name ? (
                <View style={styles.staffMetaRow}>
                  <View style={styles.activeStaffTag}>
                    <Text style={styles.activeStaffTagText}>Field Operative</Text>
                  </View>
                  {report.assigned_staff_phone ? (
                    <Text style={styles.assignedStaffPhone}>
                      📞 {report.assigned_staff_phone}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.assignedStaffPending}>
                  {report.status === 'submitted'
                    ? 'Pending initial review and individual officer allocation'
                    : 'Assigned to institution operational field crew'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Resolution Notes & Proof Photo (Only when ACTUALLY Resolved) */}
        {report.status === 'resolved' && (
          <View style={[styles.card, { borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }]}>
            <View style={styles.resolutionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
              <Text style={styles.resolutionTitle}>Resolution Proof & Outcome</Text>
            </View>
            {report.resolution_notes ? (
              <Text style={styles.resolutionNotes}>{report.resolution_notes}</Text>
            ) : (
              <Text style={styles.resolutionNotes}>
                The institution has marked this issue as resolved. No additional notes were provided.
              </Text>
            )}

            {/* Staff Field Proof Photo(s) */}
            {resolutionPhotos.length > 0 && (
              <View style={[styles.photoContainer, { marginTop: 12 }]}>
                <View style={styles.photoHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="construct-outline" size={15} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={[styles.photoLabel, { color: '#16A34A', marginBottom: 0 }]}>
                      Staff Field Proof Photo{resolutionPhotos.length > 1 ? `s (${resolutionPhotos.length})` : ''}
                    </Text>
                  </View>
                  {resolutionPhotos.length > 1 && (
                    <View style={[styles.photoCountBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.photoCountText, { color: '#16A34A' }]}>{resolutionPhotos.length} Attached</Text>
                    </View>
                  )}
                </View>

                {resolutionPhotos.length === 1 ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setLightboxImage({ uri: resolutionPhotos[0], title: 'Staff Field Resolution Proof' })}
                    style={styles.singlePhotoCard}
                  >
                    <Image
                      source={{ uri: resolutionPhotos[0] }}
                      style={styles.evidenceImage}
                      resizeMode="cover"
                    />
                    <View style={styles.expandPill}>
                      <Ionicons name="expand-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.expandPillText}>Tap to zoom</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                    {resolutionPhotos.map((photoUri, pIdx) => (
                      <TouchableOpacity
                        key={pIdx}
                        activeOpacity={0.9}
                        onPress={() => setLightboxImage({ uri: photoUri, title: `Staff Proof #${pIdx + 1}` })}
                        style={styles.galleryThumbCard}
                      >
                        <Image source={{ uri: photoUri }} style={styles.galleryThumb} resizeMode="cover" />
                        <View style={[styles.galleryIndexBadge, { backgroundColor: '#16A34A' }]}>
                          <Text style={styles.galleryIndexText}>{pIdx + 1}</Text>
                        </View>
                        <View style={styles.expandPillMini}>
                          <Ionicons name="expand" size={10} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Reopen Action Button */}
            <TouchableOpacity
              style={styles.reopenTriggerBtn}
              onPress={() => setReopenModalVisible(true)}
            >
              <Ionicons name="refresh-outline" size={16} color="#B91C1C" />
              <Text style={styles.reopenTriggerText}>Problem not actually fixed? Reopen ticket</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reopened Banner */}
        {report.status === 'reopened' && (
          <View style={[styles.card, { borderColor: '#C4B5FD', backgroundColor: '#F5F3FF' }]}>
            <View style={styles.resolutionHeader}>
              <Ionicons name="refresh-circle" size={22} color="#7C3AED" />
              <Text style={[styles.resolutionTitle, { color: '#7C3AED' }]}>Ticket Reopened by Citizen</Text>
            </View>
            <Text style={[styles.resolutionNotes, { color: '#5B21B6' }]}>
              This issue has been escalated back to the responsible bureau for re-inspection and corrective action.
            </Text>
          </View>
        )}

        {/* Resolution Feedback (Shown when status is resolved) */}
        {report.status === 'resolved' && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackHeader}>Citizen Satisfaction Feedback</Text>
            <Text style={styles.feedbackSub}>
              How satisfied are you with the resolution of this community problem?
            </Text>

            {/* Star selector */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                  key={`star-${s}`}
                  onPress={() => !feedbackSubmitted && setRating(s)}
                  disabled={feedbackSubmitted}
                >
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F5A623"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {!feedbackSubmitted ? (
              <View style={{ marginTop: 12 }}>
                <TextInput
                  style={styles.feedbackInput}
                  value={feedbackComment}
                  onChangeText={setFeedbackComment}
                  placeholder="Optional comments regarding the speed and quality..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
                <TouchableOpacity
                  style={styles.feedbackSubmitBtn}
                  onPress={handleSendFeedback}
                  disabled={submittingFeedback}
                >
                  {submittingFeedback ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.feedbackSubmitText}>Submit Feedback</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.feedbackDoneText}>
                ✓ Feedback submitted. Thank you for helping keep Jimma clean and safe!
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Reopen Ticket Modal ── */}
      <Modal visible={reopenModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reopen Report</Text>
              <TouchableOpacity onPress={() => setReopenModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              Explain why the problem is not resolved (e.g. patch broke, water leak returned, trash missed).
            </Text>

            <TextInput
              style={styles.modalInput}
              value={reopenComment}
              onChangeText={setReopenComment}
              placeholder="Provide reason for reopening this civic ticket..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={300}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReopenModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleReopen}
                disabled={submittingReopen}
              >
                {submittingReopen ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Reopen Ticket</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Photo Lightbox Modal ── */}
      <Modal
        visible={Boolean(lightboxImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxImage(null)}
      >
        <View style={styles.lightboxOverlay}>
          <SafeAreaView style={styles.lightboxSafe}>
            <View style={styles.lightboxHeader}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.lightboxTitle} numberOfLines={1}>
                  {lightboxImage?.title || 'Report Evidence Photo'}
                </Text>
                <Text style={styles.lightboxSubTitle}>
                  {report.tracking_number} • Jimma Infrastructure Registry
                </Text>
              </View>
              <TouchableOpacity
                style={styles.lightboxCloseBtn}
                onPress={() => setLightboxImage(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.lightboxBody}>
              {lightboxImage?.uri ? (
                <Image
                  source={{ uri: lightboxImage.uri }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            <View style={styles.lightboxFooter}>
              <View style={styles.lightboxMetaRow}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.lightboxFooterText}>Civic Authenticated Evidence</Text>
              </View>
              <TouchableOpacity
                style={styles.lightboxDismissBtn}
                onPress={() => setLightboxImage(null)}
              >
                <Text style={styles.lightboxDismissText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTracking: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  // Status banner
  statusBanner: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  statusBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBannerDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subIssueBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subIssueBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  urgencyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  reportDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  photoContainer: {
    marginTop: 6,
    marginBottom: 12,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  photoCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  singlePhotoCard: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  expandPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  expandPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  galleryScroll: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  galleryThumbCard: {
    position: 'relative',
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  galleryThumb: {
    width: 140,
    height: 120,
    borderRadius: 12,
  },
  galleryIndexBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryIndexText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  expandPillMini: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Lightbox Modal
  lightboxOverlay: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  lightboxSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lightboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  lightboxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  lightboxSubTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  lightboxCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  lightboxFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B1120',
  },
  lightboxMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lightboxFooterText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  lightboxDismissBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  lightboxDismissText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  cardHeaderSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  instBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  instName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  instSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  assignmentDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  assignedStaffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assignedStaffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedStaffLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assignedStaffName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  activeStaffTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeStaffTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  assignedStaffPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  assignedStaffPending: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  // Resolution & Reopen
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  resolutionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  resolutionNotes: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
    marginBottom: 10,
  },
  reopenTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 8,
  },
  reopenTriggerText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },
  // Audit timeline
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineColLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  timelineColRight: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRoleBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timelineTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timelineComment: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  auditThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginTop: 6,
  },
  // Feedback
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    marginBottom: 20,
  },
  feedbackHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  feedbackSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    height: 64,
    textAlignVertical: 'top',
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  feedbackSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedbackSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  feedbackDoneText: {
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 6,
  },
  // Reopen Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    height: 100,
    fontSize: 13,
    color: '#111827',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

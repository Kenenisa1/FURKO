import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { STATUS_META } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { Report } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

export const ReportDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const reportId = route?.params?.reportId;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (reportId) {
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
    }
  }, [reportId]);

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
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Report not found.</Text>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[report.status] || STATUS_META.submitted;

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
        <Text style={styles.headerTitle}>{report.tracking_number}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: meta.bg }]}>
          <View style={styles.statusBannerLeft}>
            <Text style={[styles.statusBannerLabel, { color: meta.color }]}>
              Current Status: {meta.label}
            </Text>
            <Text style={styles.statusBannerDesc}>{meta.description}</Text>
          </View>
        </View>

        {/* Report Overview Card */}
        <View style={styles.card}>
          <Text style={styles.categoryBadge}>{report.category_name}</Text>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDesc}>{report.description}</Text>

          {/* Evidence photo if present */}
          {report.photo_url && (
            <Image source={{ uri: report.photo_url }} style={styles.evidenceImage} />
          )}

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{report.address_text || 'Jimma City'}</Text>
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
              Submitted on {new Date(report.submitted_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Responsible Institution Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderSmall}>Direct Service Routing</Text>
          <View style={styles.instBox}>
            <Text style={styles.instIcon}>🏢</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.instName}>{report.institution_name}</Text>
              <Text style={styles.instSub}>Active Operational Queue</Text>
            </View>
          </View>
        </View>

        {/* Audit Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderSmall}>Resolution Audit Trail</Text>
          {report.audit_history?.map((audit, index) => {
            const auditMeta = STATUS_META[audit.status];
            const isLast = index === (report.audit_history?.length || 0) - 1;
            return (
              <View key={audit.id} style={styles.timelineRow}>
                <View style={styles.timelineColLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: auditMeta.color }]} />
                  {!isLast && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineColRight}>
                  <Text style={[styles.timelineStatusTitle, { color: auditMeta.color }]}>
                    {auditMeta.label}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {new Date(audit.changed_at).toLocaleString()}
                  </Text>
                  {audit.comment ? (
                    <Text style={styles.timelineComment}>{audit.comment}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  statusBannerLeft: {},
  statusBannerLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBannerDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  reportDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  evidenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
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
  },
  cardHeaderSmall: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  instBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
  },
  instIcon: {
    fontSize: 24,
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
  timelineRow: {
    flexDirection: 'row',
    minHeight: 50,
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
  timelineStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timelineComment: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    marginBottom: 20,
  },
  feedbackHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  feedbackSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    height: 70,
    textAlignVertical: 'top',
    marginBottom: 10,
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
    marginTop: 8,
  },
});

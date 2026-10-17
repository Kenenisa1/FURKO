import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { STATUS_META, PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { Report, ReportStatus } from '../../types';

interface Props {
  navigation: any;
}

// ─── Filter tab definition ────────────────────────────────────────────────────
const FILTER_TABS: {
  key: string;
  label: string;
  statuses: ReportStatus[] | 'all';
}[] = [
  { key: 'all',        label: 'All',         statuses: 'all' },
  { key: 'submitted',  label: 'Submitted',   statuses: ['submitted'] },
  { key: 'active',     label: 'In Progress', statuses: ['under_review', 'in_progress'] },
  { key: 'resolved',   label: 'Resolved',    statuses: ['resolved'] },
  { key: 'reopened',   label: 'Reopened',    statuses: ['reopened'] },
  { key: 'rejected',   label: 'Rejected',    statuses: ['rejected'] },
];

// ─── Category icon helper ─────────────────────────────────────────────────────
const categoryEmoji = (key?: string) => {
  switch (key) {
    case 'roads':    return '🚧';
    case 'water':    return '💧';
    case 'waste':    return '🗑️';
    case 'lighting': return '💡';
    default:         return '📋';
  }
};

// ─── Urgency config ───────────────────────────────────────────────────────────
const URGENCY_COLOR: Record<string, string> = {
  low: '#16A34A',
  medium: '#D97706',
  high: '#EA580C',
  emergency: '#DC2626',
};

// ─── Progress bar helper ──────────────────────────────────────────────────────
const STATUS_STEP: Record<ReportStatus, number> = {
  submitted:    1,
  under_review: 2,
  in_progress:  3,
  resolved:     4,
  rejected:     0,
  reopened:     2,
};

const ProgressBar = ({ status }: { status: ReportStatus }) => {
  const step = STATUS_STEP[status] ?? 1;
  const total = 4;
  const isRejected = status === 'rejected';

  return (
    <View style={pb.container}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = !isRejected && i < step;
        return (
          <View
            key={i}
            style={[
              pb.segment,
              { flex: 1 },
              filled ? pb.filled : pb.empty,
              isRejected && pb.rejected,
              i > 0 && { marginLeft: 3 },
            ]}
          />
        );
      })}
    </View>
  );
};

const pb = StyleSheet.create({
  container: { flexDirection: 'row', height: 4, borderRadius: 2, marginTop: 8, marginBottom: 2 },
  segment:   { borderRadius: 2 },
  filled:    { backgroundColor: Colors.primary },
  empty:     { backgroundColor: '#E5E7EB' },
  rejected:  { backgroundColor: '#FCA5A5' },
});

// ─── Report Card ──────────────────────────────────────────────────────────────
const ReportCard = ({
  item,
  onPress,
}: {
  item: Report;
  onPress: () => void;
}) => {
  const meta = STATUS_META[item.status] ?? STATUS_META.submitted;
  const cat = PROBLEM_CATEGORIES.find((c) => c.id === item.category_id);
  const urgColor = item.urgency ? URGENCY_COLOR[item.urgency] : undefined;

  const submittedDate = new Date(item.submitted_at);
  const daysAgo = Math.floor(
    (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dateLabel =
    daysAgo === 0
      ? 'Today'
      : daysAgo === 1
      ? 'Yesterday'
      : `${daysAgo}d ago`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* ── Card header row ── */}
      <View style={styles.cardHeader}>
        <View style={styles.trackingGroup}>
          <Text style={styles.categoryEmoji}>{categoryEmoji(cat?.key)}</Text>
          <Text style={styles.trackingText}>{item.tracking_number}</Text>
        </View>
        <View style={styles.badgeRow}>
          {item.urgency === 'emergency' && (
            <View style={styles.emergencyBadge}>
              <Ionicons name="flash" size={10} color="#DC2626" />
              <Text style={styles.emergencyBadgeText}>EMG</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Title ── */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>

      {/* ── Sub-issue chip ── */}
      {item.sub_issue && (
        <View style={[styles.subIssuePill, { backgroundColor: (cat?.color ?? Colors.primary) + '18' }]}>
          <Text style={[styles.subIssuePillText, { color: cat?.color ?? Colors.primary }]}>
            {item.sub_issue}
          </Text>
        </View>
      )}

      {/* ── Location ── */}
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
        <Text style={styles.cardLocation} numberOfLines={1}>
          {item.address_text || 'Jimma City'}
        </Text>
        {item.landmark ? (
          <Text style={styles.landmarkText} numberOfLines={1}>
            · {item.landmark}
          </Text>
        ) : null}
      </View>

      {/* ── Progress bar ── */}
      <ProgressBar status={item.status} />

      {/* ── Card footer ── */}
      <View style={styles.cardFooter}>
        <Text style={styles.instText} numberOfLines={1}>
          🏢 {item.institution_name}
        </Text>
        <View style={styles.footerRight}>
          {urgColor && item.urgency !== 'low' && (
            <View style={[styles.urgencyDot, { backgroundColor: urgColor }]} />
          )}
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      const data = await ReportsApi.getMyReports();
      setReports(data);
    } catch {
      // silently ignore — mock data handles offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Re-fetch when screen comes back into focus (e.g. after submitting a new report)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadReports);
    return unsubscribe;
  }, [navigation, loadReports]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const tabDef = FILTER_TABS.find((t) => t.key === selectedFilter) || FILTER_TABS[0];

  const filteredReports = reports.filter((r) => {
    if (tabDef.statuses !== 'all' && !tabDef.statuses.includes(r.status)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.tracking_number?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.address_text?.toLowerCase().includes(q) ||
        r.institution_name?.toLowerCase().includes(q) ||
        r.sub_issue?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Tab count helpers ──────────────────────────────────────────────────────
  const countForTab = (tab: typeof FILTER_TABS[0]) => {
    if (tab.statuses === 'all') return reports.length;
    return reports.filter((r) => (tab.statuses as ReportStatus[]).includes(r.status)).length;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Reports</Text>
          <Text style={styles.headerSub}>
            {reports.length} {reports.length === 1 ? 'ticket' : 'tickets'} total
          </Text>
        </View>
        <TouchableOpacity
          style={styles.newReportBtn}
          onPress={() => navigation.navigate('CategorySelection')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newReportBtnText}>New Report</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by ID, title, location…"
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter tabs ── */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(t) => t.key}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item: tab }) => {
            const active = selectedFilter === tab.key;
            const count = countForTab(tab);
            return (
              <TouchableOpacity
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setSelectedFilter(tab.key)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterCount,
                      { backgroundColor: active ? 'rgba(255,255,255,0.3)' : '#E5E7EB' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        { color: active ? '#fff' : '#6B7280' },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Report list ── */}
      <FlatList
        data={filteredReports}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <ReportCard
            item={item}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No matches found' : 'No reports here'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try a different search term or clear the filter.'
                  : selectedFilter === 'all'
                  ? "You haven't filed any reports yet. Help improve Jimma City!"
                  : `You have no "${tabDef.label}" reports.`}
              </Text>
              {!searchQuery && selectedFilter === 'all' && (
                <TouchableOpacity
                  style={styles.emptyCta}
                  onPress={() => navigation.navigate('CategorySelection')}
                >
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <Text style={styles.emptyCtaText}>Submit a Report</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  headerSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  newReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newReportBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  searchWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  filterRow: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterTabTextActive: { color: '#fff', fontWeight: '700' },
  filterCount: {
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '800' },

  listContent: { padding: 16, paddingBottom: 40 },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryEmoji: { fontSize: 15 },
  trackingText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEE2E2',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  emergencyBadgeText: { fontSize: 9, fontWeight: '800', color: '#DC2626' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 6,
  },
  subIssuePill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 6,
  },
  subIssuePillText: { fontSize: 11, fontWeight: '600' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cardLocation: { fontSize: 12, color: '#6B7280', flex: 1 },
  landmarkText: { fontSize: 11, color: '#9CA3AF', flexShrink: 1 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  instText: { fontSize: 11, color: '#4B5563', fontWeight: '600', flex: 1 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  urgencyDot: { width: 7, height: 7, borderRadius: 4 },
  dateText: { fontSize: 11, color: '#9CA3AF' },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyCtaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

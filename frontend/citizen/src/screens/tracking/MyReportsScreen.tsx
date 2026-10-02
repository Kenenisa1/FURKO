import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { STATUS_META } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { Report, ReportStatus } from '../../types';

interface Props {
  navigation: any;
}

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'under_review', label: 'In Review' },
];

export const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    try {
      const data = await ReportsApi.getMyReports();
      setReports(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const filteredReports = reports.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  const renderItem = ({ item }: { item: Report }) => {
    const meta = STATUS_META[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.trackingText}>{item.tracking_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {item.address_text || 'Jimma City'}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.instText} numberOfLines={1}>
            🏢 {item.institution_name}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.submitted_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const isActive = selectedFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setSelectedFilter(tab.key)}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              You have not submitted any reports in this category yet.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
    marginTop: 4,
  },
  instText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

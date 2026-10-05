import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { STATUS_META, PROBLEM_CATEGORIES } from '../../constants/categories';
import { ReportsApi } from '../../services/api';
import { Report } from '../../types';

interface Props {
  navigation: any;
}

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'under_review', label: 'In Review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'submitted', label: 'Submitted' },
];

export const MyReportsScreen: React.FC<Props> = ({ navigation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    // Status filter
    if (selectedFilter !== 'all' && r.status !== selectedFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTracking = r.tracking_number?.toLowerCase().includes(query);
      const matchTitle = r.title?.toLowerCase().includes(query);
      const matchAddress = r.address_text?.toLowerCase().includes(query);
      const matchInst = r.institution_name?.toLowerCase().includes(query);
      return matchTracking || matchTitle || matchAddress || matchInst;
    }
    return true;
  });

  const renderItem = ({ item }: { item: Report }) => {
    const meta = STATUS_META[item.status] || STATUS_META.submitted;
    const cat = PROBLEM_CATEGORIES.find((c) => c.id === item.category_id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.trackingGroup}>
            <Text style={styles.categoryEmojiSmall}>
              {cat?.key === 'roads'
                ? '🚧'
                : cat?.key === 'water'
                ? '💧'
                : cat?.key === 'waste'
                ? '🗑️'
                : '💡'}
            </Text>
            <Text style={styles.trackingText}>{item.tracking_number}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.address_text || 'Jimma City, Ethiopia'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.instRow}>
            <Text style={styles.instText} numberOfLines={1}>
              🏢 {item.institution_name}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.submitted_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Civic Reports</Text>
        <TouchableOpacity
          style={styles.newReportBtn}
          onPress={() => navigation.navigate('CategorySelection')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newReportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by ticket ID, road, department..."
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = selectedFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setSelectedFilter(item.key)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="clipboard-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'No matching community problems found for your search.'
                : 'You have no tickets in this status category.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => navigation.navigate('CategorySelection')}
            >
              <Text style={styles.emptyCtaText}>+ Submit a New Report</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  newReportBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  newReportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#4B5563',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmojiSmall: {
    fontSize: 16,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  instRow: {
    flex: 1,
  },
  instText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyCta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

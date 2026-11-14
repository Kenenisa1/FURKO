import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES, STATUS_META } from '../../constants/categories';
import { FurkoLogo } from '../../components/common/FurkoLogo';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { useAuth } from '../../context/AuthContext';
import { ReportsApi } from '../../services/api';
import { Report } from '../../types';

interface Props {
  navigation: any;
}

interface PublicStats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
  resolutionRate: number;
  institutionsCount?: number;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [publicStats, setPublicStats] = useState<PublicStats>({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0,
    institutionsCount: 4,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [userReports, stats] = await Promise.all([
        ReportsApi.getMyReports(),
        ReportsApi.getPublicStats(),
      ]);
      setReports(userReports || []);
      if (stats) {
        setPublicStats(stats);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header: Brand Logo & User Profile / Sign In */}
      <View style={styles.topHeader}>
        <FurkoLogo size="small" showTagline={false} centered={false} />

        {user ? (
          <TouchableOpacity
            style={styles.profileHeaderBadge}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.profileAvatarMini}>
              <Text style={styles.profileAvatarText}>
                {user.full_name?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
            <View>
              <Text style={styles.profileGreeting}>Welcome</Text>
              <Text style={styles.profileHeaderText} numberOfLines={1}>
                {user.full_name?.split(' ')[0] || 'Citizen'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInHeaderLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInHeaderText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={15} color="#008744" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#008744']} />}
      >
        {/* Hero Section */}
        <ImageBackground
          source={require('../../../assets/homebackround.png')}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>JIMMA CIVIC PLATFORM</Text>
              </View>

              <Text style={styles.heroTitleGreen}>Report Issues.</Text>
              <Text style={styles.heroTitleBlack}>Shape Your City.</Text>

              <Text style={styles.heroSubtitle}>
                Directly route municipal problems to responsible authorities and track real-time resolution.
              </Text>

              {/* Action Buttons: Green Primary, Blue Secondary */}
              <View style={styles.heroBtnGroup}>
                {/* 1. Primary Button (Green) */}
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('CategorySelection')}
                  activeOpacity={0.88}
                >
                  <View style={styles.btnIconCircleWhite}>
                    <Ionicons name="add" size={18} color="#008744" />
                  </View>
                  <Text style={styles.primaryBtnText}>Report a Problem</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* 2. Secondary Button (Blue) */}
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('ReportsTab')}
                  activeOpacity={0.88}
                >
                  <View style={styles.btnIconCircleWhite}>
                    <Ionicons name="document-text" size={16} color="#1E6FE0" />
                  </View>
                  <Text style={styles.secondaryBtnText}>Track My Reports</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* 4 Core Problem Categories Launchpad */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Report by Category</Text>
              <Text style={styles.sectionSubtitle}>Select category to start direct routing</Text>
            </View>
          </View>

          <View style={styles.categoryGrid}>
            {PROBLEM_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { borderTopColor: cat.color }]}
                onPress={() => navigation.navigate('PhotoLocation', { categoryId: cat.id })}
                activeOpacity={0.85}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '16' }]}>
                  <CategoryIcon categoryKey={cat.key} size={26} color={cat.color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Active Tickets Preview (when user has reports) */}
        {reports.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Active Tickets</Text>
                <Text style={styles.sectionSubtitle}>Your recently submitted reports</Text>
              </View>
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('ReportsTab')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All ({reports.length})</Text>
                <Ionicons name="chevron-forward" size={14} color="#1E6FE0" />
              </TouchableOpacity>
            </View>

            {reports.slice(0, 2).map((rep) => {
              const meta = STATUS_META[rep.status] || STATUS_META.submitted;
              return (
                <TouchableOpacity
                  key={rep.id}
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('ReportDetail', { reportId: rep.id })}
                  activeOpacity={0.85}
                >
                  <View style={styles.recentCardTop}>
                    <Text style={styles.recentTracking}>{rep.tracking_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
                      <Text style={[styles.statusBadgeText, { color: meta.color }]}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recentTitle} numberOfLines={1}>{rep.title}</Text>

                  <View style={styles.recentFooterRow}>
                    <View style={styles.recentMetaCol}>
                      <Ionicons name="location-outline" size={13} color="#6B7280" />
                      <Text style={styles.recentMetaText} numberOfLines={1}>
                        {rep.address_text || 'Jimma City'}
                      </Text>
                    </View>
                    <View style={styles.recentMetaCol}>
                      <Ionicons name="business-outline" size={13} color="#6B7280" />
                      <Text style={styles.recentMetaText} numberOfLines={1}>
                        {rep.institution_name ? rep.institution_name.split(' ')[2] || 'Bureau' : 'Bureau'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* How It Works Section (Minimal & Professional) */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitleCenter}>How FURKO Works</Text>
          <Text style={styles.sectionSubtitleCenter}>From citizen report to verified municipal resolution</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={[styles.stepIconBox, { backgroundColor: '#E6F4EA' }]}>
                <Ionicons name="camera-outline" size={22} color="#008744" />
              </View>
              <Text style={styles.stepNum}>01</Text>
              <Text style={styles.stepTitle}>Capture & Report</Text>
              <Text style={styles.stepText}>Take a photo and tag GPS coordinates.</Text>
            </View>

            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={18} color="#D1D5DB" />
            </View>

            <View style={styles.stepCard}>
              <View style={[styles.stepIconBox, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="navigate-outline" size={22} color="#1E6FE0" />
              </View>
              <Text style={[styles.stepNum, { color: '#1E6FE0' }]}>02</Text>
              <Text style={styles.stepTitle}>Direct Routing</Text>
              <Text style={styles.stepText}>Dispatched directly to the responsible bureau.</Text>
            </View>

            <View style={styles.stepArrow}>
              <Ionicons name="arrow-forward" size={18} color="#D1D5DB" />
            </View>

            <View style={styles.stepCard}>
              <View style={[styles.stepIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-done-circle-outline" size={22} color="#16A34A" />
              </View>
              <Text style={[styles.stepNum, { color: '#16A34A' }]}>03</Text>
              <Text style={styles.stepTitle}>Verified Fix</Text>
              <Text style={styles.stepText}>Resolved with photo verification proof.</Text>
            </View>
          </View>
        </View>

        {/* Building Better Communities - Live Real Reports Information Across All Institutions */}
        <View style={styles.impactContainer}>
          <View style={styles.impactHeaderBox}>
            <View style={styles.impactPill}>
              <Ionicons name="stats-chart" size={13} color="#008744" />
              <Text style={styles.impactPillText}>CITY-WIDE IMPACT</Text>
            </View>
            <Text style={styles.impactTitle}>Building Better Communities</Text>
            <Text style={styles.impactSubtitle}>
              Live municipal progress across all institutions in Jimma
            </Text>
          </View>

          {/* Row 1: Submitted & In Progress */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="paper-plane-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.statValue}>{publicStats.submitted}</Text>
              <Text style={styles.statTitle}>Submitted</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="construct-outline" size={18} color="#1E6FE0" />
              </View>
              <Text style={[styles.statValue, { color: '#1E6FE0' }]}>{publicStats.inProgress}</Text>
              <Text style={styles.statTitle}>In Progress</Text>
            </View>
          </View>

          {/* Row 2: Resolved & Resolution Rate */}
          <View style={[styles.statsRow, { marginTop: 10 }]}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#E6F4EA' }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#008744" />
              </View>
              <Text style={[styles.statValue, { color: '#008744' }]}>{publicStats.resolved}</Text>
              <Text style={styles.statTitle}>Resolved</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="trending-up-outline" size={18} color="#15803D" />
              </View>
              <Text style={[styles.statValue, { color: '#15803D' }]}>{publicStats.resolutionRate}%</Text>
              <Text style={styles.statTitle}>Resolution Rate</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  signInHeaderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  signInHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#008744',
  },
  profileHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  profileAvatarMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#008744',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileGreeting: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: 90,
  },
  scroll: {
    paddingBottom: 36,
  },
  heroBackground: {
    width: '100%',
    minHeight: 380,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  heroContent: {},
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#008744',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#008744',
    letterSpacing: 0.5,
  },
  heroTitleGreen: {
    fontSize: 32,
    fontWeight: '900',
    color: '#008744',
    letterSpacing: -0.5,
  },
  heroTitleBlack: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: -2,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 20,
  },
  heroBtnGroup: {
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#008744',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#008744',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  btnIconCircleWhite: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    flex: 1,
  },
  secondaryBtn: {
    backgroundColor: '#1E6FE0',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#1E6FE0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    flex: 1,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E6FE0',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentTracking: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  recentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentMetaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  recentMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitleCenter: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  sectionSubtitleCenter: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
  },
  stepIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: '800',
    color: '#008744',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  stepText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 13,
  },
  stepArrow: {
    paddingHorizontal: 2,
    marginBottom: 18,
  },
  impactContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  impactHeaderBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  impactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginBottom: 6,
  },
  impactPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#008744',
    letterSpacing: 0.5,
  },
  impactTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  impactSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
});
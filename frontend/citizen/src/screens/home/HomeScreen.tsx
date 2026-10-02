import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES, STATUS_META } from '../../constants/categories';
import { FurkoLogo } from '../../components/common/FurkoLogo';
import { useAuth } from '../../context/AuthContext';
import { ReportsApi } from '../../services/api';
import { Report } from '../../types';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
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

  // Quick stats
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching Image 1: Logo on Left, Sign In / Profile on Right */}
      <View style={styles.topHeader}>
        <FurkoLogo size="small" showTagline={true} centered={false} />

        {user ? (
          <TouchableOpacity
            style={styles.profileHeaderBadge}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.profileAvatarMini}>
              <Text style={styles.profileAvatarText}>
                {user.full_name?.charAt(0) || 'C'}
              </Text>
            </View>
            <Text style={styles.profileHeaderText} numberOfLines={1}>
              {user.full_name?.split(' ')[0]}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInHeaderLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInHeaderText}>Sign in</Text>
            <Ionicons name="chevron-forward" size={16} color="#111827" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hero Section with Landscape Background matching Image 1 */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
          }}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          {/* Subtle gradient overlay */}
          <View style={styles.heroOverlay}>
            <View style={styles.headlineBox}>
              <Text style={styles.heroTitleGreen}>Your Voice</Text>
              <Text style={styles.heroTitleBlack}>Can Improve{'\n'}Your Community.</Text>

              {/* Blue vertical bar accent with description */}
              <View style={styles.heroCalloutRow}>
                <View style={styles.verticalBlueBar} />
                <Text style={styles.heroCalloutText}>
                  Report community problems, track their progress, and help create real change.
                </Text>
              </View>

              {/* Hero Action Buttons matching Image 1 */}
              <View style={styles.heroBtnGroup}>
                {/* 1. Report a problem (Green Pill -> Launches Wizard) */}
                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => navigation.navigate('ReportWizard')}
                  activeOpacity={0.85}
                >
                  <View style={styles.whiteCirclePlus}>
                    <Ionicons name="add" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.reportBtnText}>Report a problem</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>

                {/* 2. Track a report (White Pill with Blue Border -> Switches to Reports Tab) */}
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => navigation.navigate('ReportsTab')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.trackBtnText}>Track a report</Text>
                  <Ionicons name="chevron-forward" size={18} color="#1E6FE0" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* 4 Core Problem Categories Launchpad */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Select Problem Category</Text>
            <Text style={styles.sectionHeaderSubtitleLight}>Direct dispatch to responsible office</Text>
          </View>

          <View style={styles.categoryGrid}>
            {PROBLEM_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { borderLeftColor: cat.color }]}
                onPress={() => navigation.navigate('ReportWizard', { categoryId: cat.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '18' }]}>
                  <Text style={styles.categoryEmoji}>
                    {cat.key === 'roads'
                      ? '🚧'
                      : cat.key === 'water'
                      ? '💧'
                      : cat.key === 'waste'
                      ? '🗑️'
                      : '💡'}
                  </Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryLocal}>{cat.nameLocal}</Text>
                <Text style={styles.categoryInst} numberOfLines={2}>
                  🏢 {cat.responsibleInstitution}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: How Furko works matching Image 1 */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionHeaderTitle}>How Furko works</Text>
          <View style={styles.blueDivider} />
          <Text style={styles.sectionHeaderSubtitle}>Turning community problems into action.</Text>

          {/* 3 Step Connected Diagram matching Image 1 */}
          <View style={styles.stepsDiagram}>
            {/* Step 1: Report */}
            <View style={styles.stepCol}>
              <View style={styles.stepIconWrapper}>
                <Feather name="smartphone" size={28} color="#1E6FE0" />
              </View>
              <Text style={styles.stepTitle}>Report</Text>
              <Text style={styles.stepDesc}>Tell us what happened and where.</Text>
            </View>

            {/* Connecting Line */}
            <View style={styles.stepLine} />

            {/* Step 2: Track */}
            <View style={styles.stepCol}>
              <View style={styles.stepIconWrapper}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={28} color="#1E6FE0" />
              </View>
              <Text style={styles.stepTitle}>Track</Text>
              <Text style={styles.stepDesc}>Follow updates and progress</Text>
            </View>

            {/* Connecting Line */}
            <View style={styles.stepLine} />

            {/* Step 3: Resolve */}
            <View style={styles.stepCol}>
              <View style={styles.stepIconWrapper}>
                <Ionicons name="sync-circle-outline" size={32} color="#1E6FE0" />
              </View>
              <Text style={styles.stepTitle}>Resolve</Text>
              <Text style={styles.stepDesc}>See action taken on your report</Text>
            </View>
          </View>
        </View>

        {/* Recent Reports Live Feed Preview */}
        {reports.length > 0 && (
          <View style={styles.recentFeedSection}>
            <View style={styles.recentFeedHeader}>
              <Text style={styles.sectionHeaderTitle}>Your Active Tickets</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ReportsTab')}>
                <Text style={styles.viewAllLink}>View All ({reports.length}) →</Text>
              </TouchableOpacity>
            </View>

            {reports.slice(0, 2).map((rep) => {
              const meta = STATUS_META[rep.status];
              return (
                <TouchableOpacity
                  key={rep.id}
                  style={styles.recentCard}
                  onPress={() => navigation.navigate('ReportDetail', { reportId: rep.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.recentCardTop}>
                    <Text style={styles.recentTracking}>{rep.tracking_number}</Text>
                    <View style={[styles.recentStatusBadge, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.recentStatusText, { color: meta.color }]}>
                        {meta.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{rep.title}</Text>
                  <Text style={styles.recentLoc} numberOfLines={1}>📍 {rep.address_text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Curved Green Impact Banner matching bottom of Image 1 */}
        <View style={styles.impactWaveContainer}>
          <Text style={styles.impactHeader}>building better communities</Text>
          <View style={styles.whiteDividerMini} />

          {/* 4 Stats matching Image 1 */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={26} color="#FFFFFF" />
              <Text style={styles.statNumber}>100 submitted</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="speedometer" size={26} color="#FFFFFF" />
              <Text style={styles.statNumber}>2300 in progress</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={26} color="#FFFFFF" />
              <Text style={styles.statNumber}>600 resolved</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={26} color="#FFFFFF" />
              <Text style={styles.statNumber}>85% citizen success</Text>
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  signInHeaderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signInHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  profileHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  profileAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  profileHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    maxWidth: 90,
  },
  scroll: {
    paddingBottom: 40,
  },
  heroBackground: {
    width: '100%',
    minHeight: 390,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  headlineBox: {},
  heroTitleGreen: {
    fontSize: 34,
    fontWeight: '900',
    color: '#008744',
    letterSpacing: -0.5,
  },
  heroTitleBlack: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginTop: -2,
    lineHeight: 40,
  },
  heroCalloutRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 20,
    paddingRight: 20,
  },
  verticalBlueBar: {
    width: 3.5,
    backgroundColor: '#1E6FE0',
    borderRadius: 2,
    marginRight: 10,
  },
  heroCalloutText: {
    fontSize: 13.5,
    color: '#1F2937',
    lineHeight: 19,
    fontWeight: '500',
    flex: 1,
  },
  heroBtnGroup: {
    gap: 12,
    marginTop: 4,
  },
  reportBtn: {
    backgroundColor: '#008744',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#008744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  whiteCirclePlus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  trackBtn: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E6FE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  trackBtnText: {
    color: '#1E6FE0',
    fontSize: 15,
    fontWeight: '800',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitleRow: {
    marginBottom: 16,
  },
  sectionHeaderSubtitleLight: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  categoryLocal: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
    fontStyle: 'italic',
  },
  categoryInst: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 6,
    lineHeight: 14,
    fontWeight: '600',
  },
  howItWorksSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  blueDivider: {
    width: 44,
    height: 3,
    backgroundColor: '#1E6FE0',
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 6,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 26,
  },
  stepsDiagram: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepIconWrapper: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#008744',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 14,
  },
  stepLine: {
    width: 24,
    height: 1.5,
    backgroundColor: '#111827',
    marginTop: 18,
  },
  recentFeedSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  recentFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  recentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentTracking: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recentStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  recentLoc: {
    fontSize: 12,
    color: '#6B7280',
  },
  impactWaveContainer: {
    backgroundColor: '#008744',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  impactHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  whiteDividerMini: {
    width: 48,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    width: (width - 64) / 2,
    alignItems: 'flex-start',
    gap: 4,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});

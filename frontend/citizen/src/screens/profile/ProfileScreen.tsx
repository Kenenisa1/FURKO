import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'Dawit Tadesse');
  const [subcity, setSubcity] = useState(user?.subcity || 'Jimma Central');
  const [kebele, setKebele] = useState(user?.kebele || 'Kebele 04');
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'om' | 'am'>('en');

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be blank.');
      return;
    }
    await updateProfile({
      full_name: fullName.trim(),
      subcity: subcity.trim(),
      kebele: kebele.trim(),
    });
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your citizen profile information has been saved successfully.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Furko account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'FK';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Citizen Profile</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Feather name={isEditing ? 'x' : 'edit-2'} size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.full_name)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.full_name || 'Dawit Tadesse'}</Text>
          <Text style={styles.userRole}>Civic Citizen • Jimma Pilot</Text>

          {/* Verified Phone Chip */}
          <View style={styles.phoneChip}>
            <Feather name="phone" size={13} color={Colors.primary} />
            <Text style={styles.phoneChipText}>{user?.phone_number || '+251 91 123 4567'}</Text>
            {user?.phone_verified ? (
              <View style={styles.statusVerified}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                <Text style={styles.statusVerifiedText}>Verified</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('PhoneVerification', {
                    phoneNumber: user?.phone_number || '+251 91 123 4567',
                  })
                }
              >
                <Text style={styles.verifyNowLink}>Verify now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Civic Activity Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>3</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>1</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.success }]}>2</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Edit or Details Section */}
        {isEditing ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Edit Citizen Information</Text>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />

            <Text style={styles.fieldLabel}>Subcity / Zone</Text>
            <TextInput
              style={styles.fieldInput}
              value={subcity}
              onChangeText={setSubcity}
              placeholder="e.g. Jimma Central"
            />

            <Text style={styles.fieldLabel}>Kebele</Text>
            <TextInput
              style={styles.fieldInput}
              value={kebele}
              onChangeText={setKebele}
              placeholder="e.g. Kebele 04"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeaderTitle}>Location & Jurisdiction</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>City</Text>
              </View>
              <Text style={styles.infoValue}>Jimma City, Oromia</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="navigate-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Subcity / Zone</Text>
              </View>
              <Text style={styles.infoValue}>{user?.subcity || 'Jimma Central'}</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoLeft}>
                <Ionicons name="home-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Kebele</Text>
              </View>
              <Text style={styles.infoValue}>{user?.kebele || 'Kebele 04'}</Text>
            </View>
          </View>
        )}

        {/* Language Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Language / Afaan / ቋንቋ</Text>
          <View style={styles.languageRow}>
            {[
              { key: 'en', label: 'English' },
              { key: 'om', label: 'Afaan Oromoo' },
              { key: 'am', label: 'አማርኛ' },
            ].map((lang) => {
              const active = selectedLanguage === lang.key;
              return (
                <TouchableOpacity
                  key={lang.key}
                  style={[styles.langChip, active && styles.langChipActive]}
                  onPress={() => setSelectedLanguage(lang.key as any)}
                >
                  <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications & Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>Notification Preferences</Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>SMS Dispatch Alerts</Text>
              <Text style={styles.switchSubtitle}>Receive SMS when department responds</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: '#D1D5DB', true: Colors.primary }}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Ticket Resolution Proofs</Text>
              <Text style={styles.switchSubtitle}>Get notified with photo proof when fixed</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#D1D5DB', true: Colors.primary }}
            />
          </View>
        </View>

        {/* Quick Navigation to Reports */}
        <TouchableOpacity
          style={styles.menuLinkCard}
          onPress={() => navigation.navigate('MyReports')}
        >
          <View style={styles.menuLinkLeft}>
            <View style={styles.menuLinkIcon}>
              <MaterialCommunityIcons name="clipboard-text-clock" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.menuLinkText}>My Submitted Reports</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Feather name="log-out" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FURKO v2.0 • Jimma Pilot Edition</Text>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  userRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  phoneChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  statusVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 2,
  },
  statusVerifiedText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  verifyNowLink: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '70%',
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  langChipActive: {
    backgroundColor: Colors.primary,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  langChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuLinkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
  },
});

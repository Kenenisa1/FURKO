import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { PROBLEM_CATEGORIES } from '../../constants/categories';
import { CategoryCard } from '../../components/report/CategoryCard';
import { ProblemCategory } from '../../types';

interface Props {
  navigation: any;
  route?: any;
}

export const CategorySelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialCatId = route?.params?.categoryId;
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | null>(
    PROBLEM_CATEGORIES.find((c) => c.id === initialCatId) || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter across category names, local names, description, and keywords
  const filteredCategories = PROBLEM_CATEGORIES.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const inName = cat.name.toLowerCase().includes(q);
    const inLocal = cat.nameLocal?.toLowerCase().includes(q);
    const inAmharic = cat.nameAmharic?.toLowerCase().includes(q);
    const inDesc = cat.description.toLowerCase().includes(q);
    const inInst = cat.responsibleInstitution.toLowerCase().includes(q);
    const inKeywords = cat.keywords?.some((k) => k.toLowerCase().includes(q));

    return inName || inLocal || inAmharic || inDesc || inInst || inKeywords;
  });

  const handleSelectCategory = (category: ProblemCategory) => {
    setSelectedCategory(category);
  };

  const handleContinue = () => {
    if (!selectedCategory) {
      Alert.alert('Selection Required', 'Please select a problem category to continue.');
      return;
    }

    // Direct transition to Photo & Evidence Collection
    navigation.navigate('PhotoEvidence', {
      categoryId: selectedCategory.id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 1 of 5</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title & Introduction */}
        <View style={styles.headlineGroup}>
          <Text style={styles.title}>What is the problem?</Text>
          <Text style={styles.subtitle}>
            Select the category that best describes the issue. FURKO will automatically route your report to the designated public office in Jimma City.
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search category or problem (e.g. water, road, trash, light)..."
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 4 Problem Categories List */}
        <View style={styles.categoriesList}>
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory?.id === cat.id}
              onSelectCategory={handleSelectCategory}
            />
          ))}

          {filteredCategories.length === 0 && (
            <View style={styles.emptySearchBox}>
              <Ionicons name="search" size={36} color="#D1D5DB" />
              <Text style={styles.emptySearchTitle}>No matching categories</Text>
              <Text style={styles.emptySearchSubtitle}>
                Try searching for keywords like "road", "water", "trash", or "power".
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Selected Category & Continue Button */}
      <View style={styles.bottomBar}>
        {selectedCategory ? (
          <View style={styles.selectedPreviewBox}>
            <View style={styles.selectedRow}>
              <Text style={styles.selectedLabel}>Selected Category:</Text>
              <Text style={styles.selectedName}>{selectedCategory.name}</Text>
            </View>
            <Text style={styles.selectedInst} numberOfLines={1}>
              🏢 {selectedCategory.responsibleInstitution}
            </Text>
          </View>
        ) : (
          <Text style={styles.hintText}>Tap a category above to select</Text>
        )}

        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selectedCategory && styles.continueBtnDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedCategory}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            Continue to Photo & Location →
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headlineGroup: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  categoriesList: {},
  emptySearchBox: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
  },
  emptySearchSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedPreviewBox: {
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  selectedInst: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 10,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

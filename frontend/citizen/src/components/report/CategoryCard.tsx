import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { ProblemCategory } from '../../types';

interface Props {
  category: ProblemCategory;
  isSelected: boolean;
  selectedSubIssue?: string;
  onSelectCategory: (category: ProblemCategory) => void;
  onSelectSubIssue?: (subIssue: string) => void;
}

export const CategoryCard: React.FC<Props> = ({
  category,
  isSelected,
  selectedSubIssue,
  onSelectCategory,
  onSelectSubIssue,
}) => {
  const getEmoji = (key: string) => {
    switch (key) {
      case 'roads':
        return '🚧';
      case 'water':
        return '💧';
      case 'waste':
        return '🗑️';
      case 'lighting':
        return '💡';
      default:
        return '📍';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: category.color },
        isSelected && [styles.cardSelected, { borderColor: category.color }],
      ]}
      onPress={() => onSelectCategory(category)}
      activeOpacity={0.85}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: category.color + '1A' }]}>
          <Text style={styles.emoji}>{getEmoji(category.key)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{category.name}</Text>
          <View style={styles.translationRow}>
            {category.nameLocal && (
              <Text style={styles.localText}>{category.nameLocal}</Text>
            )}
            {category.nameAmharic && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.amharicText}>{category.nameAmharic}</Text>
              </>
            )}
          </View>
        </View>

        {/* Selected Checkmark Badge */}
        <View
          style={[
            styles.checkCircle,
            isSelected && { backgroundColor: category.color, borderColor: category.color },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{category.description}</Text>

      {/* Sub-Issue Quick Selection Chips */}
      {category.subIssues && category.subIssues.length > 0 && (
        <View style={styles.subIssuesContainer}>
          <Text style={styles.subIssueLabel}>Common problem types:</Text>
          <View style={styles.chipsWrap}>
            {category.subIssues.map((issue) => {
              const isChipSelected = isSelected && selectedSubIssue === issue;
              return (
                <TouchableOpacity
                  key={issue}
                  style={[
                    styles.chip,
                    isChipSelected && [styles.chipSelected, { backgroundColor: category.color }],
                  ]}
                  onPress={() => {
                    onSelectCategory(category);
                    if (onSelectSubIssue) {
                      onSelectSubIssue(issue);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isChipSelected && styles.chipTextSelected,
                    ]}
                  >
                    {issue}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Routing Target Preview matching BR-001 transparency */}
      <View style={styles.routingPreview}>
        <Ionicons name="git-network-outline" size={14} color={category.color} />
        <Text style={styles.routingLabel}>Dispatches directly to: </Text>
        <Text style={[styles.routingInst, { color: category.color }]} numberOfLines={1}>
          {category.responsibleInstitution}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: '#FAFDFB',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  localText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: '#9CA3AF',
    fontSize: 10,
  },
  amharicText: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  subIssuesContainer: {
    marginTop: 2,
    marginBottom: 12,
  },
  subIssueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
    gap: 6,
  },
  routingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  routingInst: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
});

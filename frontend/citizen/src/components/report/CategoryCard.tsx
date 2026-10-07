import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
        { borderTopColor: category.color },
        isSelected && [styles.cardSelected, { borderColor: category.color }],
      ]}
      onPress={() => onSelectCategory(category)}
      activeOpacity={0.85}
    >
      {/* Top Header Row - Centered */}
      <View style={styles.topRowCentered}>
        <View style={[styles.iconBox, { backgroundColor: category.color + '1A' }]}>
          <Text style={styles.emoji}>{getEmoji(category.key)}</Text>
        </View>

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

        {/* Selected Checkmark Badge (Positioned at top right of card) */}
        <View
          style={[
            styles.checkCircle,
            isSelected && { backgroundColor: category.color, borderColor: category.color },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </View>

      {/* Centered Description */}
      <Text style={styles.description}>{category.description}</Text>

      {/* Sub-Issue Quick Selection Chips - Centered */}
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

      {/* Routing Target Preview - Centered */}
      <View style={styles.routingPreview}>
        <Ionicons name="navigate-circle-outline" size={15} color={category.color} />
        <Text style={styles.routingLabel}>Routes directly to:</Text>
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
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderTopWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  cardSelected: {
    backgroundColor: '#FAFDFB',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topRowCentered: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
  },
  localText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dotSeparator: {
    marginHorizontal: 5,
    color: '#9CA3AF',
    fontSize: 10,
  },
  amharicText: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  subIssuesContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  subIssueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
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
    textAlign: 'center',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 2,
    gap: 6,
    width: '100%',
  },
  routingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  routingInst: {
    fontSize: 11,
    fontWeight: '700',
    maxWidth: '55%',
  },
});

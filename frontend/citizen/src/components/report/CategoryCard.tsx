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
  onSelectCategory: (category: ProblemCategory) => void;
}

export const CategoryCard: React.FC<Props> = ({
  category,
  isSelected,
  onSelectCategory,
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
      {/* Selected Checkmark Badge (Positioned top right) */}
      <View
        style={[
          styles.checkCircle,
          isSelected && { backgroundColor: category.color, borderColor: category.color },
        ]}
      >
        {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>

      {/* Centered Top Icon & Emoji */}
      <View style={[styles.iconBox, { backgroundColor: category.color + '1F' }]}>
        <Text style={styles.emoji}>{getEmoji(category.key)}</Text>
      </View>

      {/* Centered Category Title */}
      <Text style={styles.title}>{category.name}</Text>

      {/* Centered Multilingual Translations (Afaan Oromoo & Amharic) */}
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

      {/* Centered Description */}
      <Text style={styles.description}>{category.description}</Text>

      {/* Centered Institutional Routing Badge */}
      <View style={styles.routingPreview}>
        <Ionicons name="navigate-circle-outline" size={16} color={category.color} />
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
  checkCircle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  localText: {
    fontSize: 12,
    color: '#008744',
    fontWeight: '700',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#9CA3AF',
    fontSize: 12,
  },
  amharicText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  routingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  routingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  routingInst: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
});

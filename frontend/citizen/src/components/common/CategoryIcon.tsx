import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryIconProps {
  categoryKey?: string;
  size?: number;
  color?: string;
}

export const getCategoryIconName = (key?: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (key?.toLowerCase()) {
    case 'roads':
    case 'road':
      return 'road-variant';
    case 'water':
      return 'water';
    case 'waste':
    case 'sanitation':
      return 'trash-can-outline';
    case 'lighting':
    case 'electricity':
      return 'lightbulb-on-outline';
    default:
      return 'alert-circle-outline';
  }
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryKey,
  size = 28,
  color = '#1B5E20',
}) => {
  const iconName = getCategoryIconName(categoryKey);
  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
};

export default CategoryIcon;

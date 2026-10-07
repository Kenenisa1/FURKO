import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  centered?: boolean;
}

export const FurkoLogo: React.FC<Props> = ({
  size = 'medium',
  showTagline = true,
  centered = true,
}) => {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 44 : 32;
  const titleSize = size === 'small' ? 18 : size === 'large' ? 28 : 22;
  const taglineSize = size === 'small' ? 8 : size === 'large' ? 11 : 9.5;

  return (
    <View style={[styles.container, centered && styles.centered]}>
      <View style={styles.iconWrapper}>
        {/* Stylized Pin emblem */}
        <View style={[styles.pinBackground, { width: iconSize + 14, height: iconSize + 14, borderRadius: (iconSize + 14) / 2 }]}>
          <Ionicons
            name="location"
            size={iconSize}
            color={Colors.primary}
          />
        </View>
      </View>
      <Text style={[styles.title, { fontSize: titleSize }]}>FURKO</Text>
      {showTagline && (
        <Text style={[styles.tagline, { fontSize: taglineSize }]}>
          Report. Track. Resolve.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  centered: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  pinBackground: {
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#0F2F1E',
    letterSpacing: 2,
    fontFamily: 'System',
  },
  tagline: {
    color: '#008744',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 1,
  },
});

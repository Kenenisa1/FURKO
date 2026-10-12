import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface Props {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showTagline?: boolean;
  centered?: boolean;
}

export const FurkoLogo: React.FC<Props> = ({
  size = 'medium',
  showTagline = false,
  centered = true,
}) => {
  // Official FURKO logo aspect ratio 1.5:1 (1024x682)
  const dimensions =
    size === 'small'
      ? { width: 78, height: 52 }
      : size === 'large'
      ? { width: 174, height: 116 }
      : size === 'xlarge'
      ? { width: 240, height: 160 }
      : { width: 120, height: 80 };

  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Image
        source={require('../../../assets/furko-logo.png')}
        style={[styles.logoImage, dimensions]}
        resizeMode="contain"
      />
      {showTagline && (
        <Text style={styles.tagline}>Report. Track. Resolve.</Text>
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
    justifyContent: 'center',
  },
  logoImage: {
    backgroundColor: 'transparent',
  },
  tagline: {
    color: '#008744',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },
});

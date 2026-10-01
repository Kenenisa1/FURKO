import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

const KEYPAD_DATA = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'abc' },
    { digit: '3', letters: 'def' },
  ],
  [
    { digit: '4', letters: 'ghi' },
    { digit: '5', letters: 'jkl' },
    { digit: '6', letters: 'mno' },
  ],
  [
    { digit: '7', letters: 'pqrs' },
    { digit: '8', letters: 'tuv' },
    { digit: '9', letters: 'wxyz' },
  ],
  [
    { digit: '', letters: '', isBlank: true },
    { digit: '0', letters: '' },
    { digit: 'back', letters: '', isBackspace: true },
  ],
];

export const CustomKeypad: React.FC<Props> = ({ onKeyPress, onBackspace }) => {
  return (
    <View style={styles.container}>
      {KEYPAD_DATA.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((item, colIndex) => {
            if (item.isBlank) {
              return <View key={`blank-${colIndex}`} style={styles.keyPlaceholder} />;
            }

            if (item.isBackspace) {
              return (
                <TouchableOpacity
                  key={`back-${colIndex}`}
                  style={styles.key}
                  onPress={onBackspace}
                  activeOpacity={0.65}
                >
                  <Ionicons name="backspace-outline" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={`key-${item.digit}`}
                style={styles.key}
                onPress={() => onKeyPress(item.digit)}
                activeOpacity={0.65}
              >
                <Text style={styles.digitText}>{item.digit}</Text>
                {item.letters ? (
                  <Text style={styles.lettersText}>{item.letters}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 5,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  keyPlaceholder: {
    flex: 1,
    marginHorizontal: 5,
    height: 52,
  },
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  lettersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: -2,
    textTransform: 'lowercase',
  },
});

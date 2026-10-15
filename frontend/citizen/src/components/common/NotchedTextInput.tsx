import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Props {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  isPassword?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export const NotchedTextInput = forwardRef<TextInput, Props>(
  (
    {
      iconName,
      label,
      value,
      onChangeText,
      placeholder,
      keyboardType = 'default',
      secureTextEntry = false,
      autoCapitalize = 'none',
      isPassword = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit = true,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={styles.container}>
        {/* Floating Tag over Top-Left Border */}
        <View style={styles.floatingBadge}>
          <Feather
            name={iconName}
            size={14}
            color={isFocused ? Colors.primary : '#9CA3AF'}
            style={styles.badgeIcon}
          />
          <Text style={[styles.badgeText, isFocused && styles.badgeTextFocused]}>
            {label}
          </Text>
        </View>

        {/* Input Box */}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputFocused,
          ]}
        >
          <TextInput
            ref={ref}
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            secureTextEntry={isPassword ? !showPassword : secureTextEntry}
            autoCapitalize={autoCapitalize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
          />

          {isPassword && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

NotchedTextInput.displayName = 'NotchedTextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
  },
  floatingBadge: {
    position: 'absolute',
    top: -9,
    left: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginRight: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  badgeTextFocused: {
    color: Colors.primary,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    padding: 6,
  },
});

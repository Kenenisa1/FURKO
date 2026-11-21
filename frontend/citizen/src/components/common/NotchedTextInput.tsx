import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  NativeSyntheticEvent,
  TextInputFocusEventData,
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
  autoCorrect?: boolean;
  autoComplete?: any;
  textContentType?: any;
  isPassword?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
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
      autoCorrect = true,
      autoComplete,
      textContentType,
      isPassword = false,
      returnKeyType,
      onSubmitEditing,
      blurOnSubmit = true,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => inputRef.current as TextInput);

    return (
      <View style={styles.container}>
        {/* Floating Tag over Top-Left Border - pointerEvents="none" so clicks pass through to input */}
        <View style={styles.floatingBadge} pointerEvents="none">
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

        {/* Input Box - Pressable container to focus text input on any area click */}
        <Pressable
          style={[
            styles.inputContainer,
            isFocused && styles.inputFocused,
          ]}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            secureTextEntry={isPassword ? !showPassword : secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            autoComplete={autoComplete}
            textContentType={textContentType}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
          />

          {isPassword && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </Pressable>
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
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    padding: 6,
  },
});

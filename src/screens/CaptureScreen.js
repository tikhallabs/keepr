// CaptureScreen.js — Quick capture modal for Commitments and Ideas
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { createRecord } from '../services/recordsService';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { extractTextFromImage } from '../services/visionService';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { supabase } from '../services/supabase';

export default function CaptureScreen({ navigation, route }) {
  const [objectType, setObjectType] = useState('commitment');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { isRecording, isTranscribing, voiceError, handleMicPress } = useVoiceRecorder(
    (transcribedText) => setBody(transcribedText)
  );

    const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCameraPress = async () => {
    try {
      setIsScanning(false);
      setCapturedImage(null);

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      const photo = result.assets[0];
      setCapturedImage(photo.uri);
      setIsScanning(true);

      let base64Image = photo.base64;
      if (base64Image && base64Image.includes(',')) {
        base64Image = base64Image.split(',')[1];
      }

      const extractedText = await extractTextFromImage(base64Image);
      setBody(extractedText);

    } catch (err) {
      setError('Could not read text from image. Please try again.');
    } finally {
      setIsScanning(false);
      setCapturedImage(null);
    }
  };

  // Auto-focus keyboard when screen opens
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle text extracted from camera (U07)
  useEffect(() => {
    const extractedText = route?.params?.extractedText;
    if (extractedText) {
      setBody(extractedText);
      navigation.setParams({ extractedText: null, timestamp: null });
    }
  }, [route?.params?.timestamp]);
  
  const handleSave = async () => {
    if (!body.trim()) {
      setError('Please enter something to capture.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await createRecord({
        userId: user.id,
        body,
        objectType,
      });
      navigation.goBack();
    } catch (err) {
      setError('Failed to save. Please try again.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      <View style={styles.modal}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Capture</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle: Commitment / Idea */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, objectType === 'commitment' && styles.toggleActive]}
            onPress={() => setObjectType('commitment')}
          >
            <Text style={[styles.toggleText, objectType === 'commitment' && styles.toggleTextActive]}>
              Commitment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, objectType === 'idea' && styles.toggleActive]}
            onPress={() => setObjectType('idea')}
          >
            <Text style={[styles.toggleText, objectType === 'idea' && styles.toggleTextActive]}>
              Idea
            </Text>
          </TouchableOpacity>
        </View>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={
            objectType === 'commitment'
              ? "What did you commit to?"
              : "What's the idea?"
          }
          placeholderTextColor={colors.textSecondary}
          value={body}
          onChangeText={setBody}
          multiline
          autoCapitalize="sentences"
          textAlignVertical="top"
        />

        {/* Character count */}
        <Text style={styles.charCount}>{body.length} characters</Text>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.surface} />
            : <Text style={styles.saveButtonText}>
                Save {objectType === 'commitment' ? 'Commitment' : 'Idea'}
              </Text>
          }
        </TouchableOpacity>

{/* Capture buttons row — Mic + Camera */}
        <View style={styles.captureRow}>

          {/* Mic button — U06 */}
          <TouchableOpacity
            style={[styles.captureAction, isRecording && styles.micButtonRecording]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
            <Text style={styles.micLabel}>
              {isTranscribing ? 'Transcribing...' : isRecording ? 'Tap to stop' : 'Tap to speak'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.captureRowDivider} />

         {/* Camera button — U07 */}
          <TouchableOpacity
            style={styles.captureAction}
            onPress={handleCameraPress}
            disabled={isRecording || isTranscribing || isScanning}
          >
            <Text style={styles.micIcon}>📷</Text>
            <Text style={styles.micLabel}>{isScanning ? 'Reading...' : 'Scan text'}</Text>
          </TouchableOpacity>

        </View>

        {voiceError ? <Text style={styles.error}>{voiceError}</Text> : null}
                {/* Image preview while scanning */}
        {capturedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
            {isScanning && (
              <View style={styles.imagePreviewOverlay}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.imagePreviewText}>Reading text...</Text>
              </View>
            )}
          </View>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    minHeight: 420,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  cancelText: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleActive: {
    backgroundColor: colors.primary,
    elevation: 2,
  },
  toggleText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  toggleTextActive: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 120,
  },
  charCount: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  error: {
    color: '#E53E3E',
    fontSize: typography.size.sm,
    marginBottom: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  captureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  captureRowDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  micButtonRecording: {
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.md,
  },
  micIcon: {
    fontSize: 20,
  },
  micLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
    imagePreviewContainer: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    height: 120,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  imagePreviewText: {
    color: '#fff',
    fontSize: typography.size.sm,
  },
});
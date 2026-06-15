// useVoiceRecorder.js — Manages audio recording start/stop and calls Whisper
import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { transcribeAudio } from '../services/whisperService';

export function useVoiceRecorder(onTranscription) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      setVoiceError('');

      // Ask for microphone permission
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setVoiceError('Microphone permission denied.');
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);

    } catch (err) {
      setVoiceError('Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsTranscribing(true);

      // Stop the recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Send to Whisper
      const transcribedText = await transcribeAudio(uri);
      onTranscription(transcribedText);

    } catch (err) {
      setVoiceError('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    isTranscribing,
    voiceError,
    handleMicPress,
  };
}
import { useState } from 'react';
import {
  useAudioRecorder,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { transcribeAudio } from '../services/whisperService';

export function useVoiceRecorder(onTranscription) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = async () => {
    try {
      setVoiceError('');

      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setVoiceError('Microphone permission denied.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);

    } catch (err) {
      setVoiceError('Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsTranscribing(true);

      await recorder.stop();
      const uri = recorder.uri;

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

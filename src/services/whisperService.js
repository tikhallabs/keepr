// whisperService.js — Sends audio file to OpenAI Whisper API and returns transcribed text
// Handles both web (blob) and native (file URI) environments automatically
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeAudio(audioUri) {
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

  if (!apiKey) {
    throw new Error('OpenAI API key not found. Check your .env file.');
  }

  const formData = new FormData();

  if (Platform.OS === 'web') {
    // Web: fetch the audio blob from the local URL and append as a file
    const response = await fetch(audioUri);
    const blob = await response.blob();
    const file = new File([blob], 'recording.webm', { type: blob.type });
    formData.append('file', file);
  } else {
    // Native (Android / iOS): append the file URI directly
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
  }

  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch(WHISPER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('Whisper error:', JSON.stringify(errorData));
    throw new Error(errorData.error?.message || 'Whisper API call failed.');
  }

  const data = await response.json();
  return data.text;
}
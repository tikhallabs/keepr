import messaging from '@react-native-firebase/messaging';
import { supabase } from './supabase';

async function saveTokenToSupabase(token) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return;

  const { error } = await supabase
    .from('users')
    .update({ fcm_token: token, fcm_token_updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) console.log('[FCM] Failed to save token to Supabase:', error.message);
}

// Call this once at the top of App.js, outside the React tree.
// Firebase requires background handlers to be registered before any component mounts.
export function registerBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage);
  });
}

// Call this from inside the app once the user is signed in.
// Returns the FCM token string, or null if permission was denied.
export async function requestPermissionAndGetToken() {
  const authStatus = await messaging().requestPermission();
  const granted =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    console.log('[FCM] Notification permission denied');
    return null;
  }

  const token = await messaging().getToken();
  console.log('[FCM] Device token:', token);
  await saveTokenToSupabase(token);
  return token;
}

// Call this from inside the app to listen for foreground messages.
// Returns an unsubscribe function — call it in a useEffect cleanup.
export function onForegroundMessage(handler) {
  return messaging().onMessage(handler);
}

// Call this from inside the app after sign-in to keep the stored token current.
// Returns an unsubscribe function — call it in a useEffect cleanup.
export function setupTokenRefreshListener() {
  return messaging().onTokenRefresh(saveTokenToSupabase);
}

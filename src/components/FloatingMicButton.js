// FloatingMicButton.js — Persistent floating mic button (D006)
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../constants/theme';

export default function FloatingMicButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.micButton} onPress={() => navigation.navigate('Capture')}>
      <Text style={styles.micIcon}>🎙️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  micButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  micIcon: {
    fontSize: 24,
  },
});
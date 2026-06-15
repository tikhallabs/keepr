// SignUpScreen.js — New user registration
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { supabase } from '../../services/supabase';

export default function SignUpScreen({ navigation }) {
  const [loginType, setLoginType] = useState('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getIdentifier = () => {
    if (loginType === 'email') return email.trim().toLowerCase();
    return `91${mobile.trim()}@keepr.app`;
  };

  const validate = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (loginType === 'email') {
      if (!email.trim()) return 'Please enter your email.';
      if (!email.includes('@')) return 'Please enter a valid email.';
    } else {
      if (!mobile.trim()) return 'Please enter your mobile number.';
      if (mobile.trim().length !== 10) return 'Please enter a valid 10-digit number.';
    }
    if (!password) return 'Please enter a password.';
    if (password.length < 4) return 'Password must be at least 4 characters.';
    if (password.length > 15) return 'Password must be 15 characters or less.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSignUp = async () => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    const identifier = getIdentifier();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: identifier,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from('users').insert({
      id: data.user.id,
      email: loginType === 'email' ? email.trim().toLowerCase() : null,
      full_name: fullName.trim(),
    });

    if (dbError) {
      setError('Account created but profile save failed. Please contact support.');
      setLoading(false);
      return;
    }

    setLoading(false);
    navigation.navigate('Welcome');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Let's get you set up in 60 seconds.</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, loginType === 'email' && styles.toggleActive]}
          onPress={() => setLoginType('email')}
        >
          <Text style={[styles.toggleText, loginType === 'email' && styles.toggleTextActive]}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, loginType === 'mobile' && styles.toggleActive]}
          onPress={() => setLoginType('mobile')}
        >
          <Text style={[styles.toggleText, loginType === 'mobile' && styles.toggleTextActive]}>
            Mobile
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your full name"
        placeholderTextColor={colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      {loginType === 'email' ? (
        <>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.mobileRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.mobileInput]}
              placeholder="10-digit number"
              placeholderTextColor={colors.textSecondary}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </>
      )}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="4–15 characters"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Repeat your password"
        placeholderTextColor={colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.surface} />
          : <Text style={styles.primaryButtonText}>Create Account</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
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
    backgroundColor: colors.surface,
    elevation: 2,
  },
  toggleText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.size.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  mobileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryCode: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: typography.size.md,
    color: colors.text,
    fontWeight: typography.weight.medium,
  },
  mobileInput: { flex: 1 },
  error: {
    color: '#E53E3E',
    fontSize: typography.size.sm,
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  link: {
    textAlign: 'center',
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
});
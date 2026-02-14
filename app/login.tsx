import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ChronicleFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { authLoading, isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login({
        email: email.trim(),
        password,
      });
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#2b1f12" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboardWrap}>
        <View style={styles.card}>
          <Text style={styles.title}>WVA Sea Skills Login</Text>
          <Text style={styles.subtitle}>Sign in with your Wartime Maritime account</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            style={styles.input}
            placeholder="student@wartimevessels.org"
            editable={!submitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            style={styles.input}
            placeholder="Password"
            editable={!submitting}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign in to your account"
            disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'Signing in...' : 'Sign in'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8dbc0',
    justifyContent: 'center',
    padding: 16,
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8dbc0',
  },
  card: {
    borderWidth: 2,
    borderColor: '#2b1f12',
    backgroundColor: '#f3ead6',
    padding: 16,
    gap: 10,
  },
  title: {
    color: '#2b1f12',
    fontFamily: ChronicleFonts.headingBlack,
    fontSize: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b5a46',
    fontFamily: ChronicleFonts.headingItalic,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
  },
  label: {
    color: '#2b1f12',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2b1f12',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: '#2b1f12',
    fontFamily: ChronicleFonts.body,
    fontSize: 16,
  },
  error: {
    color: '#8b0000',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2b1f12',
    backgroundColor: 'rgba(236,198,110,0.9)',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#2b1f12',
    fontFamily: ChronicleFonts.bodySemiBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

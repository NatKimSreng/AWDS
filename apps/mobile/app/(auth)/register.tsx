import { useState, useCallback } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/AuthInput';
import { AuthButton } from '@/components/AuthButton';
import { AuthLink } from '@/components/AuthLink';
import { register } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  general?: string;
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== passwordConfirmation) {
      next.password_confirmation = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, email, password, passwordConfirmation]);

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const { user, token } = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        password_confirmation: passwordConfirmation,
      });
      await setAuth(user, token);
      setIsRegistered(true);
    } catch (error: any) {
      const data = error?.data;
      if (data?.errors) {
        setErrors(data.errors as FormErrors);
      } else {
        setErrors({
          general: error?.message ?? 'Registration failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center px-6">
        <View className="bg-white rounded-2xl p-6 shadow-card">
          <Text className="font-heading text-2xl text-gyg-navy text-center mb-3">
            Account created!
          </Text>
          <Text className="font-body text-gyg-muted text-center mb-6">
            We've sent a verification email to {email}. Please verify your email before booking.
          </Text>
          <AuthButton title="Explore tours" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-8">
              <Text className="font-heading text-3xl text-gyg-navy text-center">
                Create account
              </Text>
              <Text className="font-body text-gyg-muted text-center mt-2">
                Save tours, track bookings, and book faster next time
              </Text>
            </View>

            <AuthInput
              label="Full name"
              placeholder="John Doe"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <AuthInput
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <AuthInput
              label="Phone (optional)"
              placeholder="+855 12 345 678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
            />

            <AuthInput
              label="Password"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <AuthInput
              label="Confirm password"
              placeholder="••••••••"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              error={errors.password_confirmation}
            />

            {errors.general ? (
              <Text className="mb-4 text-sm font-body text-error-red text-center">
                {errors.general}
              </Text>
            ) : null}

            <AuthButton
              title="Sign Up"
              loading={isLoading}
              onPress={handleRegister}
            />

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="font-body text-gyg-muted">Already have an account? </Text>
              <AuthLink href="/login">Sign in</AuthLink>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

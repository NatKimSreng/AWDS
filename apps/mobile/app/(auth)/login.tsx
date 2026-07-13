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
import { login } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password]);

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const { user, token } = await login({ email: email.trim(), password });
      await setAuth(user, token);
      router.replace('/(tabs)');
    } catch (error: any) {
      setErrors({
        general:
          error?.message ?? 'Login failed. Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
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
              <Text className="font-heading text-3xl text-stone-charcoal text-center">
                Welcome back
              </Text>
              <Text className="font-body text-stone-gray text-center mt-2">
                Sign in to explore Angkor tours
              </Text>
            </View>

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
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            {errors.general ? (
              <Text className="mb-4 text-sm font-body text-error-red text-center">
                {errors.general}
              </Text>
            ) : null}

            <AuthButton
              title="Sign In"
              loading={isLoading}
              onPress={handleLogin}
            />

            <View className="mt-4 flex-row justify-center">
              <AuthLink href="/forgot-password">Forgot password?</AuthLink>
            </View>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="font-body text-stone-gray">Don't have an account? </Text>
              <AuthLink href="/register">Sign up</AuthLink>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

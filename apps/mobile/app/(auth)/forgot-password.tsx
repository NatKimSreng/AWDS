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
import { forgotPassword } from '@/lib/authApi';

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validate = useCallback((): boolean => {
    const next: FormErrors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      await forgotPassword({ email: email.trim() });
      setIsSent(true);
    } catch (error: any) {
      setErrors({
        general:
          error?.message ??
          'Could not send reset link. Please check your email and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center px-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="font-heading text-2xl text-stone-charcoal text-center mb-3">
            Check your email
          </Text>
          <Text className="font-body text-stone-gray text-center mb-6">
            If an account exists for {email}, we've sent a password reset link.
          </Text>
          <AuthButton title="Back to sign in" onPress={() => router.replace('/login')} />
        </View>
      </SafeAreaView>
    );
  }

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
                Reset password
              </Text>
              <Text className="font-body text-stone-gray text-center mt-2">
                Enter your email and we'll send you a reset link
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

            {errors.general ? (
              <Text className="mb-4 text-sm font-body text-error-red text-center">
                {errors.general}
              </Text>
            ) : null}

            <AuthButton
              title="Send reset link"
              loading={isLoading}
              onPress={handleSubmit}
            />

            <View className="mt-8 flex-row justify-center">
              <AuthLink href="/login">Back to sign in</AuthLink>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

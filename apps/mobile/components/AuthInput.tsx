import { TextInput, TextInputProps, View, Text } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, secureTextEntry, ...props }: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-body text-gyg-text font-semibold">{label}</Text>
      <TextInput
        className={`rounded-xl border px-4 py-3.5 font-body text-gyg-text ${
          error
            ? 'border-error-red bg-error-red/5'
            : 'border-gyg-border bg-gyg-bg focus:border-gyg-navy'
        }`}
        placeholderTextColor="#6B7280"
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs font-body text-error-red">{error}</Text>
      ) : null}
    </View>
  );
}

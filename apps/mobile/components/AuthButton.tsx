import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
} from 'react-native';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function AuthButton({
  title,
  loading,
  variant = 'primary',
  disabled,
  ...props
}: AuthButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={`rounded-xl py-3.5 items-center justify-center ${
        isPrimary
          ? 'bg-angkor-orange active:bg-angkor-orange-dark'
          : 'border border-angkor-orange bg-transparent active:bg-angkor-orange-light/30'
      } ${(disabled || loading) ? 'opacity-60' : ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#C8530A'} />
      ) : (
        <Text
          className={`font-body text-base font-semibold ${
            isPrimary ? 'text-white' : 'text-angkor-orange'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

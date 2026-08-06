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
          ? 'bg-gyg-navy active:bg-black'
          : 'border border-gyg-navy bg-transparent active:bg-gyg-light'
      } ${(disabled || loading) ? 'opacity-60' : ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : '#000C3B'} />
      ) : (
        <Text
          className={`font-body text-base font-semibold ${
            isPrimary ? 'text-white' : 'text-gyg-navy'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

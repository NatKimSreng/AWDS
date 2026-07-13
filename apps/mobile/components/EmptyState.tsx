import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="py-12 px-8 items-center">
      <View className="w-20 h-20 rounded-full bg-angkor-orange/10 items-center justify-center mb-4">
        <FontAwesome name={icon} size={32} color="#C8530A" />
      </View>
      <Text className="font-heading text-lg text-stone-charcoal mb-2 text-center">
        {title}
      </Text>
      {subtitle && (
        <Text className="font-body text-stone-gray text-center mb-5">{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-angkor-orange rounded-xl px-6 py-3 active:bg-angkor-orange-dark"
        >
          <Text className="font-body text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

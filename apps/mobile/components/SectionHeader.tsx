import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Href } from 'expo-router';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  href?: Href | string;
  onPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  href,
  onPress,
}: SectionHeaderProps) {
  const handlePress = () => {
    if (onPress) onPress();
    else if (href) router.push(href as Href);
  };

  return (
    <View className="flex-row items-end justify-between mb-3">
      <View className="flex-1 pr-4">
        <Text className="font-heading text-lg text-gyg-text">{title}</Text>
        {subtitle && (
          <Text className="font-body text-xs text-gyg-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
      {(actionLabel || href || onPress) && (
        <Pressable onPress={handlePress} className="flex-row items-center active:opacity-60">
          <Text className="font-body text-sm text-gyg-navy font-semibold">{actionLabel ?? 'See all'}</Text>
          <FontAwesome name="chevron-right" size={12} color="#000C3B" style={{ marginLeft: 4 }} />
        </Pressable>
      )}
    </View>
  );
}

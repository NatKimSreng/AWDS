import { useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ImageWithFallbackProps {
  uri?: string | null;
  source?: ImageSourcePropType;
  alt?: string;
  className?: string;
  containerClassName?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  style?: StyleProp<ImageStyle>;
  showLoading?: boolean;
}

export function ImageWithFallback({
  uri,
  source,
  className = '',
  containerClassName = '',
  resizeMode = 'cover',
  style,
  showLoading = true,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const finalSource = uri && !hasError ? { uri } : source;
  const isEmpty =
    !finalSource ||
    (typeof finalSource === 'object' &&
      'uri' in finalSource &&
      !finalSource.uri);

  if (isEmpty) {
    return (
      <View
        className={`items-center justify-center bg-stone-gray/15 ${containerClassName}`}
      >
        <FontAwesome name="image" size={28} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <View className={`overflow-hidden ${containerClassName}`}>
      <Image
        source={finalSource}
        className={className}
        resizeMode={resizeMode}
        style={style}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {showLoading && isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-stone-gray/10">
          <ActivityIndicator color="#C8530A" />
        </View>
      )}
    </View>
  );
}

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ uri, name = '?', size = 48, className = '' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (uri && !hasError) {
    return (
      <Image
        source={{ uri }}
        className={`rounded-full bg-stone-gray/15 ${className}`}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <View
      className={`rounded-full bg-angkor-orange items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-heading text-white" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

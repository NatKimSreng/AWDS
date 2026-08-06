import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { rewriteAssetUrl } from '@/lib/assetUrl';

interface ImageWithFallbackProps {
  uri?: string | null;
  source?: ImageSourcePropType;
  alt?: string;
  className?: string;
  containerClassName?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  style?: StyleProp<ImageStyle>;
  showLoading?: boolean;
  onLongPress?: () => void;
}

export function ImageWithFallback({
  uri,
  source,
  className = '',
  containerClassName = '',
  resizeMode = 'cover',
  style,
  showLoading = true,
  onLongPress,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const rewrittenUri = useMemo(() => rewriteAssetUrl(uri), [uri]);
  const finalSource = rewrittenUri && !hasError ? { uri: rewrittenUri } : source;
  const isEmpty =
    !finalSource ||
    (typeof finalSource === 'object' &&
      'uri' in finalSource &&
      !finalSource.uri);

  if (isEmpty) {
    return (
      <View
        className={`items-center justify-center bg-gyg-light ${containerClassName}`}
      >
        <FontAwesome name="image" size={28} color="#9CA3AF" />
      </View>
    );
  }

  const imageContent = (
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
        <View className="absolute inset-0 items-center justify-center bg-gyg-light/50">
          <ActivityIndicator color="#000C3B" />
        </View>
      )}
    </View>
  );

  if (onLongPress) {
    return (
      <Pressable onLongPress={onLongPress} className="active:opacity-90">
        {imageContent}
      </Pressable>
    );
  }

  return imageContent;
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
        className={`rounded-full bg-gyg-light ${className}`}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <View
      className={`rounded-full bg-gyg-navy items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-heading text-white" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

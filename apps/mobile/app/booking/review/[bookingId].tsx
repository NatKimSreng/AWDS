import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchReviewEligibility, submitReview } from '@/lib/reviewApi';

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const id = Number(bookingId);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const { data: eligibility, isLoading } = useQuery({
    queryKey: ['review-eligibility', id],
    queryFn: () => fetchReviewEligibility(id),
    enabled: !Number.isNaN(id),
  });

  const mutation = useMutation({
    mutationFn: () =>
      submitReview(id, {
        rating,
        comment: comment.trim(),
        images: images.map((img) => ({
          uri: img.uri,
          type: img.mimeType ?? 'image/jpeg',
          name: img.fileName ?? `review-${Date.now()}.jpg`,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Thank you!', 'Your review has been submitted.');
      router.back();
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message ?? 'Could not submit review.');
    },
  });

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo access to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center">
        <ActivityIndicator color="#000C3B" />
      </SafeAreaView>
    );
  }

  if (eligibility && !eligibility.can_review) {
    return (
      <SafeAreaView className="flex-1 bg-gyg-bg justify-center items-center px-6">
        <FontAwesome name="lock" size={48} color="#6B7280" />
        <Text className="font-heading text-lg text-gyg-text mt-4 text-center">
          {eligibility.reason ?? 'Unable to leave a review'}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-6">
          <Text className="font-body text-gyg-navy font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const activityTitle = eligibility?.activity?.title ?? 'this activity';

  return (
    <SafeAreaView className="flex-1 bg-gyg-bg">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gyg-border">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gyg-bg">
            <FontAwesome name="arrow-left" size={20} color="#000C3B" />
          </Pressable>
          <View className="ml-2 flex-1">
            <Text className="font-heading text-xl text-gyg-text">Write a review</Text>
            <Text className="font-body text-gyg-muted text-sm" numberOfLines={1}>{activityTitle}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <Text className="font-heading text-2xl text-gyg-text mb-1">How was {activityTitle}?</Text>
        <Text className="font-body text-gyg-muted mb-6">Share your experience with other travelers.</Text>

        <View className="flex-row mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} className="mr-3">
              <FontAwesome
                name={star <= rating ? 'star' : 'star-o'}
                size={36}
                color={star <= rating ? '#D4AF37' : '#D1D5DB'}
              />
            </Pressable>
          ))}
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-6">
          <Text className="font-body text-gyg-text font-semibold mb-2">Review</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like? What could be better?"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-gyg-bg rounded-xl p-4 font-body text-gyg-text min-h-[120px] border border-gyg-border"
          />
        </View>

        <View className="bg-white rounded-2xl p-5 shadow-card border border-gyg-border mb-6">
          <Text className="font-body text-gyg-text font-semibold mb-3">Photos ({images.length}/5)</Text>
          <Pressable
            onPress={pickImages}
            className="bg-gyg-bg border border-dashed border-gyg-border rounded-xl p-4 items-center mb-4 active:bg-gyg-light"
          >
            <FontAwesome name="camera" size={24} color="#6B7280" />
            <Text className="font-body text-gyg-muted mt-2">Add photos</Text>
          </Pressable>

          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {images.map((image, index) => (
                <View key={index} className="relative mr-3">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-24 h-24 rounded-xl"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gyg-text rounded-full items-center justify-center"
                  >
                    <FontAwesome name="times" size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <Pressable
          onPress={() => mutation.mutate()}
          disabled={rating === 0 || mutation.isPending}
          className={`rounded-xl py-4 items-center ${
            rating === 0 || mutation.isPending
              ? 'bg-gyg-border'
              : 'bg-gyg-navy active:bg-black'
          }`}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-body text-white font-semibold text-base">Submit Review</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center">
        <ActivityIndicator color="#C8530A" />
      </SafeAreaView>
    );
  }

  if (eligibility && !eligibility.can_review) {
    return (
      <SafeAreaView className="flex-1 bg-sand-bg justify-center items-center px-6">
        <FontAwesome name="lock" size={48} color="#6B635C" />
        <Text className="font-heading text-lg text-stone-charcoal mt-4 text-center">
          {eligibility.reason ?? 'Unable to leave a review'}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-6">
          <Text className="font-body text-angkor-orange font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const activityTitle = eligibility?.activity?.title ?? 'this activity';

  return (
    <SafeAreaView className="flex-1 bg-sand-bg">
      <ScrollView className="flex-1 p-5">
        <Text className="font-heading text-2xl text-stone-charcoal mb-1">
          Rate {activityTitle}
        </Text>
        <Text className="font-body text-stone-gray mb-6">
          Share your experience with other travelers.
        </Text>

        <View className="flex-row mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} className="mr-3">
              <FontAwesome
                name={star <= rating ? 'star' : 'star-o'}
                size={32}
                color={star <= rating ? '#D4AF37' : '#9CA3AF'}
              />
            </Pressable>
          ))}
        </View>

        <Text className="font-body text-stone-charcoal mb-2">Review</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="What did you like? What could be better?"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="bg-white rounded-xl p-4 font-body text-stone-charcoal mb-6 border border-stone-gray/20"
          style={{ minHeight: 120 }}
        />

        <Text className="font-body text-stone-charcoal mb-2">
          Photos ({images.length}/5)
        </Text>
        <Pressable
          onPress={pickImages}
          className="bg-white border border-dashed border-stone-gray/40 rounded-xl p-4 items-center mb-4"
        >
          <FontAwesome name="camera" size={24} color="#6B635C" />
          <Text className="font-body text-stone-gray mt-2">Add photos</Text>
        </Pressable>

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {images.map((image, index) => (
              <View key={index} className="relative mr-3">
                <Image
                  source={{ uri: image.uri }}
                  className="w-24 h-24 rounded-xl"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-stone-charcoal rounded-full items-center justify-center"
                >
                  <FontAwesome name="times" size={12} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <Pressable
          onPress={() => mutation.mutate()}
          disabled={rating === 0 || mutation.isPending}
          className={`rounded-xl py-4 items-center ${
            rating === 0 || mutation.isPending
              ? 'bg-stone-gray/40'
              : 'bg-angkor-orange active:bg-angkor-orange-dark'
          }`}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-body text-white font-semibold">Submit Review</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

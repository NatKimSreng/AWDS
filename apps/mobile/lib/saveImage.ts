import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

/**
 * Save an image to the device photo gallery.
 *
 * Supports both remote URLs (https://...) and base64 data URIs
 * (data:image/png;base64,...). Requests media-library permission
 * automatically when needed.
 */
export async function saveImageToGallery(imageUrl: string | null | undefined): Promise<void> {
  if (!imageUrl) {
    Alert.alert('No image', 'There is nothing to save.');
    return;
  }

  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    if (status !== MediaLibrary.PermissionStatus.GRANTED) {
      if (!canAskAgain) {
        Alert.alert(
          'Permission needed',
          'Please enable photo access in your device settings to save images.'
        );
        return;
      }

      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      if (newStatus !== MediaLibrary.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permission denied',
          'We need photo access to save images to your gallery.'
        );
        return;
      }
    }

    const fileUri = await prepareImageFile(imageUrl);

    await MediaLibrary.saveToLibraryAsync(fileUri);

    Alert.alert('Saved', 'Image saved to your gallery.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    Alert.alert('Could not save', message);
  }
}

/**
 * Convert a remote URL or data URI into a local file URI ready for the gallery.
 */
async function prepareImageFile(imageUrl: string): Promise<string> {
  const dataUriMatch = imageUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);

  if (dataUriMatch) {
    const ext = dataUriMatch[1].toLowerCase() === 'jpg' ? 'jpeg' : dataUriMatch[1].toLowerCase();
    const base64 = dataUriMatch[2];
    const cacheUri = `${FileSystem.cacheDirectory}saved-image-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(cacheUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return cacheUri;
  }

  const ext = getExtensionFromUrl(imageUrl);
  const cacheUri = `${FileSystem.cacheDirectory}saved-image-${Date.now()}.${ext}`;
  const downloadResult = await FileSystem.downloadAsync(imageUrl, cacheUri);

  if (downloadResult.status !== 200) {
    throw new Error(`Download failed with status ${downloadResult.status}`);
  }

  return cacheUri;
}

function getExtensionFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      return ext === 'jpg' ? 'jpeg' : ext;
    }
  } catch {
    // fall through
  }
  return 'jpg';
}

/**
 * Convenience helper to save a QR code data URI from a booking ticket.
 */
export async function saveQrCodeToGallery(qrDataUri: string | null | undefined): Promise<void> {
  if (!qrDataUri) {
    Alert.alert('No QR code', 'There is no QR code to save.');
    return;
  }

  return saveImageToGallery(qrDataUri);
}

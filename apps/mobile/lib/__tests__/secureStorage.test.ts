import * as SecureStore from 'expo-secure-store';
import {
  getToken,
  setToken,
  deleteToken,
  clearAuthCredentials,
} from '@/lib/secureStorage';

const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the stored token', async () => {
    mockGetItemAsync.mockResolvedValueOnce('test-token');
    const token = await getToken();
    expect(token).toBe('test-token');
    expect(mockGetItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('returns null when reading the token fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetItemAsync.mockRejectedValueOnce(new Error('read error'));
    const token = await getToken();
    expect(token).toBeNull();
    consoleSpy.mockRestore();
  });

  it('stores the token securely', async () => {
    await setToken('test-token');
    expect(mockSetItemAsync).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('deletes the token securely', async () => {
    await deleteToken();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('clears both token and refresh token', async () => {
    await clearAuthCredentials();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
  });
});

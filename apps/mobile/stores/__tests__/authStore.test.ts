import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';

const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

describe('useAuthStore', () => {
  const user = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'customer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isLoading: true });
  });

  it('sets auth and stores the token securely', async () => {
    await useAuthStore.getState().setAuth(user, 'token-123');

    expect(mockSetItemAsync).toHaveBeenCalledWith('auth_token', 'token-123');
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().token).toBe('token-123');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('clears auth and removes the secure token', async () => {
    await useAuthStore.getState().setAuth(user, 'token-123');
    await useAuthStore.getState().clearAuth();

    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('restores the token from secure storage', async () => {
    mockGetItemAsync.mockResolvedValueOnce('restored-token');

    await useAuthStore.getState().restoreToken();

    expect(mockGetItemAsync).toHaveBeenCalledWith('auth_token');
    expect(useAuthStore.getState().token).toBe('restored-token');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

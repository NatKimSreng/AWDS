import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardStats,
  getProvider,
  getProviders,
  getListing,
  getListings,
  getBooking,
  getBookings,
  getPayouts,
  getUser,
  getUsers,
  approveProvider,
  rejectProvider,
  toggleFeaturedProvider,
  updateListingStatus,
  deleteListing,
  toggleFeaturedListing,
  updateBookingStatus,
  createPayout,
  markPayoutPaid,
  updateUserRole,
  deleteUser,
  createUser,
} from '../lib/api';

export const dashboardKey = ['admin', 'dashboard'] as const;
export const providerKey = (id: number) => ['admin', 'providers', id] as const;
export const providersKey = (status?: string, query?: string, page = 1) =>
  ['admin', 'providers', { status, query, page }] as const;
export const listingKey = (id: number) => ['admin', 'listings', id] as const;
export const listingsKey = (status?: string, providerId?: number, query?: string, page = 1) =>
  ['admin', 'listings', { status, providerId, query, page }] as const;
export const bookingKey = (id: number) => ['admin', 'bookings', id] as const;
export const bookingsKey = (status?: string, query?: string, page = 1) =>
  ['admin', 'bookings', { status, query, page }] as const;
export const payoutsKey = (status?: string, providerId?: number, page = 1) =>
  ['admin', 'payouts', { status, providerId, page }] as const;
export const userKey = (id: number) => ['admin', 'users', id] as const;
export const usersKey = (role?: string, query?: string, page = 1) =>
  ['admin', 'users', { role, query, page }] as const;

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: getDashboardStats,
    staleTime: 1000 * 60,
  });
}

export function useProvider(id: number) {
  return useQuery({
    queryKey: providerKey(id),
    queryFn: () => getProvider(id),
    staleTime: 1000 * 60,
  });
}

export function useProviders(status?: string, query?: string, page = 1) {
  return useQuery({
    queryKey: providersKey(status, query, page),
    queryFn: () => getProviders(status, query, page),
    staleTime: 1000 * 30,
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: listingKey(id),
    queryFn: () => getListing(id),
    staleTime: 1000 * 60,
  });
}

export function useListings(status?: string, providerId?: number, query?: string, page = 1) {
  return useQuery({
    queryKey: listingsKey(status, providerId, query, page),
    queryFn: () => getListings(status, providerId, query, page),
    staleTime: 1000 * 30,
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: bookingKey(id),
    queryFn: () => getBooking(id),
    staleTime: 1000 * 60,
  });
}

export function useBookings(status?: string, query?: string, page = 1) {
  return useQuery({
    queryKey: bookingsKey(status, query, page),
    queryFn: () => getBookings(status, query, page),
    staleTime: 1000 * 30,
  });
}

export function usePayouts(status?: string, providerId?: number, page = 1) {
  return useQuery({
    queryKey: payoutsKey(status, providerId, page),
    queryFn: () => getPayouts(status, providerId, page),
    staleTime: 1000 * 30,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => getUser(id),
    staleTime: 1000 * 60,
  });
}

export function useUsers(role?: string, query?: string, page = 1) {
  return useQuery({
    queryKey: usersKey(role, query, page),
    queryFn: () => getUsers(role, query, page),
    staleTime: 1000 * 30,
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  return {
    updateRole: useMutation({
      mutationFn: ({ id, role }: { id: number; role: string }) => updateUserRole(id, role),
      onSettled,
    }),
    delete: useMutation({
      mutationFn: deleteUser,
      onSettled,
    }),
    create: useMutation({
      mutationFn: createUser,
      onSettled,
    }),
  };
}

export function useProviderMutations() {
  const queryClient = useQueryClient();

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  return {
    approve: useMutation({
      mutationFn: approveProvider,
      onSettled,
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) => rejectProvider(id, reason),
      onSettled,
    }),
    toggleFeatured: useMutation({
      mutationFn: toggleFeaturedProvider,
      onSettled,
    }),
  };
}

export function useListingMutations() {
  const queryClient = useQueryClient();

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
  };

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) => updateListingStatus(id, status),
      onSettled,
    }),
    delete: useMutation({
      mutationFn: deleteListing,
      onSettled,
    }),
    toggleFeatured: useMutation({
      mutationFn: toggleFeaturedListing,
      onSettled,
    }),
  };
}

export function useBookingMutations() {
  const queryClient = useQueryClient();

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status, note }: { id: number; status: 'confirmed' | 'completed' | 'cancelled'; note?: string }) => updateBookingStatus(id, status, note),
      onSettled,
    }),
  };
}

export function usePayoutMutations() {
  const queryClient = useQueryClient();

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
  };

  return {
    create: useMutation({
      mutationFn: createPayout,
      onSettled,
    }),
    markPaid: useMutation({
      mutationFn: ({ id, transactionRef }: { id: number; transactionRef?: string }) => markPayoutPaid(id, transactionRef),
      onSettled,
    }),
  };
}

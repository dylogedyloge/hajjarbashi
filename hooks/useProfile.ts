import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCountries,
  fetchCities,
  updateProfile,
  getMyProfile,
  saveContactInfo,
  deleteAccount,
  updateLanguage,
  fetchPaymentReceipts,
  fetchTickets,
  fetchTicketCategories,
  fetchTicketTopics,
  createTicket,
  fetchTicketMessages,
  sendTicketMessage,
  type CreateTicketRequest,
  type SendTicketMessageRequest,
} from "@/lib/profile";
import { fetchUserAds } from "@/lib/advertisements";
import type { Country, City } from "@/types/common";
import type { ContactInfoItem } from "@/types/user";
import type { UpdateProfileRequest } from "@/types/profile";

// Fetch countries hook
export function useCountries(locale: string) {
  return useQuery({
    queryKey: ['countries', locale],
    queryFn: () => fetchCountries(locale),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Fetch cities hook
export function useCities(countryId: string, locale: string) {
  return useQuery({
    queryKey: ['cities', countryId, locale],
    queryFn: () => fetchCities(countryId, locale),
    enabled: !!countryId, // Only run query if countryId exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Fetch user profile hook
export function useMyProfile(token: string | null, locale: string) {
  return useQuery({
    queryKey: ['myProfile', token, locale],
    queryFn: () => getMyProfile(token!, locale),
    enabled: !!token, // Only run query if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch user ads hook
export function useUserAds(
  token: string | null, 
  locale: string, 
  page: number = 1, 
  limit: number = 12
) {
  return useQuery({
    queryKey: ['userAds', token, locale, page, limit],
    queryFn: () => fetchUserAds({ limit, page, locale, token: token! }),
    enabled: !!token, // Only run query if token exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch payment receipts hook
export function usePaymentReceipts(
  token: string | null,
  locale: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['paymentReceipts', token, locale, page, limit],
    queryFn: () => fetchPaymentReceipts(token!, locale, page, limit),
    enabled: !!token, // Only run query if token exists
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch tickets hook
export function useTickets(
  token: string | null,
  locale: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['tickets', token, locale, page, limit],
    queryFn: () => fetchTickets(token!, locale, page, limit),
    enabled: !!token, // Only run query if token exists
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch ticket categories hook
export function useTicketCategories(token: string | null, locale: string) {
  return useQuery({
    queryKey: ['ticketCategories', token, locale],
    queryFn: () => fetchTicketCategories(token!, locale),
    enabled: !!token, // Only run query if token exists
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Fetch ticket topics hook
export function useTicketTopics(
  token: string | null,
  locale: string,
  categoryId: number | null
) {
  return useQuery({
    queryKey: ['ticketTopics', token, locale, categoryId],
    queryFn: () => fetchTicketTopics(token!, locale, categoryId!),
    enabled: !!token && !!categoryId, // Only run query if token and categoryId exist
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Fetch ticket messages hook
export function useTicketMessages(
  ticketId: string | null,
  token: string | null,
  locale: string
) {
  return useQuery({
    queryKey: ['ticketMessages', ticketId, token, locale],
    queryFn: () => fetchTicketMessages(ticketId!, token!, locale),
    enabled: !!token && !!ticketId, // Only run query if token and ticketId exist
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create ticket hook
export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      data, 
      token, 
      locale 
    }: { 
      data: CreateTicketRequest; 
      token: string; 
      locale: string; 
    }) => createTicket(data, token, locale),
    onSuccess: (response, variables) => {
      // Invalidate and refetch tickets
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      console.error('Create ticket error:', error);
    },
  });
}

// Send ticket message hook
export function useSendTicketMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      data, 
      token, 
      locale 
    }: { 
      data: SendTicketMessageRequest; 
      token: string; 
      locale: string; 
    }) => sendTicketMessage(data, token, locale),
    onSuccess: (response, variables) => {
      // Invalidate and refetch ticket messages
      queryClient.invalidateQueries({ queryKey: ['ticketMessages'] });
    },
    onError: (error) => {
      console.error('Send ticket message error:', error);
    },
  });
}

// Update profile hook
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      data, 
      token, 
      locale 
    }: { 
      data: UpdateProfileRequest; 
      token: string; 
      locale: string; 
    }) => updateProfile(data, token, locale),
    onSuccess: (response, variables) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      
      // Also invalidate countries and cities if they might be affected
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
}

// Save contact info hook
export function useSaveContactInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      contactInfo, 
      token, 
      showContactInfo 
    }: { 
      contactInfo: ContactInfoItem[]; 
      token: string; 
      showContactInfo: boolean; 
    }) => saveContactInfo(contactInfo, token, showContactInfo),
    onSuccess: (response, variables) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      console.error('Save contact info error:', error);
    },
  });
}

// Delete account hook
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      locale, 
      token 
    }: { 
      locale: string; 
      token: string; 
    }) => deleteAccount({ locale, token }),
    onSuccess: (response, variables) => {
      // Clear all user-related queries after account deletion
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Delete account error:', error);
    },
  });
}

// Update language hook
export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      language, 
      token 
    }: { 
      language: string; 
      token?: string; 
    }) => updateLanguage({ language, token }),
    onSuccess: (response, variables) => {
      // Invalidate user profile to reflect language changes
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
    onError: (error) => {
      console.error('Update language error:', error);
    },
  });
}

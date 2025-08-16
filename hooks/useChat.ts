import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getChatList, 
  openChat, 
  deleteChat, 
  getMessages, 
  uploadAttachment, 
  blockUser, 
  unblockUser 
} from '@/lib/chat';

// Chat list query hook
export function useChatList(token: string | null, locale: string, limit: number = 10, page: number = 1) {
  return useQuery({
    queryKey: ['chatList', token, locale, limit, page],
    queryFn: () => getChatList({ token: token || '', lang: locale, limit, page }),
    enabled: !!token,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Open chat mutation hook
export function useOpenChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ adId, token, locale }: { adId: string; token: string; locale: string }) =>
      openChat({ adId, token, lang: locale }),
    onSuccess: () => {
      // Invalidate chat list to refresh it
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
    onError: (error) => {
      console.error('Open chat error:', error);
    },
  });
}

// Delete chat mutation hook
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, token, locale }: { chatId: number; token: string; locale: string }) =>
      deleteChat({ chatId, token, lang: locale }),
    onSuccess: () => {
      // Invalidate chat list to refresh it
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
    onError: (error) => {
      console.error('Delete chat error:', error);
    },
  });
}

// Messages query hook
export function useMessages(
  chatId: number | null, 
  token: string | null, 
  locale: string, 
  limit: number = 50, 
  page: number = 1, 
  search: string = ''
) {
  return useQuery({
    queryKey: ['messages', chatId, token, locale, limit, page, search],
    queryFn: () => getMessages({ 
      chatId: chatId!, 
      token: token || '', 
      lang: locale, 
      limit, 
      page, 
      search 
    }),
    enabled: !!chatId && !!token,
    staleTime: 10000, // 10 seconds for messages
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Upload attachment mutation hook
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      chatId, 
      file, 
      token, 
      locale 
    }: { 
      chatId: number; 
      file: File; 
      token: string; 
      locale: string 
    }) => uploadAttachment({ chatId, file, token, lang: locale }),
    onSuccess: (data, variables) => {
      // Invalidate messages for this chat to refresh them
      queryClient.invalidateQueries({ 
        queryKey: ['messages', variables.chatId] 
      });
    },
    onError: (error) => {
      console.error('Upload attachment error:', error);
    },
  });
}

// Block user mutation hook
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token, locale }: { userId: string; token: string; locale: string }) =>
      blockUser({ userId, token, lang: locale }),
    onSuccess: (data, variables) => {
      // Invalidate messages to refresh blocked status
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('Block user error:', error);
    },
  });
}

// Unblock user mutation hook
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token, locale }: { userId: string; token: string; locale: string }) =>
      unblockUser({ userId, token, lang: locale }),
    onSuccess: (data, variables) => {
      // Invalidate messages to refresh blocked status
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('Unblock user error:', error);
    },
  });
}

// lib/chat.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '${process.env.NEXT_PUBLIC_API_BASE_URL}';

export async function getChatList({ limit = 10, page = 1, token, lang = 'en' }: { limit?: number; page?: number; token: string; lang?: string }) {
  const res = await fetch(`${API_BASE_URL}/chats?limit=${limit}&page=${page}`, {
    headers: {
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch chats');
  return data.data || [];
}

export async function openChat({ adId, token, lang = 'en' }: { adId: string; token: string; lang?: string }) {
  const res = await fetch(`${API_BASE_URL}/chats/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ad_id: adId }),
  });
  const data = await res.json();
  if (!data.success && data.statusCode !== 409) throw new Error(data.message || 'Failed to open chat');
  return data;
}

export async function deleteChat({ chatId, token, lang = 'en' }: { chatId: number; token: string; lang?: string }) {
  const res = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
    method: 'DELETE',
    headers: {
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to delete chat');
  return data;
}

export async function getMessages({ chatId, token, lang = 'en', limit = 50, page = 1, search = '' }: { chatId: number; token: string; lang?: string; limit?: number; page?: number; search?: string }) {
  const res = await fetch(`${API_BASE_URL}/messages?chat_id=${chatId}&limit=${limit}&page=${page}&search=${encodeURIComponent(search)}`, {
    headers: {
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch messages');
  return data.data || [];
}

export async function uploadAttachment({ chatId, file, token, lang = 'en' }: { chatId: number; file: File; token: string; lang?: string }) {
  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('attachment', file);
  const res = await fetch(`${API_BASE_URL}/messages/upload_attachment`, {
    method: 'POST',
    headers: {
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
      // 'Content-Type' is automatically set by the browser for FormData
    },
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to upload attachment');
  return data.data;
}

// Block a user
export async function blockUser({ userId, token, lang = 'en' }: { userId: string; token: string; lang?: string }) {
  const res = await fetch(`${API_BASE_URL}/block_list/block`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to block user');
  return data;
}

// Unblock a user
export async function unblockUser({ userId, token, lang = 'en' }: { userId: string; token: string; lang?: string }) {
  const res = await fetch(`${API_BASE_URL}/block_list/unblock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to unblock user');
  return data;
} 
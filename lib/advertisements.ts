// const API_BASE_URL = 'http://192.168.10.6:3001';
const API_BASE_URL = 'https://api.hajjardevs.ir';

export async function initAdvertisement(locale: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/ads/init`, {
    method: "POST",
    headers: {
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to initialize advertisement: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadAdMedia({
  id,
  file,
  locale,
  token,
}: {
  id: string;
  file: File;
  locale: string;
  token: string;
}) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("media", file);

  const response = await fetch(`${API_BASE_URL}/ads/upload_media`, {
    method: "POST",
    headers: {
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
      // 'Content-Type' should NOT be set manually for FormData
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Failed to upload ad media: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteAdMedia({
  id,
  mediaPath,
  locale,
  token,
}: {
  id: string;
  mediaPath: string;
  locale: string;
  token: string;
}) {
  const encodedMediaPath = encodeURIComponent(mediaPath);
  const response = await fetch(`${API_BASE_URL}/ads/${id},${encodedMediaPath}`, {
    method: "DELETE",
    headers: {
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete ad media: ${response.statusText}`);
  }
  return response.json();
}

export async function getAdDetails({
  id,
  locale,
  token,
}: {
  id: string;
  locale: string;
  token?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: "GET",
    headers: {
      "x-lang": locale,
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ad details: ${response.statusText}`);
  }
  return response.json();
} 
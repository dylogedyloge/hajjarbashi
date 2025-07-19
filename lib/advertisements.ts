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

export async function updateAd({ payload, locale, token }: { payload: Record<string, unknown>; locale: string; token: string }) {
  const response = await fetch(`${API_BASE_URL}/ads`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': locale,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ad: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchCountries(lang: string) {
  const response = await fetch(`${API_BASE_URL}/countries/list`, {
    method: 'GET',
    headers: {
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  const data = await response.json();
  return data.data || [];
}

export async function fetchCities(countryId: string, lang: string) {
  if (!countryId) return [];
  const response = await fetch(`${API_BASE_URL}/cities/list?country_id=${countryId}`, {
    method: 'GET',
    headers: {
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch cities');
  }
  const data = await response.json();
  return data.data || [];
}

export async function fetchSurfaces(lang: string) {
  const response = await fetch(`${API_BASE_URL}/surfaces/list`, {
    method: 'GET',
    headers: {
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch surfaces');
  }
  const data = await response.json();
  return data.data || [];
}

export async function fetchCategories(lang: string) {
  const response = await fetch(`${API_BASE_URL}/categories/tree`, {
    method: 'GET',
    headers: {
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.data || [];
}

export async function fetchPorts(lang: string) {
  const response = await fetch(`${API_BASE_URL}/ports/list`, {
    method: 'GET',
    headers: {
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ports');
  }
  const data = await response.json();
  return data.data || [];
}

export async function fetchAds({ limit, page, locale, user_id }: { limit: number; page: number; locale: string; user_id?: string }) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });
  
  if (user_id) {
    params.append('user_id', user_id);
  }
  
  const response = await fetch(`${API_BASE_URL}/ads/explore?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-lang': locale,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ads');
  }
  return response.json();
}

export async function fetchAdById({ id, locale }: { id: string; locale: string }) {
  const response = await fetch(`${API_BASE_URL}/ads/watch/${id}`, {
    method: 'GET',
    headers: {
      'x-lang': locale,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ad');
  }
  return response.json();
} 

export async function fetchUserAds({ limit, page, locale, token }: { limit: number; page: number; locale: string; token: string }) {
  const response = await fetch(`${API_BASE_URL}/ads?limit=${limit}&page=${page}`, {
    method: 'GET',
    headers: {
      'x-lang': locale,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user ads');
  }
  return response.json();
} 
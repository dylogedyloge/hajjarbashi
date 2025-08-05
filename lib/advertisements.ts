// const API_BASE_URL = 'http://192.168.10.6:3001';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '${process.env.NEXT_PUBLIC_API_BASE_URL}';

export async function initAdvertisement(locale: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/ads/init`, {
    method: "POST",
    headers: {
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
  });
  
  // Parse the response body once
  const responseData = await response.json();
  
  if (!response.ok) {
    // Use the parsed response data for error message
    throw new Error(responseData.message || `Failed to initialize advertisement: ${response.statusText}`);
  }
  
  return responseData;
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

export async function fetchAds({ 
  limit, 
  page, 
  locale, 
  user_id, 
  token,
  min_price, 
  max_price, 
  form, 
  category_ids, 
  colors, 
  surface_ids, 
  size_range_type, 
  receiving_ports, 
  export_ports, 
  origin_country_ids, 
  grade,
  express,
  promoted,
  search_description,
  sort = "latest"
}: { 
  limit: number; 
  page: number; 
  locale: string; 
  user_id?: string; 
  token?: string;
  min_price?: number; 
  max_price?: number; 
  form?: string; 
  category_ids?: string[]; 
  colors?: string[]; 
  surface_ids?: string[]; 
  size_range_type?: string; 
  receiving_ports?: string[]; 
  export_ports?: string[]; 
  origin_country_ids?: string[]; 
  grade?: string;
  express?: boolean;
  promoted?: boolean;
  search_description?: string;
  sort?: string;
}) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    sort: sort,
  });
  
  if (user_id) {
    params.append('user_id', user_id);
  }
  
  // Add filter parameters
  if (min_price !== undefined) {
    params.append('min_price', min_price.toString());
  }
  
  if (max_price !== undefined) {
    params.append('max_price', max_price.toString());
  }
  
  if (form) {
    params.append('form', form);
    console.log('📦 Form being sent to API:', form);
  }
  
  if (category_ids && category_ids.length > 0) {
    params.append('category_ids', category_ids.join(','));
    console.log('🎨 Category IDs being sent to API:', category_ids);
    console.log('🎨 Category IDs parameter value:', category_ids.join(','));
  }
  
  if (colors && colors.length > 0) {
    params.append('colors', colors.join(','));
    console.log('🎨 Colors being sent to API:', colors);
    console.log('🎨 Colors parameter value:', colors.join(','));
  }
  
  if (surface_ids && surface_ids.length > 0) {
    params.append('surface_ids', surface_ids.join(','));
    console.log('🏗️ Surface IDs being sent to API:', surface_ids);
    console.log('🏗️ Surface IDs parameter value:', surface_ids.join(','));
  }
  
  if (size_range_type) {
    params.append('size_range_type', size_range_type);
    console.log('📏 Size range type being sent to API:', size_range_type);
  }
  
  if (receiving_ports && receiving_ports.length > 0) {
    params.append('receiving_ports', receiving_ports.join(','));
    console.log('🚢 Receiving Ports being sent to API:', receiving_ports);
    console.log('🚢 Receiving Ports parameter value:', receiving_ports.join(','));
  }
  
  if (export_ports && export_ports.length > 0) {
    params.append('export_ports', export_ports.join(','));
    console.log('🚢 Export Ports being sent to API:', export_ports);
    console.log('🚢 Export Ports parameter value:', export_ports.join(','));
  }
  
  if (origin_country_ids && origin_country_ids.length > 0) {
    params.append('origin_country_ids', origin_country_ids.join(','));
    console.log('🌎 Origin Country IDs being sent to API:', origin_country_ids);
    console.log('🌎 Origin Country IDs parameter value:', origin_country_ids.join(','));
  }
  
  if (grade) {
    params.append('grade', grade);
    console.log('⭐ Grade being sent to API:', grade);
  }
  
  if (express) {
    params.append('express', 'true');
    console.log('⚡ Express filter being sent to API: true');
  }
  
  if (promoted) {
    params.append('promoted', 'true');
    console.log('⭐ Promoted filter being sent to API: true');
  }
  
  if (search_description && search_description.trim()) {
    params.append('search_description', search_description.trim());
    console.log('🔍 Search description being sent to API:', search_description);
  }
  
  console.log('🔄 Sort parameter being sent to API:', sort);
  
  const headers: Record<string, string> = {
    'x-lang': locale,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('🔍 fetchAds headers:', headers);
  console.log('🔍 fetchAds URL:', `${API_BASE_URL}/ads/explore?${params.toString()}`);
  
  const response = await fetch(`${API_BASE_URL}/ads/explore?${params.toString()}`, {
    method: 'GET',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch ads');
  }
  return response.json();
}

export async function fetchAdById({ id, locale, token }: { id: string; locale: string; token?: string }) {
  const response = await fetch(`${API_BASE_URL}/ads/watch/${id}`, {
    method: 'GET',
    headers: {
      'x-lang': locale,
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
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

export async function createBookmark({ adId, locale, token }: { adId: string; locale: string; token: string }) {
  console.log('🔖 Creating bookmark for ad:', adId);
  console.log('📡 API URL:', `${API_BASE_URL}/ads/bookmarks/bookmarks`);
  console.log('🔑 Token:', token ? 'Present' : 'Missing');
  console.log('🌐 Locale:', locale);
  
  const response = await fetch(`${API_BASE_URL}/ads/bookmarks/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': locale,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ id: adId }),
  });
  
  console.log('📊 Response status:', response.status);
  console.log('📊 Response ok:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Create bookmark failed:', errorText);
    throw new Error(`Failed to create bookmark: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Create bookmark success:', result);
  return result;
}

export async function deleteBookmark({ adId, locale, token }: { adId: string; locale: string; token: string }) {
  console.log('🗑️ Deleting bookmark for ad:', adId);
  console.log('📡 API URL:', `${API_BASE_URL}/ads/bookmarks/bookmarks/${adId}`);
  console.log('🔑 Token:', token ? 'Present' : 'Missing');
  console.log('🌐 Locale:', locale);
  
  const response = await fetch(`${API_BASE_URL}/ads/bookmarks/bookmarks/${adId}`, {
    method: 'DELETE',
    headers: {
      'x-lang': locale,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📊 Response status:', response.status);
  console.log('📊 Response ok:', response.ok);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Delete bookmark failed:', errorText);
    throw new Error(`Failed to delete bookmark: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('✅ Delete bookmark success:', result);
  return result;
}

export async function fetchBookmarkedAds({ limit, page, locale, token }: { limit: number; page: number; locale: string; token: string }) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
  });
  
  const response = await fetch(`${API_BASE_URL}/ads/bookmarks/bookmarks?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-lang': locale,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch bookmarked ads');
  }
  return response.json();
}

export async function getPaymentReceipt({
  relatedAdId,
  payables,
  discountCode,
  locale,
  token,
}: {
  relatedAdId: string;
  payables: Array<{ type: string }>;
  discountCode: string;
  locale: string;
  token: string;
}) {
  const response = await fetch(`${API_BASE_URL}/payment_receipts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      related_ad_id: relatedAdId,
      payables,
      discount_code: discountCode,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to get payment receipt: ${response.statusText}`);
  }

  return response.json();
}

export async function updatePaymentReceipt({
  id,
  relatedAdId,
  payables,
  discountCode,
  locale,
  token,
}: {
  id: string;
  relatedAdId: string;
  payables: Array<{ type: string }>;
  discountCode: string;
  locale: string;
  token: string;
}) {
  const response = await fetch(`${API_BASE_URL}/payment_receipts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      related_ad_id: relatedAdId,
      payables,
      discount_code: discountCode,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update payment receipt: ${response.statusText}`);
  }

  return response.json();
}

export async function getPaymentReceipts({
  adId,
  limit = 10,
  page = 1,
  locale,
  token,
}: {
  adId: string;
  limit?: number;
  page?: number;
  locale: string;
  token: string;
}) {
  const queryParams = new URLSearchParams({
    ad_id: adId,
    limit: limit.toString(),
    page: page.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/payment_receipts?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to get payment receipts: ${response.statusText}`);
  }

  return response.json();
}

export async function validateDiscountCode({
  discountCode,
  locale,
  token,
}: {
  discountCode: string;
  locale: string;
  token: string;
}) {
  const response = await fetch(`${API_BASE_URL}/discount_codes/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      discount_code: discountCode,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to validate discount code: ${response.statusText}`);
  }

  return response.json();
}

export async function createTransaction({
  receiptId,
  paymentMethod,
  currency,
  locale,
  token,
}: {
  receiptId: string;
  paymentMethod: string;
  currency: string;
  locale: string;
  token: string;
}) {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-lang": locale,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      receipt_id: receiptId,
      payment_method: paymentMethod,
      currency,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to create transaction: ${response.statusText}`);
  }

  return response.json();
}

 
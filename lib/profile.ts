export interface UpdateProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    avatar: string;
    avatar_thumb: string;
  };
  timestamp: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface UpdateProfileRequest {
  country_id: string;
  bio: string;
  position: string;
  name: string;
  company_name: string;
  city_id: string;
  show_contact_info: boolean;
  language: string;
  avatar?: File | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: MyProfileResponse['data'];
  timestamp: string;
}

export interface MyProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    rate: number;
    avatar: string;
    avatar_thumb: string;
    contact_info: string | null;
    show_contact_info: boolean;
    bio: string;
    company_name: string;
    position: string;
    u_country_id: string;
    registration_date: number;
    badge_ids: string | null;
    city_name: string;
    country_name: string;
    type: number;
    token: string;
    wallet_balance: string;
    fcm_token: string | null;
    web_fcm_token: string | null;
    phone: string | null;
    email: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    city_id: string;
    badge_details: unknown;
    published_ad_count: number;
  };
  timestamp: string;
}

export interface ContactInfoItem {
  title: string;
  value: string;
}

export interface SaveContactInfoResponse {
  success: boolean;
  message: string;
  data: unknown;
  timestamp: string;
}

const API_BASE_URL = 'https://api.hajjardevs.ir';
// const API_BASE_URL = 'http://192.168.10.100:3001';


export const profileService = {
  async updateProfileImage(file: File, token: string): Promise<UpdateProfileImageResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/users/update_profile_image`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Upload failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },
};

export async function fetchCountries(lang: string): Promise<Country[]> {
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
  // Assuming the response is { success: true, data: [{ id, name }, ...] }
  return data.data || [];
}

export async function fetchCities(countryId: string, lang: string): Promise<City[]> {
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
  // Assuming the response is { success: true, data: [{ id, name }, ...] }
  return data.data || [];
}

export async function updateProfile(
  data: UpdateProfileRequest,
  token: string,
  lang: string
): Promise<UpdateProfileResponse> {
  const formData = new FormData();
  formData.append('country_id', data.country_id);
  formData.append('bio', data.bio);
  formData.append('position', data.position);
  formData.append('name', data.name);
  formData.append('company_name', data.company_name);
  formData.append('city_id', data.city_id);
  formData.append('show_contact_info', String(data.show_contact_info));
  formData.append('language', data.language);
  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }
  const response = await fetch(`${API_BASE_URL}/users/update_profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-lang': lang,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `Update failed: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function getMyProfile(token: string, lang: string): Promise<MyProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/my_profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-lang': lang,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `Fetch failed: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function saveContactInfo(
  contactInfo: ContactInfoItem[],
  token: string,
  showContactInfo: boolean
): Promise<SaveContactInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/users/contact_info`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact_info: contactInfo, show_contact_info: showContactInfo }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `Save failed: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
} 
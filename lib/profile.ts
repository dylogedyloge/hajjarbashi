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

const API_BASE_URL = 'https://api.hajjardevs.ir';

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
  const response = await fetch('https://api.hajjardevs.ir/countries/list', {
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
  const response = await fetch(`https://api.hajjardevs.ir/cities/list?country_id=${countryId}`, {
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
import type { Country, City } from './common';
import type { ContactInfoItem } from './user';

export interface UpdateProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    avatar: string;
    avatar_thumb: string;
  };
  timestamp: string;
}

export type { Country, City };

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

export interface MyProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    rate: number;
    avatar: string;
    avatar_thumb: string;
    contact_info: ContactInfoItem[] | null;
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

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: MyProfileResponse['data'];
  timestamp: string;
}

export interface SaveContactInfoResponse {
  success: boolean;
  message: string;
  data: unknown;
  timestamp: string;
}



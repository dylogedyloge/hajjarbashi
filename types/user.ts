export interface User {
  id: string;
  status: number;
  type: number;
  name: string | null;
  rate: number;
  wallet_balance: string;
  email: string | null;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  avatar: string | null;
  avatar_thumb: string | null;
  contact_info: string | null;
  bio: string | null;
  company_name: string | null;
  position: string | null;
  country_id: string | null;
  city_id: string | null;
  created_at: number;
  updated_at: number;
  registration_date: number;
  is_online: boolean;
}

export interface ContactInfoItem {
  title: string;
  value: string;
}



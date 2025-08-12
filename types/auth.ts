export interface SignupResponse {
  success: boolean;
  message: string;
  data: { code: number };
  timestamp: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  verification_code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: number;
    type: number;
    token: string;
    name: string | null;
    rate: number;
    wallet_balance: string;
    fcm_token: string | null;
    web_fcm_token: string | null;
    reset_password_verification_code: string | null;
    email: string | null;
    pending_upsert_email: string | null;
    pending_upsert_email_verification_code: string | null;
    email_verified: boolean;
    phone: string | null;
    pending_upsert_phone: string | null;
    pending_upsert_phone_verification_code: string | null;
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
    deleted_at: string | null;
    last_login_date: string | null;
    registration_date: number;
    badge_ids: string | null;
    is_online: boolean;
  };
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: VerifyEmailResponse['data'];
  timestamp: string;
}

export interface SendVerificationSmsRequest {
  phone: string;
}

export interface SendVerificationSmsResponse {
  success: boolean;
  message: string;
  data: { code: number };
  timestamp: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp_code: string | number;
}

export interface VerifyPhoneResponse {
  success: boolean;
  message: string;
  data: VerifyEmailResponse['data'];
  timestamp: string;
}

export interface SendResetPasswordVerificationCodeRequest {
  email: string;
}

export interface SendResetPasswordVerificationCodeResponse {
  success: boolean;
  message: string;
  data: { code: number };
  timestamp: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  verification_code: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown> | null;
  timestamp: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  timestamp: string;
}



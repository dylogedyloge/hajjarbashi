export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    code: number;
  };
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
    email: string;
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
    email: string;
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
    last_login_date: number | null;
    registration_date: number;
    badge_ids: string | null;
    is_online: boolean;
  };
  timestamp: string;
}

export interface SendVerificationSmsRequest {
  phone: string;
}

export interface SendVerificationSmsResponse {
  success: boolean;
  message: string;
  data: {
    code: number;
  };
  timestamp: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp_code: string | number;
}

export interface VerifyPhoneResponse {
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

export interface SendResetPasswordVerificationCodeRequest {
  email: string;
}

export interface SendResetPasswordVerificationCodeResponse {
  success: boolean;
  message: string;
  data: {
    code: number;
  };
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
  data: any;
  timestamp: string;
}

const API_BASE_URL = 'https://api.hajjardevs.ir';

export const authService = {
  async signup(data: SignupRequest, lang: string = 'en'): Promise<SignupResponse> {
    const response = await fetch(`${API_BASE_URL}/users/sign_up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async verifyEmail(data: VerifyEmailRequest, lang: string = 'en'): Promise<VerifyEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/users/verify_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Email verification failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async login(data: LoginRequest, lang: string = 'en'): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async sendVerificationSms(data: SendVerificationSmsRequest, lang: string = 'en'): Promise<SendVerificationSmsResponse> {
    const response = await fetch(`${API_BASE_URL}/users/send_verification_sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Send SMS failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async verifyPhone(data: VerifyPhoneRequest, lang: string = 'en'): Promise<VerifyPhoneResponse> {
    const response = await fetch(`${API_BASE_URL}/users/verify_phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Phone verification failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async sendResetPasswordVerificationCode(data: SendResetPasswordVerificationCodeRequest, lang: string = 'en'): Promise<SendResetPasswordVerificationCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/users/send_reset_password_verificaton_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Send reset password verification code failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async resetPassword(data: ResetPasswordRequest, lang: string = 'en'): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/users/reset_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Reset password failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
}; 
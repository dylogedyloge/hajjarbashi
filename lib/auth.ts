import type {
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  LoginRequest,
  LoginResponse,
  SendVerificationSmsRequest,
  SendVerificationSmsResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  SendResetPasswordVerificationCodeRequest,
  SendResetPasswordVerificationCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.hajjardevs.ir';
// const API_BASE_URL = 'http://192.168.10.6:3001';

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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Signup failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Email verification failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Login failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Send SMS failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Phone verification failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Verify upserted phone number (new endpoint)
   */
  async verifyUpsertPhone(
    data: { new_phone: string; verification_code: string | number },
    token: string,
    lang: string = 'en'
  ): Promise<VerifyPhoneResponse> {
    const response = await fetch(`${API_BASE_URL}/users/verify_upsert_phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Phone verification failed: ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },
  /**
   * Verify upserted phone number (new endpoint)
   */
  async verifyUpsertEmail(
    data: { new_email: string; verification_code: string | number },
    token: string,
    lang: string = 'en'
  ): Promise<VerifyEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/users/verify_upsert_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': lang,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Email verification failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Send reset password verification code failed: ${response.status}`;
      throw new Error(errorMessage);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Reset password failed: ${response.status}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async changePassword(data: ChangePasswordRequest, token: string, lang: string = 'en'): Promise<ChangePasswordResponse> {
    console.log('changePassword called with:', { data, token: token ? 'present' : 'missing', lang });
    console.log('API URL:', `${API_BASE_URL}/users/change_password`);
    console.log('Full request URL:', `${API_BASE_URL}/users/change_password`);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    });
    console.log('Request body:', JSON.stringify(data));
    
    // Test the token format
    if (token) {
      const tokenParts = token.split('.');
      console.log('Token parts count:', tokenParts.length);
      if (tokenParts.length === 3) {
        try {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token header:', header);
          console.log('Token payload:', payload);
          console.log('Token expiration:', new Date(payload.exp * 1000));
          console.log('Token is expired:', Date.now() > payload.exp * 1000);
        } catch (e) {
          console.log('Could not decode token:', e);
        }
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/users/change_password`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'x-lang': lang,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response data:', errorData);
      const errorMessage = errorData.message || errorData.error || `Change password failed: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Success response:', result);
    return result;
  },
};

/**
 * Request to upsert (change) phone number, returns OTP code in data
 */
export async function upsertPhoneRequest({ newPhone, lang = 'en', token }: { newPhone: string; lang?: string; token: string }) {
  const response = await fetch(`${API_BASE_URL}/users/upsert_phone_request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ new_phone: newPhone }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Failed to request phone change');
  return data;
} 
export async function upsertEmailRequest({ newEmail, lang = 'en', token }: { newEmail: string; lang?: string; token: string }) {
  const response = await fetch(`${API_BASE_URL}/users/upsert_email_request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-lang': lang,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ new_email: newEmail }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Failed to request email change');
  return data;
} 
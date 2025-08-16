import { useMutation, useQuery } from "@tanstack/react-query";
import { authService, upsertPhoneRequest, upsertEmailRequest } from "@/lib/auth";
import type {
  SignupRequest,
  VerifyEmailRequest,
  LoginRequest,
  SendVerificationSmsRequest,
  VerifyPhoneRequest,
  SendResetPasswordVerificationCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/types/auth";

// Signup hook
export function useSignup() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: SignupRequest; lang?: string }) =>
      authService.signup(data, lang),
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });
}

// Email verification hook
export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: VerifyEmailRequest; lang?: string }) =>
      authService.verifyEmail(data, lang),
    onError: (error) => {
      console.error('Email verification error:', error);
    },
  });
}

// Login hook
export function useLogin() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: LoginRequest; lang?: string }) =>
      authService.login(data, lang),
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

// Logout hook
export function useLogout() {
  return useMutation({
    mutationFn: ({ token, lang = 'en' }: { token: string; lang?: string }) =>
      authService.logout(token, lang),
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
}

// Send verification SMS hook
export function useSendVerificationSms() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: SendVerificationSmsRequest; lang?: string }) =>
      authService.sendVerificationSms(data, lang),
    onError: (error) => {
      console.error('Send verification SMS error:', error);
    },
  });
}

// Verify phone hook
export function useVerifyPhone() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: VerifyPhoneRequest; lang?: string }) =>
      authService.verifyPhone(data, lang),
    onError: (error) => {
      console.error('Phone verification error:', error);
    },
  });
}

// Verify upsert phone hook (requires token)
export function useVerifyUpsertPhone() {
  return useMutation({
    mutationFn: ({ 
      data, 
      token, 
      lang = 'en' 
    }: { 
      data: { new_phone: string; verification_code: string | number }; 
      token: string; 
      lang?: string 
    }) => authService.verifyUpsertPhone(data, token, lang),
    onError: (error) => {
      console.error('Upsert phone verification error:', error);
    },
  });
}

// Verify upsert email hook (requires token)
export function useVerifyUpsertEmail() {
  return useMutation({
    mutationFn: ({ 
      data, 
      token, 
      lang = 'en' 
    }: { 
      data: { new_email: string; verification_code: string | number }; 
      token: string; 
      lang?: string 
    }) => authService.verifyUpsertEmail(data, token, lang),
    onError: (error) => {
      console.error('Upsert email verification error:', error);
    },
  });
}

// Send reset password verification code hook
export function useSendResetPasswordVerificationCode() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: SendResetPasswordVerificationCodeRequest; lang?: string }) =>
      authService.sendResetPasswordVerificationCode(data, lang),
    onError: (error) => {
      console.error('Send reset password verification code error:', error);
    },
  });
}

// Reset password hook
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ data, lang = 'en' }: { data: ResetPasswordRequest; lang?: string }) =>
      authService.resetPassword(data, lang),
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
}

// Change password hook (requires token)
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ data, token, lang = 'en' }: { data: ChangePasswordRequest; token: string; lang?: string }) =>
      authService.changePassword(data, token, lang),
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });
}

// Upsert phone request hook (requires token)
export function useUpsertPhoneRequest() {
  return useMutation({
    mutationFn: ({ newPhone, lang = 'en', token }: { newPhone: string; lang?: string; token: string }) =>
      upsertPhoneRequest({ newPhone, lang, token }),
    onError: (error) => {
      console.error('Upsert phone request error:', error);
    },
  });
}

// Upsert email request hook (requires token)
export function useUpsertEmailRequest() {
  return useMutation({
    mutationFn: ({ newEmail, lang = 'en', token }: { newEmail: string; lang?: string; token: string }) =>
      upsertEmailRequest({ newEmail, lang, token }),
    onError: (error) => {
      console.error('Upsert email request error:', error);
    },
  });
}

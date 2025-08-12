# React Query v5 Implementation for Authentication

## Overview
This document describes the implementation of React Query v5 for all authentication API calls in the application.

## Implemented Hooks

### 1. **useSignup**
```typescript
const signupMutation = useSignup();

signupMutation.mutate(
  { 
    data: { email: 'user@example.com', password: 'password123' }, 
    lang: 'en' 
  },
  {
    onSuccess: (response) => {
      console.log('Signup successful:', response);
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    }
  }
);
```

### 2. **useLogin**
```typescript
const loginMutation = useLogin();

loginMutation.mutate(
  { 
    data: { email: 'user@example.com', password: 'password123' }, 
    lang: 'en' 
  },
  {
    onSuccess: (response) => {
      // Handle successful login
      login(response.data, response.data.token);
    },
    onError: (error) => {
      toast.error('Login failed');
    }
  }
);
```

### 3. **useVerifyEmail**
```typescript
const verifyEmailMutation = useVerifyEmail();

verifyEmailMutation.mutate(
  { 
    data: { email: 'user@example.com', verification_code: '123456' }, 
    lang: 'en' 
  }
);
```

### 4. **useSendVerificationSms**
```typescript
const sendSmsMutation = useSendVerificationSms();

sendSmsMutation.mutate(
  { 
    data: { phone: '+1234567890' }, 
    lang: 'en' 
  }
);
```

### 5. **useVerifyPhone**
```typescript
const verifyPhoneMutation = useVerifyPhone();

verifyPhoneMutation.mutate(
  { 
    data: { phone: '+1234567890', otp_code: '123456' }, 
    lang: 'en' 
  }
);
```

### 6. **useChangePassword** (Requires Token)
```typescript
const changePasswordMutation = useChangePassword();

changePasswordMutation.mutate(
  {
    data: {
      current_password: 'oldPassword123',
      new_password: 'newPassword123'
    },
    token: 'user-jwt-token',
    lang: 'en'
  },
  {
    onSuccess: () => {
      toast.success('Password changed successfully');
      logout();
    }
  }
);
```

### 7. **useUpsertPhoneRequest** (Requires Token)
```typescript
const upsertPhoneMutation = useUpsertPhoneRequest();

upsertPhoneMutation.mutate(
  {
    newPhone: '+1234567890',
    token: 'user-jwt-token',
    lang: 'en'
  },
  {
    onSuccess: (response) => {
      toast.success(`OTP code: ${response.data}`);
      // Show OTP input dialog
    }
  }
);
```

### 8. **useVerifyUpsertPhone** (Requires Token)
```typescript
const verifyUpsertPhoneMutation = useVerifyUpsertPhone();

verifyUpsertPhoneMutation.mutate(
  {
    data: {
      new_phone: '+1234567890',
      verification_code: '123456'
    },
    token: 'user-jwt-token',
    lang: 'en'
  },
  {
    onSuccess: (response) => {
      login(response.data, response.data.token);
      toast.success('Phone number verified!');
    }
  }
);
```

### 9. **useUpsertEmailRequest** (Requires Token)
```typescript
const upsertEmailMutation = useUpsertEmailRequest();

upsertEmailMutation.mutate(
  {
    newEmail: 'newemail@example.com',
    token: 'user-jwt-token',
    lang: 'en'
  },
  {
    onSuccess: (response) => {
      toast.success(`OTP code: ${response.data}`);
      // Show OTP input dialog
    }
  }
);
```

### 10. **useVerifyUpsertEmail** (Requires Token)
```typescript
const verifyUpsertEmailMutation = useVerifyUpsertEmail();

verifyUpsertEmailMutation.mutate(
  {
    data: {
      new_email: 'newemail@example.com',
      verification_code: '123456'
    },
    token: 'user-jwt-token',
    lang: 'en'
  },
  {
    onSuccess: (response) => {
      login(response.data, response.data.token);
      toast.success('Email verified!');
    }
  }
);
```

### 11. **useSendResetPasswordVerificationCode**
```typescript
const sendResetCodeMutation = useSendResetPasswordVerificationCode();

sendResetCodeMutation.mutate(
  {
    data: { email: 'user@example.com' },
    lang: 'en'
  },
  {
    onSuccess: (response) => {
      toast.success(`Reset code sent: ${response.data}`);
    }
  }
);
```

### 12. **useResetPassword**
```typescript
const resetPasswordMutation = useResetPassword();

resetPasswordMutation.mutate(
  {
    data: {
      email: 'user@example.com',
      password: 'newPassword123',
      verification_code: '123456'
    },
    lang: 'en'
  },
  {
    onSuccess: () => {
      toast.success('Password reset successfully');
    }
  }
);
```

## Key Benefits

### ✅ **Automatic Loading States**
```typescript
// Access loading state
const isLoading = mutation.isPending;

// Disable buttons during loading
<Button disabled={mutation.isPending}>
  {mutation.isPending ? 'Loading...' : 'Submit'}
</Button>
```

### ✅ **Error Handling**
```typescript
// Access error state
const error = mutation.error;

// Show error messages
{mutation.error && (
  <div className="text-red-500">{mutation.error.message}</div>
)}
```

### ✅ **Success Handling**
```typescript
mutation.mutate(data, {
  onSuccess: (response) => {
    // Handle success
    toast.success('Operation successful');
  },
  onError: (error) => {
    // Handle error
    toast.error(error.message);
  }
});
```

### ✅ **Automatic Retries**
- Failed requests are automatically retried
- Configurable retry behavior
- Exponential backoff

### ✅ **Cache Management**
- Automatic caching of successful responses
- Cache invalidation on mutations
- Optimistic updates

## Migration from Direct API Calls

### Before (Direct API Call)
```typescript
const handleLogin = async () => {
  try {
    const response = await authService.login(loginData, 'en');
    login(response.data, response.data.token);
  } catch (error) {
    toast.error('Login failed');
  }
};
```

### After (React Query)
```typescript
const loginMutation = useLogin();

const handleLogin = () => {
  loginMutation.mutate(
    { data: loginData, lang: 'en' },
    {
      onSuccess: (response) => {
        login(response.data, response.data.token);
      },
      onError: (error) => {
        toast.error('Login failed');
      }
    }
  );
};
```

## Usage in Components

### Example: Settings Page
```typescript
import { useChangePassword, useUpsertPhoneRequest } from '@/hooks/useAuth';

export default function SettingsPage() {
  const changePasswordMutation = useChangePassword();
  const upsertPhoneMutation = useUpsertPhoneRequest();

  const handleChangePassword = () => {
    changePasswordMutation.mutate(
      {
        data: { current_password: 'old', new_password: 'new' },
        token: userToken,
        lang: 'en'
      },
      {
        onSuccess: () => {
          toast.success('Password changed!');
          logout();
        }
      }
    );
  };

  return (
    <Button 
      onClick={handleChangePassword}
      disabled={changePasswordMutation.isPending}
    >
      {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
    </Button>
  );
}
```

## Best Practices

1. **Always handle loading states** using `mutation.isPending`
2. **Provide user feedback** with success/error toasts
3. **Use onSuccess/onError callbacks** for side effects
4. **Disable buttons** during mutations to prevent double-submission
5. **Handle token requirements** for authenticated endpoints
6. **Use proper TypeScript types** for all data structures

## Error Handling

All hooks include automatic error logging and can be extended with custom error handling:

```typescript
const mutation = useLogin();

mutation.mutate(data, {
  onError: (error) => {
    // Custom error handling
    if (error.message.includes('Invalid credentials')) {
      toast.error('Wrong email or password');
    } else {
      toast.error('Login failed. Please try again.');
    }
  }
});
```

This implementation provides a robust, type-safe, and user-friendly way to handle all authentication operations with React Query v5.

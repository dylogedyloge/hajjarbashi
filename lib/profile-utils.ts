/**
 * Profile-related utilities
 */

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  company: string;
  location: string;
  email: string;
  phone: string;
  description: string;
}

/**
 * Default profile form data
 */
export const DEFAULT_PROFILE_FORM: ProfileFormData = {
  firstName: "John",
  lastName: "Doe",
  company: "Hajjarbashi",
  location: "China",
  email: "example@domain.com",
  phone: "+989376544675",
  description: "Lorem Ipsum is dummy text...",
};

/**
 * Gets user initials from name or email
 */
export function getUserInitials(user: { name?: string | null; email?: string | null } | null): string {
  if (!user) return "U";
  
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return "U";
}

/**
 * Constructs full avatar URLs from relative paths
 */
export function constructAvatarUrls(
  avatarPath: string,
  avatarThumbPath: string,
  baseUrl: string = 'https://api.hajjardevs.ir/'
): { avatar: string; avatar_thumb: string } {
  return {
    avatar: baseUrl + avatarPath,
    avatar_thumb: baseUrl + avatarThumbPath,
  };
}

/**
 * Updates user object with new avatar URLs
 */
export function updateUserWithAvatars(
  user: any,
  avatarPath: string,
  avatarThumbPath: string,
  baseUrl: string = 'https://api.hajjardevs.ir/'
): any {
  return {
    ...user,
    avatar: baseUrl + avatarPath,
    avatar_thumb: baseUrl + avatarThumbPath,
  };
}

/**
 * Validates profile form data
 */
export function validateProfileForm(formData: ProfileFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!formData.firstName?.trim()) {
    errors.push("First name is required");
  }
  
  if (!formData.lastName?.trim()) {
    errors.push("Last name is required");
  }
  
  if (!formData.email?.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(formData.email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (!formData.phone?.trim()) {
    errors.push("Phone number is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Basic formatting for common patterns
  if (cleaned.startsWith('+98')) {
    // Iranian phone number
    return cleaned.replace(/(\+98)(\d{2})(\d{3})(\d{4})/, '$1-$2-$3-$4');
  }
  
  return cleaned;
}

/**
 * Gets character count for description field
 */
export function getDescriptionCharCount(description: string): number {
  return description.length;
}

/**
 * Checks if description is within limit
 */
export function isDescriptionWithinLimit(description: string, limit: number = 300): boolean {
  return description.length <= limit;
} 
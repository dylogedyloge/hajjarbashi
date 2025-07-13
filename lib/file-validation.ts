/**
 * File validation utilities
 */

export interface FileValidationConfig {
  validTypes: string[];
  maxSize: number; // in bytes
  maxSizeMB?: number; // in MB for display purposes
}

export const DEFAULT_IMAGE_VALIDATION: FileValidationConfig = {
  validTypes: ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png'],
  maxSize: 10 * 1024 * 1024, // 10MB
  maxSizeMB: 10
};

/**
 * Validates a file based on the provided configuration
 */
export function validateFile(
  file: File, 
  config: FileValidationConfig = DEFAULT_IMAGE_VALIDATION,
  onError?: (message: string) => void
): boolean {
  // Check file type
  if (!config.validTypes.includes(file.type)) {
    const errorMessage = `Please select a valid file type: ${config.validTypes.join(', ')}`;
    onError?.(errorMessage);
    return false;
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeDisplay = config.maxSizeMB || Math.round(config.maxSize / (1024 * 1024));
    const errorMessage = `File size must be less than ${maxSizeDisplay}MB`;
    onError?.(errorMessage);
    return false;
  }

  return true;
}

/**
 * Validates image file specifically
 */
export function validateImageFile(
  file: File,
  onError?: (message: string) => void
): boolean {
  return validateFile(file, DEFAULT_IMAGE_VALIDATION, onError);
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Checks if file is an image based on its type
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 
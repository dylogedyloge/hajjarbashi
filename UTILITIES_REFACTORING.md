# Profile Component Refactoring - Utilities Separation

This document outlines the refactoring of the Profile component to separate concerns and improve maintainability.

## Overview

The original Profile component contained multiple responsibilities:
- Image cropping and upload
- File validation
- Drag and drop functionality
- Form handling
- URL validation

These have been separated into focused utility files and a custom hook.

## New File Structure

### 1. `lib/image-utils.ts`
**Purpose**: Image manipulation and URL validation utilities

**Exports**:
- `centerAspectCrop()` - Centers crop area with specific aspect ratio
- `isValidUrl()` - Validates URL format
- `cropImage()` - Crops image using canvas and returns File
- `createObjectURL()` - Creates object URL for file
- `revokeObjectURL()` - Revokes object URL to free memory

**Usage**:
```typescript
import { isValidUrl, cropImage } from '@/lib/image-utils';

// Validate URL
const isValid = isValidUrl(user.avatar);

// Crop image
const croppedFile = await cropImage(imgElement, cropData, 'avatar.jpg');
```

### 2. `lib/file-validation.ts`
**Purpose**: File validation utilities with configurable rules

**Exports**:
- `validateFile()` - Validates file based on configuration
- `validateImageFile()` - Validates image files specifically
- `getFileExtension()` - Gets file extension
- `isImageFile()` - Checks if file is an image
- `formatFileSize()` - Formats file size for display
- `DEFAULT_IMAGE_VALIDATION` - Default validation config

**Usage**:
```typescript
import { validateImageFile, DEFAULT_IMAGE_VALIDATION } from '@/lib/file-validation';

// Validate image file
const isValid = validateImageFile(file, (error) => toast.error(error));

// Custom validation
const isValid = validateFile(file, {
  validTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxSizeMB: 5
});
```

### 3. `lib/drag-drop-utils.ts`
**Purpose**: Drag and drop functionality utilities

**Exports**:
- `useDragAndDrop()` - Hook for drag and drop functionality
- `createDragHandlers()` - Creates drag event handlers
- `isFileDrag()` - Checks if dragged item is a file
- `getFileFromDragEvent()` - Gets file from drag event

**Usage**:
```typescript
import { useDragAndDrop } from '@/lib/drag-drop-utils';

const { handleDrag, handleDrop } = useDragAndDrop(
  (file) => handleFileSelect(file),
  (isDragActive) => setDragActive(isDragActive)
);
```

### 4. `lib/profile-utils.ts`
**Purpose**: Profile-specific utilities and form helpers

**Exports**:
- `getUserInitials()` - Gets user initials from name/email
- `constructAvatarUrls()` - Constructs full avatar URLs
- `updateUserWithAvatars()` - Updates user with new avatar URLs
- `validateProfileForm()` - Validates profile form data
- `isValidEmail()` - Validates email format
- `formatPhoneNumber()` - Formats phone number
- `DEFAULT_PROFILE_FORM` - Default form data

**Usage**:
```typescript
import { getUserInitials, validateProfileForm } from '@/lib/profile-utils';

// Get user initials
const initials = getUserInitials(user);

// Validate form
const { isValid, errors } = validateProfileForm(formData);
```

### 5. `hooks/useProfileImageUpload.ts`
**Purpose**: Custom hook encapsulating all image upload logic

**Features**:
- File validation
- Image cropping
- Drag and drop
- Upload to API
- Error handling
- Loading states
- Memory cleanup

**Usage**:
```typescript
import { useProfileImageUpload } from '@/hooks/useProfileImageUpload';

const {
  isUploading,
  dragActive,
  showCrop,
  handleFileInputChange,
  handleDrag,
  handleDrop,
  handleCropAndUpload,
  cleanup
} = useProfileImageUpload({
  onSuccess: (updatedUser) => {
    toast.success('Avatar updated!');
  },
  onError: (error) => {
    toast.error(error);
  }
});
```

## Benefits of This Refactoring

### 1. **Separation of Concerns**
- Each file has a single responsibility
- Easier to test individual functions
- Clearer code organization

### 2. **Reusability**
- Utilities can be used across different components
- Consistent behavior across the application
- Reduced code duplication

### 3. **Maintainability**
- Easier to modify specific functionality
- Better error handling
- Centralized configuration

### 4. **Type Safety**
- Proper TypeScript interfaces
- Better IntelliSense support
- Reduced runtime errors

### 5. **Testing**
- Individual functions can be unit tested
- Mock dependencies easily
- Better test coverage

## Migration Guide

### Before (Original Component)
```typescript
// All logic mixed in component
const validateFile = (file: File) => { /* ... */ };
const uploadImage = async (file: File) => { /* ... */ };
const handleDrag = (e: React.DragEvent) => { /* ... */ };
// ... many more functions
```

### After (Refactored Component)
```typescript
// Clean component using utilities
import { useProfileImageUpload } from '@/hooks/useProfileImageUpload';
import { isValidUrl, getUserInitials } from '@/lib/image-utils';

const Profile = () => {
  const uploadHook = useProfileImageUpload({ /* options */ });
  // Component focuses on UI rendering
};
```

## Best Practices

### 1. **Import Only What You Need**
```typescript
// Good
import { validateImageFile } from '@/lib/file-validation';

// Avoid
import * as FileValidation from '@/lib/file-validation';
```

### 2. **Use Custom Hooks for Complex Logic**
```typescript
// Good - Encapsulates complex state management
const uploadHook = useProfileImageUpload(options);

// Avoid - Mixing state management in component
const [isUploading, setIsUploading] = useState(false);
// ... lots of state management code
```

### 3. **Handle Errors Gracefully**
```typescript
// Good - Centralized error handling
const uploadHook = useProfileImageUpload({
  onError: (error) => toast.error(error)
});

// Avoid - Scattered error handling
try {
  // upload logic
} catch (error) {
  // error handling scattered throughout
}
```

### 4. **Clean Up Resources**
```typescript
// Good - Automatic cleanup
useEffect(() => {
  return () => cleanup();
}, [cleanup]);

// Avoid - Memory leaks
// No cleanup of object URLs or event listeners
```

## Future Enhancements

1. **Add Unit Tests** for each utility function
2. **Create More Specialized Hooks** for other common patterns
3. **Add Configuration Options** for different validation rules
4. **Implement Caching** for frequently used data
5. **Add Performance Monitoring** for upload operations

## Conclusion

This refactoring significantly improves the codebase by:
- Making the Profile component focused on UI rendering
- Creating reusable utilities for common operations
- Improving maintainability and testability
- Providing better error handling and user experience
- Following React best practices for state management

The separated utilities can now be used across the application, ensuring consistent behavior and reducing code duplication. 
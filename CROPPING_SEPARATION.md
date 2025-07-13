# Image Cropping Functionality Separation

This document outlines the separation of image cropping functionality into reusable components and hooks.

## Overview

The cropping functionality has been separated into:
1. **`ImageCropper` Component** - Reusable UI component for image cropping
2. **`useImageCropper` Hook** - Custom hook for cropping state management
3. **Updated `useProfileImageUpload` Hook** - Now uses the separated cropping functionality

## New File Structure

### 1. `components/ui/image-cropper.tsx`
**Purpose**: Reusable image cropping component with full UI

**Features**:
- Modal-based cropping interface
- Configurable aspect ratio, min/max dimensions
- Live preview of cropped image
- Customizable text and instructions
- Professional responsive design
- Memory management and cleanup

**Props**:
```typescript
interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (file: File) => Promise<void>;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  title?: string;
  instructions?: {
    title: string;
    dragCorners: string;
    dragInside: string;
    squareArea: string;
  };
  actions?: {
    cropAndUpload: string;
    uploading: string;
    cancel: string;
  };
  preview?: {
    title: string;
  };
  cropSource?: string;
  className?: string;
}
```

**Usage**:
```typescript
import { ImageCropper } from '@/components/ui/image-cropper';

<ImageCropper
  isOpen={isCropping}
  onClose={handleClose}
  onCropComplete={handleCropComplete}
  aspectRatio={1}
  title="Crop Avatar"
  instructions={{
    title: "Instructions",
    dragCorners: "Drag corners to resize",
    dragInside: "Click and drag to move",
    squareArea: "Keep it square for best results"
  }}
/>
```

### 2. `hooks/useImageCropper.ts`
**Purpose**: Custom hook for managing cropping state and functionality

**Features**:
- File validation and selection
- Crop state management
- Preview generation
- Memory cleanup
- Error handling
- Configurable crop settings

**Options**:
```typescript
interface UseImageCropperOptions {
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onError?: (error: string) => void;
  onSuccess?: (file: File) => void;
}
```

**Returns**:
```typescript
{
  // State
  selectedImage: File | null;
  imageUrl: string | null;
  crop: Crop | undefined;
  completedCrop: Crop | undefined;
  isCropping: boolean;
  
  // Refs
  imgRef: RefObject<HTMLImageElement>;
  
  // Handlers
  handleFileSelect: (file: File) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleCropComplete: (onCropComplete?: (file: File) => Promise<void>) => Promise<void>;
  cleanup: () => void;
  
  // Setters
  setCrop: (crop: Crop) => void;
  setCompletedCrop: (crop: Crop) => void;
  setIsCropping: (isCropping: boolean) => void;
  
  // Configuration
  aspectRatio: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}
```

**Usage**:
```typescript
import { useImageCropper } from '@/hooks/useImageCropper';

const {
  selectedImage,
  imageUrl,
  crop,
  completedCrop,
  isCropping,
  imgRef,
  handleFileSelect,
  onImageLoad,
  handleCropComplete,
  cleanup
} = useImageCropper({
  aspectRatio: 1,
  onError: (error) => toast.error(error),
  onSuccess: (file) => console.log('Cropped file:', file)
});
```

### 3. Updated `hooks/useProfileImageUpload.ts`
**Purpose**: Profile image upload hook now uses separated cropping functionality

**Changes**:
- Removed inline cropping logic
- Uses `useImageCropper` hook internally
- Cleaner separation of concerns
- Better error handling
- Simplified interface

**Usage** (unchanged):
```typescript
import { useProfileImageUpload } from '@/hooks/useProfileImageUpload';

const {
  isUploading,
  dragActive,
  isCropping,
  handleFileInputChange,
  handleUploadClick,
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

## Benefits of This Separation

### 1. **Reusability**
- `ImageCropper` can be used in any component
- `useImageCropper` can be used for different cropping scenarios
- Consistent cropping experience across the app

### 2. **Maintainability**
- Cropping logic is centralized
- Easier to update cropping functionality
- Better error handling and debugging

### 3. **Flexibility**
- Configurable aspect ratios
- Customizable UI text
- Different crop constraints for different use cases

### 4. **Performance**
- Proper memory management
- Automatic cleanup of object URLs
- Optimized re-renders

### 5. **Type Safety**
- Full TypeScript support
- Proper interfaces for all props
- Better IntelliSense support

## Migration Guide

### Before (Inline Cropping)
```typescript
// All cropping logic mixed in component
const [crop, setCrop] = useState<Crop>();
const [completedCrop, setCompletedCrop] = useState<Crop>();
const [showCrop, setShowCrop] = useState(false);
// ... lots of cropping logic
```

### After (Separated Cropping)
```typescript
// Clean component using separated functionality
import { ImageCropper } from '@/components/ui/image-cropper';
import { useProfileImageUpload } from '@/hooks/useProfileImageUpload';

const Profile = () => {
  const { isCropping, handleCropAndUpload, cleanup } = useProfileImageUpload();
  
  return (
    <>
      <ImageCropper
        isOpen={isCropping}
        onClose={cleanup}
        onCropComplete={handleCropAndUpload}
        // ... props
      />
      {/* Rest of component */}
    </>
  );
};
```

## Advanced Usage Examples

### 1. **Different Aspect Ratios**
```typescript
// Square avatar
<ImageCropper aspectRatio={1} />

// Landscape banner
<ImageCropper aspectRatio={16/9} />

// Portrait photo
<ImageCropper aspectRatio={3/4} />
```

### 2. **Custom Instructions**
```typescript
<ImageCropper
  instructions={{
    title: "Crop Instructions",
    dragCorners: "Resize the crop area by dragging corners",
    dragInside: "Move the crop area by dragging inside",
    squareArea: "Maintain the aspect ratio for best results"
  }}
/>
```

### 3. **Different Crop Constraints**
```typescript
// Small avatar with minimum size
<ImageCropper
  aspectRatio={1}
  minWidth={100}
  minHeight={100}
  maxWidth={500}
  maxHeight={500}
/>

// Large banner with no maximum
<ImageCropper
  aspectRatio={16/9}
  minWidth={800}
  minHeight={450}
/>
```

### 4. **Custom Styling**
```typescript
<ImageCropper
  className="custom-cropper-styles"
  title="Custom Crop Title"
  cropSource="Custom alt text"
/>
```

## Best Practices

### 1. **Always Clean Up**
```typescript
useEffect(() => {
  return () => cleanup();
}, [cleanup]);
```

### 2. **Handle Errors Gracefully**
```typescript
const cropper = useImageCropper({
  onError: (error) => {
    toast.error(error);
    console.error('Cropping error:', error);
  }
});
```

### 3. **Use Appropriate Aspect Ratios**
```typescript
// For avatars
aspectRatio={1}

// For banners
aspectRatio={16/9}

// For social media posts
aspectRatio={1.91/1}
```

### 4. **Set Reasonable Constraints**
```typescript
// Prevent too small crops
minWidth={64}
minHeight={64}

// Prevent too large crops
maxWidth={2048}
maxHeight={2048}
```

## Future Enhancements

1. **Multiple Crop Areas** - Support for multiple crop selections
2. **Crop History** - Undo/redo functionality
3. **Crop Templates** - Predefined crop areas
4. **Touch Support** - Better mobile cropping experience
5. **Crop Filters** - Basic image filters during cropping
6. **Crop Rotation** - Rotate image before cropping
7. **Crop Zoom** - Zoom functionality for precise cropping

## Conclusion

The separation of cropping functionality provides:
- **Better code organization** with clear separation of concerns
- **Reusable components** that can be used across the application
- **Improved maintainability** with centralized cropping logic
- **Enhanced flexibility** with configurable options
- **Better performance** with proper memory management
- **Type safety** with comprehensive TypeScript support

This separation makes the codebase more modular and allows for easy extension of cropping functionality in the future. 
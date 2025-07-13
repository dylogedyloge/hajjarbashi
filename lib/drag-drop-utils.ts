import { useCallback } from 'react';

/**
 * Hook for handling drag and drop functionality
 */
export function useDragAndDrop(
  onFileSelect: (file: File) => void,
  onDragStateChange?: (isDragActive: boolean) => void
) {
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isDragActive = e.type === "dragenter" || e.type === "dragover";
    onDragStateChange?.(isDragActive);
  }, [onDragStateChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange?.(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, onDragStateChange]);

  return {
    handleDrag,
    handleDrop
  };
}

/**
 * Creates drag event handlers for a specific element
 */
export function createDragHandlers(
  onFileSelect: (file: File) => void,
  onDragStateChange?: (isDragActive: boolean) => void
) {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isDragActive = e.type === "dragenter" || e.type === "dragover";
    onDragStateChange?.(isDragActive);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange?.(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return {
    onDragEnter: handleDrag,
    onDragLeave: handleDrag,
    onDragOver: handleDrag,
    onDrop: handleDrop
  };
}

/**
 * Checks if the dragged item is a file
 */
export function isFileDrag(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes('Files');
}

/**
 * Gets the first file from drag event
 */
export function getFileFromDragEvent(e: React.DragEvent): File | null {
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    return e.dataTransfer.files[0];
  }
  return null;
} 
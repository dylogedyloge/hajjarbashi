/**
 * Formats a timestamp into a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  // Convert to seconds
  const diffInSeconds = Math.floor(diffInMs / 1000);
  
  if (diffInSeconds < 60) {
    return diffInSeconds === 1 ? "1 second ago" : `${diffInSeconds} seconds ago`;
  }
  
  // Convert to minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
  }
  
  // Convert to hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }
  
  // Convert to days
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }
  
  // If more than a week, return exact date
  return date.toLocaleDateString();
} 
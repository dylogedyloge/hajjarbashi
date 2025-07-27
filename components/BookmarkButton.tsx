"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { createBookmark, deleteBookmark } from "@/lib/advertisements";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "next-intl";
import { toast } from "sonner";

interface BookmarkButtonProps {
  adId: string;
  isBookmarked: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({ adId, isBookmarked: initialBookmarked, onBookmarkChange }: BookmarkButtonProps) {
  const { token, isAuthenticated } = useAuth();
  const locale = useLocale();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || !token) {
      // Handle unauthenticated user - could show login prompt
      toast.error("Please sign in to bookmark ads");
      return;
    }

    if (isBookmarking) return; // Prevent multiple simultaneous requests

    setIsBookmarking(true);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        await deleteBookmark({
          adId: adId,
          locale,
          token: token,
        });
        setIsBookmarked(false);
        onBookmarkChange?.(false);
        toast.success("Removed from bookmarks");
      } else {
        // Add bookmark
        await createBookmark({
          adId: adId,
          locale,
          token: token,
        });
        setIsBookmarked(true);
        onBookmarkChange?.(true);
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      // Revert the UI state on error
      setIsBookmarked(!isBookmarked);
      toast.error("Failed to update bookmark");
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Button
      onClick={handleBookmarkToggle}
      className="h-8 w-8 p-0 transition-colors shadow-sm"
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      disabled={isBookmarking}
    >
      <Bookmark className="w-4 h-4" />
    </Button>
  );
} 
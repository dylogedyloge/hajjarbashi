"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { fetchBookmarkedAds } from "@/lib/advertisements";
import AdCard from "@/components/ad-card";
import { Ad } from "@/components/ads-list";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const t = useTranslations("Bookmarks");
  const locale = useLocale();
  const { user, token, isAuthenticated } = useAuth();
  const [bookmarkedAds, setBookmarkedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    const loadBookmarkedAds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchBookmarkedAds({
          limit: 10,
          page: currentPage,
          locale,
          token,
        });
        
        const newAds = response.data || [];
        if (currentPage === 1) {
          setBookmarkedAds(newAds);
        } else {
          setBookmarkedAds(prev => [...prev, ...newAds]);
        }
        
        setHasMore(newAds.length === 10); // If we got less than 10, we've reached the end
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookmarked ads");
      } finally {
        setLoading(false);
      }
    };

    loadBookmarkedAds();
  }, [isAuthenticated, token, locale, currentPage]);

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleAdUpdate = (adId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      // Remove the ad from the list if it was unbookmarked
      setBookmarkedAds(prev => prev.filter(ad => ad.id !== adId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">{t("signInRequired")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("signInRequiredDescription")}
          </p>
          <Button asChild>
            <Link href="/">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading && bookmarkedAds.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("loadingBookmarks")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-destructive mb-4">
            <p className="font-semibold">{t("error")}</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          {bookmarkedAds.length > 0 
            ? `You have ${bookmarkedAds.length} bookmarked ad${bookmarkedAds.length === 1 ? '' : 's'}`
            : "No bookmarked ads yet"
          }
        </p>
      </div>

      {bookmarkedAds.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("noBookmarks")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("noBookmarksDescription")}
          </p>
          <Button asChild>
            <Link href="/">{t("browseAds")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarkedAds.map((ad) => (
            <div key={ad.id}>
              <AdCard 
                ad={ad} 
                isFromBookmarksPage={true}
                onBookmarkChange={(isBookmarked) => handleAdUpdate(ad.id, isBookmarked)}
              />
            </div>
          ))}
          
          {hasMore && (
            <div className="text-center pt-6">
              <Button 
                onClick={loadMore} 
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ShareButton() {
  const [isSharing, setIsSharing] = useState(false);
  const t = useTranslations("AdDetailPage");

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Copy current URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied"));
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error(t("copyFailed"));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="bg-white border h-9 w-9 p-0"
      onClick={handleShare}
      disabled={isSharing}
      title={t("share")}
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
}

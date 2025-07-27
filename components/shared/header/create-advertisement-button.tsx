import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { initAdvertisement } from "@/lib/advertisements";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface CreateAdvertisementButtonProps {
  floating?: boolean;
}

const CreateAdvertisementButton = ({
  floating = false,
}: CreateAdvertisementButtonProps) => {
  const t = useTranslations("Header");
  const router = useRouter();
  const pathname = usePathname();
  // Extract locale from pathname (e.g., /en/..., /fa/...)
  const locale = pathname.split("/")[1] || "en";
  const { token, isAuthenticated } = useAuth();
  const handleClick = async () => {
    if (!isAuthenticated || !token) {
      router.push(`/${locale}/create-ad`);
      return;
    }
    try {
      const res = await initAdvertisement(locale, token);
      console.log("API Response:", res); // Debug log to see the actual response
      if (res?.success && res?.data?.id) {
        // console.log("Advertisement ID:", res.data.id);
        router.push(`/${locale}/create-ad?id=${res.data.id}`);
      } else {
        // Show error toast with the actual error message from the response
        console.log("Error response:", res); // Debug log to see error response
        const errorMessage = res?.message || "Failed to initialize advertisement";
        console.log("Error message to show:", errorMessage); // Debug log
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Failed to initialize advertisement:", error);
      // Show error toast with the actual error message and action button
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize advertisement";
      toast.error(errorMessage, {
        action: {
          label: t("completeProfile") || "Complete Profile",
          onClick: () => router.push(`/${locale}/profile/settings`),
        },
      });
    }
  };
  if (floating) {
    return (
      <Button
        className="bg-primary text-primary-foreground rounded-full size-15 flex items-center justify-center shadow-lg border-4 border-background hover:bg-primary p-0"
        tabIndex={0}
        style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
        aria-label={t("createAd")}
        onClick={handleClick}
      >
        <Plus className="size-6" />
      </Button>
    );
  }
  return (
    <Button
      variant="default"
      size="lg"
      className="rounded-full px-8 flex items-center gap-2"
      aria-label={t("createAd")}
      onClick={handleClick}
    >
      <Plus size={18} /> {t("createAd")}
    </Button>
  );
};

export default CreateAdvertisementButton;

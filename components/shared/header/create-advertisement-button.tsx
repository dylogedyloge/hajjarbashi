import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface CreateAdvertisementButtonProps {
  floating?: boolean;
}

const CreateAdvertisementButton = ({
  floating = false,
}: CreateAdvertisementButtonProps) => {
  const t = useTranslations("Header");
  if (floating) {
    return (
      <Button
        className="bg-primary text-primary-foreground rounded-full size-15 flex items-center justify-center shadow-lg border-4 border-background hover:bg-primary p-0"
        tabIndex={0}
        style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
        aria-label={t("createAd")}
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
    >
      <Plus size={18} /> {t("createAd")}
    </Button>
  );
};

export default CreateAdvertisementButton;

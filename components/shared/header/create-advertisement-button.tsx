import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateAdvertisementButtonProps {
  floating?: boolean;
}

const CreateAdvertisementButton = ({
  floating = false,
}: CreateAdvertisementButtonProps) => {
  if (floating) {
    return (
      <Button
        className="bg-primary text-primary-foreground rounded-full size-15 flex items-center justify-center shadow-lg border-4 border-background hover:bg-primary p-0"
        tabIndex={0}
        style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)" }}
        aria-label="Create Advertisement"
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
    >
      <Plus size={18} /> Create Advertisement
    </Button>
  );
};

export default CreateAdvertisementButton;

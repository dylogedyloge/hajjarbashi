import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CreateAdvertisementButton = () => {
  return (
    <Button
      variant="default"
      size="lg"
      className="rounded-full px-8 font-semibold flex items-center gap-2"
    >
      <Plus size={18} /> Create Advertisement
    </Button>
  );
};

export default CreateAdvertisementButton;

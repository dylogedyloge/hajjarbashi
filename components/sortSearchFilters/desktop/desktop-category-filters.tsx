import React from "react";
import { X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";

const DesktopCategoryFilters = () => {
  const t = useTranslations("DesktopCategoryFilters");
  const categories = t.raw("categories") as Array<{
    name: string;
    description: string;
    colors: string[];
    images: number[];
  }>;

  return (
    <aside className="w-[350px] bg-background rounded-xl p-4 flex flex-col gap-4 border border-border max-h-[95vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <LayoutGrid className="text-muted-foreground" size={22} />
        <span className="font-medium text-foreground flex-1">
          {t("header")}
        </span>
        <Button variant="ghost" size="icon" className="ml-auto rounded-full">
          <X size={20} />
        </Button>
      </div>
      {/* Accordion: Category List */}
      <Accordion
        type="single"
        collapsible
        className="flex flex-col gap-1"
        defaultValue={categories[0].name}
      >
        {categories.map((cat) => (
          <AccordionItem value={cat.name} key={cat.name}>
            <AccordionTrigger
              className={cn(
                // Use data-state=open to style the expanded item
                "text-foreground text-base font-normal px-2 py-2 rounded-md flex items-center justify-between transition-all",
                "[&[data-state=open]]:bg-card [&[data-state=open]]:rounded-lg [&[data-state=open]]:p-3 [&[data-state=open]]:shadow-sm [&[data-state=open]]:border [&[data-state=open]]:border-border [&[data-state=open]]:mb-2 [&[data-state=open]]:font-semibold"
              )}
            >
              {cat.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <div className="mb-2">
                  <span className="font-semibold text-sm">
                    {t("descriptionLabel")}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cat.description}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-sm">
                    {t("colorsLabel")}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {cat.colors.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-muted"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {cat.images.map((img, i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-lg flex items-center justify-center h-24 text-xs text-muted-foreground border border-muted"
                    >
                      {t("imageLabel")}
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
};

// Helper to merge class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default DesktopCategoryFilters;

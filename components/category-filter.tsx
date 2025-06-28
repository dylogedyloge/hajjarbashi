import React from "react";
import { X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const categories = [
  {
    name: "Marble",
    description:
      "Lorem Ipsum is dummy text Lorem Ipsum is dummy text Lorem Ipsum is dummy text",
    colors: ["#F87171", "#FB923C", "#FBBF24", "#F87171"],
    images: [1, 2, 3, 4],
  },
  {
    name: "Granite",
    description:
      "Granite is a hard, granular, crystalline igneous rock used in construction.",
    colors: ["#A3A3A3", "#71717A", "#F59E42", "#F87171"],
    images: [1, 2, 3, 4],
  },
  {
    name: "Quartz",
    description:
      "Quartz is a hard, crystalline mineral composed of silicon and oxygen atoms.",
    colors: ["#FBBF24", "#A3A3A3", "#FB923C", "#F87171"],
    images: [1, 2, 3, 4],
  },
  {
    name: "Slate",
    description:
      "Slate is a fine-grained, foliated, homogeneous metamorphic rock.",
    colors: ["#64748B", "#334155", "#A3A3A3", "#F87171"],
    images: [1, 2, 3, 4],
  },
];

const CategoryDetails = ({
  category,
}: {
  category: (typeof categories)[0];
}) => (
  <div className="mb-2">
    <div className="mb-2">
      <span className="font-semibold text-sm">Description:</span>
      <div className="text-xs text-muted-foreground mt-1">
        {category.description}
      </div>
    </div>
    <div className="mb-2">
      <span className="font-semibold text-sm">Colors:</span>
      <div className="flex items-center gap-2 mt-1">
        {category.colors.map((color, i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full border border-muted"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-2">
      {category.images.map((img, i) => (
        <div
          key={i}
          className="bg-muted rounded-lg flex items-center justify-center h-24 text-xs text-muted-foreground border border-muted"
        >
          Image
        </div>
      ))}
    </div>
  </div>
);

// Helper to merge class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const CategoryFilter = () => {
  return (
    <aside className="w-[350px] bg-background rounded-xl p-4 flex flex-col gap-4 border border-border max-h-[95vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <LayoutGrid className="text-muted-foreground" size={22} />
        <span className="font-medium text-foreground flex-1">
          Store Categories
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
              <CategoryDetails category={cat} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
};

export default CategoryFilter;

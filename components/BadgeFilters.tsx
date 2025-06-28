import { Button } from "@/components/ui/button";

const badgeCategories = ["Marble", "Granite", "Quartz", "Limestone", "Slate"];

const BadgeFilters = () => {
  return (
    <div className="flex gap-2 w-full overflow-x-auto py-2">
      {badgeCategories.map((cat, i) => (
        <Button
          key={cat}
          variant={i === 0 ? "default" : "outline"}
          size="sm"
          className={
            i === 0
              ? "rounded-full px-4 font-medium bg-foreground text-background border-foreground"
              : "rounded-full px-4 font-medium"
          }
        >
          {cat}
        </Button>
      ))}
    </div>
  );
};

export default BadgeFilters;

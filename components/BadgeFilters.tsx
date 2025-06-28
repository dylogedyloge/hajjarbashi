"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const BadgeFilters = () => {
  const t = useTranslations("BadgeFilters");
  const badgeCategories = t.raw("categories") as string[];
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex gap-2 w-full overflow-x-auto py-2">
      {badgeCategories.map((cat: string, i: number) => (
        <Button
          key={cat}
          variant={i === selected ? "default" : "outline"}
          size="sm"
          className={
            i === selected
              ? "rounded-full px-4 font-medium bg-foreground text-background border-foreground"
              : "rounded-full px-4 font-medium"
          }
          onClick={() => setSelected(i)}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
};

export default BadgeFilters;

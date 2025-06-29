import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

const MobileDrawerFilters = () => {
  const t = useTranslations("MobileDrawerFilters");
  const filterSections = [
    {
      title: t("form.title"),
      options: t.raw("form.options") as string[],
    },
    {
      title: t("color.title"),
      options: t.raw("color.options") as string[],
    },
    {
      title: t("origin.title"),
      options: t.raw("origin.options") as string[],
    },
  ];

  return (
    <form className="px-6 pb-4">
      {filterSections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="text-sm font-semibold text-muted-foreground mb-2 mt-4 first:mt-0">
            {section.title}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {section.options.map((label: string, idx: number) => (
              <label
                key={idx}
                className="flex items-center gap-2 text-[15px] font-medium text-muted-foreground"
              >
                <Checkbox />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
};

export default MobileDrawerFilters;

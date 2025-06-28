import { Checkbox } from "@/components/ui/checkbox";

const filterSections = [
  {
    title: "Form",
    options: [
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
  {
    title: "Color",
    options: [
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
  {
    title: "Origin",
    options: [
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
      "Lorem Ipsum",
    ],
  },
];

const MobileDrawerFilters = () => {
  return (
    <form className="px-6 pb-4">
      {filterSections.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="text-sm font-semibold text-muted-foreground mb-2 mt-4 first:mt-0">
            {section.title}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {section.options.map((label, idx) => (
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

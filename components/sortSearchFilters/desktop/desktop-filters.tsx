import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

const filterFields = [
  { label: "form", options: ["option1", "option2"] },
  { label: "color", options: ["option1", "option2"] },
  { label: "origin", options: ["option1", "option2"] },
  { label: "surface", options: ["option1", "option2"] },
  { label: , options: ["option1", "option2"] },
  { label: "price", options: ["option1", "option2"] },
  { label: "deliveryDestination", options: ["option1", "option2"] },
  { label: "shipmentFrom", options: ["option1", "option2"] },
  { label: "grade", options: ["option1", "option2"] },
];

const DesktopFilters = () => {
  const t = useTranslations("DesktopFilters");
  return (
    <div className="w-full flex flex-row gap-4 justify-center items-center py-4 overflow-x-auto scrollbar-none">
      {filterFields.map((field) => (
        <Select key={field.label}>
          <SelectTrigger className="rounded-full  px-6 py-2 h-11 min-w-[120px] focus:ring-0 focus:border-primary text-base font-normal">
            <SelectValue placeholder={t(field.label)} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {t(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};

export default DesktopFilters;

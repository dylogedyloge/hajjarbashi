import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const filterFields = [
  { label: "Form", options: ["Option 1", "Option 2"] },
  { label: "Color", options: ["Option 1", "Option 2"] },
  { label: "Origin", options: ["Option 1", "Option 2"] },
  { label: "Surface", options: ["Option 1", "Option 2"] },
  { label: "Size", options: ["Option 1", "Option 2"] },
  { label: "Price", options: ["Option 1", "Option 2"] },
  { label: "Delivery Destination", options: ["Option 1", "Option 2"] },
  { label: "Shipment From", options: ["Option 1", "Option 2"] },
  { label: "Grade", options: ["Option 1", "Option 2"] },
];

const Filters = () => {
  return (
    <div className="w-full flex flex-row gap-4 justify-center items-center py-4 overflow-x-auto scrollbar-none">
      {filterFields.map((field) => (
        <Select key={field.label}>
          <SelectTrigger className="rounded-full  px-6 py-2 h-11 min-w-[120px] focus:ring-0 focus:border-primary text-base font-normal">
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};

export default Filters;

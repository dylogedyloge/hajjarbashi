"use client";
import React, { useRef, useLayoutEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { ChevronDownIcon } from "lucide-react";

export type DropdownMultiSelectOption = { label: string; value: string };

interface DropdownMultiSelectProps {
  options: DropdownMultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DropdownMultiSelect: React.FC<DropdownMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (triggerRef.current) {
      setContentWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const handleToggle = (optionValue: string) => {
    const safeValue = value || [];
    if (safeValue.includes(optionValue)) {
      onChange(safeValue.filter((v) => v !== optionValue));
    } else {
      onChange([...safeValue, optionValue]);
    }
  };

  const selectedLabels = options
    .filter((opt) => (value || []).includes(opt.value))
    .map((opt) => opt.label)
    .join(", ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate text-left">
            {selectedLabels || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          <ChevronDownIcon className="size-4 opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={contentWidth ? { width: contentWidth } : {}} className="max-h-60 overflow-y-auto p-2">
        {options.length === 0 ? (
          <div className="text-muted-foreground text-sm">No options</div>
        ) : (
          options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer">
              <Checkbox
                checked={(value || []).includes(opt.value)}
                onCheckedChange={() => handleToggle(opt.value)}
                disabled={disabled}
              />
              <span>{opt.label}</span>
            </label>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DropdownMultiSelect; 
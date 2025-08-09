"use client";
import React from "react";

import type { Option } from "@/types/ui";

interface MultipleSelectorProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MultipleSelector: React.FC<MultipleSelectorProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}) => {
  const handleToggle = (optionValue: string) => {
    const safeValue = value || [];
    if (safeValue.includes(optionValue)) {
      onChange(safeValue.filter((v) => v !== optionValue));
    } else {
      onChange([...safeValue, optionValue]);
    }
  };

  return (
    <div className={`border rounded p-2 bg-background ${disabled ? "opacity-50 pointer-events-none" : ""}`}> 
      <div className="flex flex-wrap gap-2 mb-2">
        {value.length === 0 && (
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        )}
        {(value || []).map((val) => {
          const opt = options.find((o) => o.value === val);
          return (
            <span key={val} className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs">
              {opt?.label || val}
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`border rounded px-2 py-1 text-xs ${(value || []).includes(opt.value) ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
            onClick={() => handleToggle(opt.value)}
            disabled={disabled}
          >
            {opt.label}
            {(value || []).includes(opt.value) && <span className="ml-1">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultipleSelector; 
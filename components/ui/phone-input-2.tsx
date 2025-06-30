import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const COUNTRIES = [
  { code: "+98", value: "IR", label: "Iran" },
  { code: "+971", value: "AE", label: "UAE" },
  { code: "+1", value: "US", label: "USA" },
  { code: "+44", value: "GB", label: "UK" },
  { code: "+49", value: "DE", label: "Germany" },
  { code: "+33", value: "FR", label: "France" },
  { code: "+90", value: "TR", label: "Turkey" },
  { code: "+7", value: "RU", label: "Russia" },
  { code: "+91", value: "IN", label: "India" },
  { code: "+86", value: "CN", label: "China" },
  { code: "+60", value: "MY", label: "Malaysia" },
]

type PhoneInput2Props = {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export const PhoneInput2 = React.forwardRef<HTMLInputElement, PhoneInput2Props>(
  ({ value, onChange, className, placeholder }, ref) => {
    // If value is empty, use default
    const defaultCode = "+98";
    const match = value
      ? value.match(/^(\+\d{1,4})(.*)$/)
      : [null, defaultCode, ""];
    const currentCode = match?.[1] || defaultCode;
    const number = match?.[2]?.replace(/^\s+/, "") || "";

    // Keep countryCode in sync with value
    const [countryCode, setCountryCode] = React.useState(currentCode);
    React.useEffect(() => {
      if (currentCode !== countryCode) setCountryCode(currentCode);
    }, [currentCode]);

    // When number changes
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = e.target.value.replace(/\D/g, "");
      onChange(countryCode + num);
    };

    // When country changes
    const handleCountryChange = (code: string) => {
      setCountryCode(code);
      onChange(code + number);
    };

    return (
      <div className={cn("flex w-full gap-2", className)}>
        <Select value={countryCode} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-24 min-w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.value} value={c.code}>
                {c.label} {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder || "9123456789"}
          value={number}
          onChange={handleNumberChange}
          className="flex-1"
        />
      </div>
    );
  }
);
PhoneInput2.displayName = "PhoneInput2"; 
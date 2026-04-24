import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#9CA3AF] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 bg-[#111118] border border-[#1E1E2A] text-[#F0F0F5] rounded-lg text-sm transition-all",
              "placeholder:text-[#4B5563]",
              "focus:outline-none focus:ring-2 focus:ring-[#20b2aa]/40 focus:border-[#20b2aa]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-9 pr-3" : "px-3",
              error && "border-red-500/50 focus:ring-red-500/30 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

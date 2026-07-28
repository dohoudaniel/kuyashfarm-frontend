import { LucideIcon } from "lucide-react";

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * Reusable form textarea field with label, icon, and error handling
 */
export function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = "",
}: FormTextareaProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        )}
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        {error ? (
          <p id={`${name}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : (
          <span></span>
        )}
        {maxLength && (
          <p className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

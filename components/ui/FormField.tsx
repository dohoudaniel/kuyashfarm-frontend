import { LucideIcon } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "number" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  icon?: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}

/**
 * Reusable form input field with label, icon, and error handling
 */
export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

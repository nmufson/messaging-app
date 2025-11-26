import * as R from 'remeda';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date';

export interface InputGroupProps<T extends Record<string, unknown>> {
  type: InputType;
  label?: string;
  name: keyof T & string;
  value: string;
  onChange: (field: keyof T & string, value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  maxLength?: number;
  minLength?: number;
}

export function InputGroup<T extends Record<string, unknown>>(
  props: InputGroupProps<T>
) {
  const {
    type,
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    helperText,
    maxLength,
    minLength,
  } = props;

  return (
    <div className="mb-6">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        minLength={minLength}
        className={`
          w-full px-4 py-2 
          border rounded-lg 
          focus:outline-none focus:ring-2 
          transition-colors
          ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        aria-invalid={R.isTruthy(error)}
        aria-describedby={
          error ? `${name}-error` : helperText ? `${name}-helper` : undefined
        }
      />
      {error && (
        <span id={`${name}-error`} className="block mt-1 text-sm text-red-600">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span
          id={`${name}-helper`}
          className="block mt-1 text-sm text-gray-500"
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

export type FieldConfig<T> = {
  name: keyof T;
  label: string;
  type: InputType | 'image';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

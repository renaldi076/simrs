import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label?: string;
  name: string;
  type?: 'text' | 'password' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  maxLength,
  className = '',
}: InputProps): React.ReactElement {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          className={`
            w-full rounded-lg border px-3 py-2 text-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${type === 'password' ? 'pr-10' : ''}
          `}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <div className="flex justify-between">
        {error && (
          <p id={`${name}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${name}-helper`} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
        {maxLength && (
          <p className="text-xs text-gray-400 ml-auto">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

export default Input;

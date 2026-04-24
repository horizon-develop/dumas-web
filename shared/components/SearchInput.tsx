import React, { useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  inputId?: string;
  inputName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Buscar...",
  value,
  onChange,
  onClear,
  className = "",
  size = 'md',
  disabled = false,
  inputId,
  inputName,
  inputProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'pl-7 pr-8 py-1.5 text-xs',
    md: 'pl-8 pr-9 py-2 text-sm',
    lg: 'pl-10 pr-11 py-2.5 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const iconPositions = {
    sm: 'left-2',
    md: 'left-2.5',
    lg: 'left-3'
  };

  const clearPositions = {
    sm: 'right-2',
    md: 'right-2.5',
    lg: 'right-3'
  };

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <FiSearch 
        className={`absolute ${iconPositions[size]} top-1/2 transform -translate-y-1/2 text-gray-400`} 
        size={iconSizes[size]} 
      />
      <input
        ref={inputRef}
        type="text"
        id={inputId || inputName || inputProps?.id}
        name={inputName || inputId || inputProps?.name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full ${sizeClasses[size]} border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed`}
        autoComplete="off"
        {...inputProps}
      />
      {value && !disabled && (
        <button
          onClick={handleClear}
          className={`absolute ${clearPositions[size]} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full`}
          title="Limpiar búsqueda"
        >
          <FiX size={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

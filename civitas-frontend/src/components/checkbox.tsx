import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  labelClassName?: string;
  checkboxClassName?: string;
}

export function Checkbox({
  label,
  labelClassName = '',
  checkboxClassName = '',
  id,
  disabled = false,
  checked,
  defaultChecked,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={`
            flex items-center justify-center
            w-10 h-10 
            rounded-lg
            border-2 border-gray-800
            bg-gray-200
            cursor-pointer
            transition-all duration-200
            hover:border-teal-700 hover:bg-gray-300
            peer-checked:bg-teal-700 peer-checked:border-teal-700
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700
            ${checkboxClassName}
          `}
          aria-label={label || 'Checkbox'}
        >
          <svg
            className="w-6 h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </label>
      </div>
      
      {label && (
        <label
          htmlFor={checkboxId}
          className={`
            text-2xl font-normal text-gray-800
            cursor-pointer
            select-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${labelClassName}
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
}

// Variações do componente

interface CheckboxGroupProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
  name?: string;
}

export function CheckboxGroup({
  options,
  value,
  defaultValue,
  onChange,
  className = '',
  name,
}: CheckboxGroupProps) {
  const [selected, setSelected] = React.useState<string[]>(
    value || defaultValue || []
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newSelected = checked
      ? [...selected, optionValue]
      : selected.filter((v) => v !== optionValue);
    
    if (value === undefined) {
      setSelected(newSelected);
    }
    
    onChange?.(newSelected);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          disabled={option.disabled}
          checked={selected.includes(option.value)}
          onChange={(e) => handleChange(option.value, e.target.checked)}
          name={name}
        />
      ))}
    </div>
  );
}
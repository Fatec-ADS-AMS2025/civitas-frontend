import React, { InputHTMLAttributes, useId, useEffect, useRef, useState } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value?: string;
  indeterminate?: boolean;
}

export function Checkbox({
  label,
  value,
  id,
  disabled = false,
  checked,
  defaultChecked,
  indeterminate = false,
  onChange,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id || useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        ref={inputRef}
        type="checkbox"
        id={checkboxId}
        value={value}
        disabled={disabled}
        checked={currentChecked}
        onChange={handleChange}
        className="w-5 h-5 cursor-pointer accent-[#004C57] border-2 border-[#004C57] rounded focus:ring-2 focus:ring-[#58AFAE] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-checked={indeterminate ? 'mixed' : currentChecked}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={`text-base font-medium text-gray-800 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}

interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxGroupOption[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  className?: string;
  name?: string;
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  className = '',
  name,
}: CheckboxGroupProps) {
  const [selected, setSelected] = useState<string[]>(value || []);

  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newSelected = checked
      ? [...selected, optionValue]
      : selected.filter((v) => v !== optionValue);
    if (!value) setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          id={`${name}-${option.value}`}
          label={option.label}
          value={option.value}
          disabled={option.disabled}
          checked={selected.includes(option.value)}
          onChange={(e) => handleChange(option.value, e.target.checked)}
          name={name}
        />
      ))}
    </div>
  );
}
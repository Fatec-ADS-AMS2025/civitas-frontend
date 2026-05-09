import React, { InputHTMLAttributes, useId, useEffect, useRef, useState } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value?: string;
  indeterminate?: boolean;
}

function Checkbox({
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
        className="h-5 w-5 cursor-pointer rounded-sm border-2 border-[var(--primary-1)] accent-[var(--primary-1)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-checked={indeterminate ? 'mixed' : currentChecked}
        {...props}
      />
      {label && (
        <label
          htmlFor={checkboxId}
          className={`cursor-pointer select-none text-base font-medium text-[var(--foreground)] ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;

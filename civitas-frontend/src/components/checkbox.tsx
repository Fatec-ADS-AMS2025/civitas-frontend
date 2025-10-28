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
        className="w-5 h-5 cursor-pointer accent-primary-1 border-2 border-primary-1 rounded focus:ring-2 focus:ring-secondary-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Checkbox;
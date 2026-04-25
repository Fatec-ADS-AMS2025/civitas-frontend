import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const stableInputId = id ?? autoId;
    const describedBy = typeof props['aria-describedby'] === 'string'
      ? props['aria-describedby']
      : undefined;
    const errorId = describedBy ?? `${stableInputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={stableInputId}
            className="civitas-input__label mb-2 block text-sm font-semibold capitalize tracking-[0.01em] text-[var(--foreground-muted)]"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={stableInputId}
          className={`
            civitas-input
            w-full
            min-h-[44px]
            rounded-xl
            border border-[var(--border-default)]
            bg-[var(--surface-elevated)]
            px-3.5 py-2.5
            text-sm text-[var(--foreground)]
            focus:border-[var(--primary-1)]
            focus:outline-none
            focus:ring-4 focus:ring-[var(--focus-ring)]
            disabled:bg-[#F4F6F8]
            disabled:text-[#9AA5AD]
            disabled:cursor-not-allowed
            disabled:border-[#E3E7EA]
            disabled:placeholder:text-[#AAB3BA]
            placeholder:text-[var(--foreground-soft)]
            transition-all duration-[var(--motion-duration-fast)]
            ${error ? 'border-red-300 bg-red-50/90 focus:border-red-400 focus:bg-red-50 focus:ring-red-200' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-describedby={error ? errorId : describedBy}
          {...props}
        />
        {error && (
          <p id={errorId} className="civitas-input__error mt-1.5 text-sm font-medium text-[#C23D3D]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

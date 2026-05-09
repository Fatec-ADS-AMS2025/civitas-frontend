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
            {props.required && <span className="ml-1 text-[var(--tone-danger-text)]">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={stableInputId}
          className={`
            civitas-input
            w-full
            min-h-[44px]
            rounded-sm
            border border-[var(--border-default)]
            bg-[var(--surface-elevated)]
            px-3.5 py-2.5
            text-sm text-[var(--foreground)]
            focus:border-[var(--primary-1)]
            focus:outline-none
            focus:ring-4 focus:ring-[var(--focus-ring)]
            disabled:cursor-not-allowed
            placeholder:text-[var(--foreground-soft)]
            transition-all duration-[var(--motion-duration-fast)]
            ${error ? 'civitas-input--error' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-describedby={error ? errorId : describedBy}
          {...props}
        />
        {error && (
          <p id={errorId} className="civitas-input__error mt-1.5 text-sm font-medium text-[var(--tone-danger-text)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

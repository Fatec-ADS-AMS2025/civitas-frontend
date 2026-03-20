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
    const errorId = typeof props['aria-describedby'] === 'string'
      ? props['aria-describedby']
      : undefined;

    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={stableInputId}
            className="block text-sm font-medium text-gray-700 mb-2 capitalize"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={stableInputId}
          className={`
            w-full
            px-4 py-3
            border-2 border-primary-1
            rounded-full
            bg-white
            text-gray-700
            focus:outline-none
            focus:ring-2 focus:ring-primary-1
            disabled:bg-gray-200
            disabled:text-gray-400
            disabled:cursor-not-allowed
            disabled:placeholder:text-gray-300
            transition-all duration-200
            ${error ? 'border-red-500 bg-red-50 focus:border-red-500 focus:bg-red-50' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

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
      <div className="w-full">
        {label && (
          <label
            htmlFor={stableInputId}
            className="mb-2 block text-sm font-semibold capitalize tracking-[0.01em] text-[#4D5A63]"
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
            rounded-2xl
            border border-[#CFE3E3]
            bg-white
            px-4 py-3.5
            text-[15px] text-[#22313A]
            shadow-[0_2px_10px_rgba(0,0,0,0.03)]
            focus:border-[#58AFAE]
            focus:outline-none
            focus:ring-4 focus:ring-[#58AFAE]/20
            disabled:bg-[#F4F6F8]
            disabled:text-[#9AA5AD]
            disabled:cursor-not-allowed
            disabled:border-[#E3E7EA]
            disabled:placeholder:text-[#AAB3BA]
            transition-all duration-200
            ${error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:bg-red-50 focus:ring-red-200' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

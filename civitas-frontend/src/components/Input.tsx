import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const autoId = useId();
  const stableInputId = id ?? autoId;
  const errorId = `${stableInputId}-error`;
  const descriptionId = `${stableInputId}-desc`;

  // Monta lista de IDs para aria-describedby
  const ariaDescribedBy = [
    error ? errorId : null,
    props['aria-describedby'] || null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full mb-4" role="group">
      {label && (
        <label 
          htmlFor={stableInputId}
          className="block text-sm font-medium text-gray-700 mb-2 capitalize"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
          {props.required && (
            <span className="sr-only"> (obrigatório)</span>
          )}
        </label>
      )}
      <input
        id={stableInputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={ariaDescribedBy}
        className={`
          w-full 
          px-4 py-3
          border-2 border-primary-1
          rounded-full
          bg-white
          text-gray-700
          focus:outline-none
          focus-visible:ring-3 focus-visible:ring-primary-1 focus-visible:ring-offset-2
          disabled:bg-gray-200
          disabled:text-gray-400
          disabled:cursor-not-allowed
          disabled:placeholder:text-gray-300
          transition-all duration-200
          ${error ? 'border-red-500 bg-red-50 focus:border-red-500 focus:bg-red-50 focus-visible:ring-red-500' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
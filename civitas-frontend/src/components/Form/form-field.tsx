'use client'

import React from 'react'
import Input from '../Input'
import type { FormFieldConfig, FormMode } from './form'
import { getFieldErrorId, toInputValue, toLabel } from './form-utils'
import { resolveInputMask } from '@/lib/input-mask'

interface FormFieldProps {
    field: FormFieldConfig
    value: unknown
    error?: string
    onChange: (field: FormFieldConfig, value: unknown) => void
    mode: FormMode
    isReadOnlyMode: boolean
}

function FormField({
    field,
    value,
    error,
    onChange,
    mode,
    isReadOnlyMode,
}: FormFieldProps) {
    const errorId = getFieldErrorId(field.key)
    // Resolve comportamento de mask uma vez por render.
    const resolvedMask = resolveInputMask(field.mask)
    const resolvedInputMode = field.inputMode ?? resolvedMask?.inputMode
    const resolvedMaxLength = field.maxLength ?? resolvedMask?.maxLength

    // Regra única para desabilitar campos por modo/flag.
    const getFieldDisabled = () => {
        if (field.disabled) return true
        if (isReadOnlyMode) return true
        return field.readOnlyInModes?.includes(mode) ?? false
    }

    const commonProps = {
        required: field.required && !isReadOnlyMode,
        disabled: getFieldDisabled(),
        label: field.label ?? toLabel(field.key),
        error,
        errorId,
    }

    if (field.type === 'select') {
        // Select nativo mantem opcoes e validacao simples.
        return (
            <div className='w-full'>
                <label className='mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]'>
                    {commonProps.label}
                    {commonProps.required && <span className='ml-1 text-[var(--text-danger)]'>*</span>}
                </label>
                <select
                    value={toInputValue(value)}
                    required={commonProps.required}
                    disabled={commonProps.disabled}
                    onChange={(e) => onChange(field, e.target.value)}
                    aria-invalid={Boolean(commonProps.error)}
                    aria-describedby={commonProps.error ? commonProps.errorId : undefined}
                    className={`w-full rounded-sm border bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-text)] ${
                        commonProps.error
                            ? 'border-[var(--input-error-border)] bg-[var(--input-error-bg)] focus:border-[var(--input-error-border)] focus:ring-[var(--input-error-ring)]'
                            : 'border-[var(--border-default)]'
                    }`}
                >
                    <option value='' disabled>
                        {field.placeholder ?? commonProps.label}
                    </option>
                    {(field.options ?? []).map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {commonProps.error && (
                    <p id={commonProps.errorId} className='mt-1.5 text-sm font-medium text-[var(--text-danger)]'>
                        {commonProps.error}
                    </p>
                )}
            </div>
        )
    }

    // Textarea para campos de descricao e textos longos.
    if (field.type === 'textarea') {
        return (
            <div className='w-full'>
                <label className='mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]'>
                    {commonProps.label}
                    {commonProps.required && <span className='ml-1 text-[var(--text-danger)]'>*</span>}
                </label>
                <textarea
                    value={toInputValue(value)}
                    required={commonProps.required}
                    disabled={commonProps.disabled}
                    placeholder={field.placeholder ?? commonProps.label}
                    onChange={(e) => onChange(field, e.target.value)}
                    aria-invalid={Boolean(commonProps.error)}
                    aria-describedby={commonProps.error ? commonProps.errorId : undefined}
                    className={`min-h-[120px] w-full resize-none rounded-sm border bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-text)] ${
                        commonProps.error
                            ? 'border-[var(--input-error-border)] bg-[var(--input-error-bg)] focus:border-[var(--input-error-border)] focus:ring-[var(--input-error-ring)]'
                            : 'border-[var(--border-default)]'
                    }`}
                />
                {commonProps.error && (
                    <p id={commonProps.errorId} className='mt-1.5 text-sm font-medium text-[var(--text-danger)]'>
                        {commonProps.error}
                    </p>
                )}
            </div>
        )
    }

    // Fallback para inputs simples.
    return (
        <Input
            type={field.mask ? 'text' : field.type ?? 'text'}
            placeholder={field.placeholder ?? commonProps.label}
            required={commonProps.required}
            disabled={commonProps.disabled}
            inputMode={resolvedInputMode}
            maxLength={resolvedMaxLength}
            value={toInputValue(value)}
            label={commonProps.label}
            error={commonProps.error}
            aria-describedby={commonProps.error ? commonProps.errorId : undefined}
            aria-invalid={Boolean(commonProps.error)}
            onChange={(e) => onChange(field, e.target.value)}
        />
    )
}

export default React.memo(FormField)

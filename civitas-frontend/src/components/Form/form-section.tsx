'use client'

import React from 'react'
import FormField from './form-field'
import type { FormFieldConfig, FormMode } from './form'
import { getGridColsClass } from './form-utils'

interface FormSectionProps {
    sectionTitle?: string
    fields: FormFieldConfig[]
    formData: Record<string, unknown>
    errors: Record<string, string>
    onChange: (field: FormFieldConfig, value: unknown) => void
    mode: FormMode
    isReadOnlyMode: boolean
}

export default function FormSection({
    sectionTitle,
    fields,
    formData,
    errors,
    onChange,
    mode,
    isReadOnlyMode,
}: FormSectionProps) {
    if (fields.length === 0) return null

    // Grid responsivo para manter leitura em telas menores.
    const gridClass = getGridColsClass()

    if (!sectionTitle) {
        // Campos sem section renderizam em grid simples.
        return (
            <div className={`grid ${gridClass} gap-4`}>
                {fields.map((field) => (
                    <FormField
                        key={field.key}
                        field={field}
                        value={formData[field.key]}
                        error={errors[field.key]}
                        onChange={onChange}
                        mode={mode}
                        isReadOnlyMode={isReadOnlyMode}
                    />
                ))}
            </div>
        )
    }

    // Secao com titulo e borda para agrupar campos relacionados.
    return (
        <div className='rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 md:p-5'>
            <h3 className='mb-4 text-base font-semibold text-[var(--foreground)]'>
                {sectionTitle}
            </h3>
            <div className={`grid ${gridClass} gap-4`}>
                {fields.map((field) => (
                    <FormField
                        key={field.key}
                        field={field}
                        value={formData[field.key]}
                        error={errors[field.key]}
                        onChange={onChange}
                        mode={mode}
                        isReadOnlyMode={isReadOnlyMode}
                    />
                ))}
            </div>
        </div>
    )
}

'use client'

import React from 'react'
import Button from '../button'
import FormSection from './form-section'
import type { FormFieldConfig, FormMode } from './form'
import type { GroupedFields } from './form-utils'

interface FormModalProps {
    groupedFields: GroupedFields
    sectionOrder: string[]
    formData: Record<string, unknown>
    errors: Record<string, string>
    onFieldChange: (field: FormFieldConfig, value: unknown) => void
    mode: FormMode
    name?: string
    isLoading: boolean
    isViewMode: boolean
    onCancel?: () => void
    onSubmit: (event: React.FormEvent) => void
}

const modeLabels: Record<FormMode, string> = {
    edit: 'Editar',
    view: 'Visualizar',
    delete: 'Deletar',
    create: 'Criar',
}

export default function FormModal({
    groupedFields,
    sectionOrder,
    formData,
    errors,
    onFieldChange,
    mode,
    name,
    isLoading,
    isViewMode,
    onCancel,
    onSubmit,
}: FormModalProps) {
    // Título do modal varia por modo e entidade.
    const title = mode === 'create' ? 'Cadastro' : `${modeLabels[mode]} ${name ?? ''}`
    

    return (
        <>
            {/* Container com scroll interno para grandes volumes de campos. */}
            <form
                className='flex w-full max-w-5xl flex-col rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 text-[var(--foreground)] sm:p-6 max-h-[80vh] overflow-y-auto'
                onSubmit={onSubmit}
                aria-busy={isLoading}
            >
                <div className='flex flex-col gap-4 border-b border-[var(--divider)] pb-5'>
                    <div className='flex flex-col'>
                        <h1 className='text-[24px] font-semibold text-[var(--foreground)] sm:text-[28px]'>
                            {title}
                        </h1>
                        <p className='text-sm text-[var(--foreground-muted)]'>Revise os campos antes de confirmar.</p>
                    </div>
                </div>

                {/* Secoes sao renderizadas apos campos sem section para manter a ordem. */}
                <div className='mt-6 flex flex-col gap-4 pb-10'>
                    {groupedFields.noSection.length > 0 && (
                        <FormSection
                            fields={groupedFields.noSection}
                            formData={formData}
                            errors={errors}
                            onChange={onFieldChange}
                            mode={mode}
                            isReadOnlyMode={mode === 'view' || mode === 'delete'}
                        />
                    )}

                    {sectionOrder.map((sectionName) => (
                        <FormSection
                            key={sectionName}
                            sectionTitle={sectionName}
                            fields={groupedFields.sections[sectionName] ?? []}
                            formData={formData}
                            errors={errors}
                            onChange={onFieldChange}
                            mode={mode}
                            isReadOnlyMode={mode === 'view' || mode === 'delete'}
                        />
                    ))}
                </div>

                <div className='flex flex-col gap-3 border-t border-[var(--divider)] md:flex-row absolute bottom-5 left-0 w-full pt-5 bg-[inherit] px-5 sm:px-6'>
                    <Button
                        variant='secondary'
                        className='!w-full !max-w-none'
                        onClick={onCancel}
                        type='button'
                    >
                        {mode === 'view' ? 'Fechar' : 'Cancelar'}
                    </Button>

                    {isViewMode ? null : (
                        <Button className='!w-full !max-w-none' type='submit' disabled={isLoading}>
                            {isLoading ? 'Processando...' : mode === 'delete' ? 'Confirmar exclusao' : 'Confirmar'}
                        </Button>
                    )}
                </div>
            </form>
        </>
    )
}

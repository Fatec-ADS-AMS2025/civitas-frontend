"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Button from '../button'
import Input from '../Input'
import {
    formatMaskedValue,
    normalizeMaskedValue,
    resolveInputMask,
    type InputMask,
} from '@/lib/input-mask'

type FormMode = 'create' | 'edit' | 'view' | 'delete'

type FormOption = {
    value: string | number;
    label: string;
}

type ValidationFn = (
    value: unknown,
    formData: Record<string, unknown>,
    mode: FormMode
) => string | undefined

type FormFieldConfig = {
    key: string;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'date' | 'select' | 'textarea';
    mask?: InputMask;
    required?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    maxLength?: number;
    options?: FormOption[];
    readOnlyInModes?: FormMode[];
    validate?: ValidationFn;
}

type FieldConfig = FormFieldConfig

type FormProps = {
    camps?: string[];
    name?: string;
    object?: object | string[];
    type?: FormMode;
    fields?: FormFieldConfig[];
    validationSchema?: Record<string, ValidationFn>;
    hiddenFields?: string[];
    onCancel?: () => void;
    onConfirm?: (data: Record<string, unknown>) => Promise<unknown> | unknown;
}

const DEFAULT_HIDDEN_FIELDS = ['id']
const FIELDS_PER_STEP = 4

const toLabel = (field: string): string => field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const inferFieldType = (value: unknown): FormFieldConfig['type'] => {
    if (typeof value === 'number') return 'number'
    return 'text'
}

const toFieldConfig = (key: string, sourceValue?: unknown): FormFieldConfig => ({
    key,
    label: toLabel(key),
    placeholder: toLabel(key),
    type: inferFieldType(sourceValue),
})

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return !!value && typeof value === 'object' && !Array.isArray(value)
}

const toInputValue = (value: unknown): string => {
    if (value === undefined || value === null) return ''
    return String(value)
}

const getFieldErrorId = (fieldKey: string) => `${fieldKey}-error`

const getColumnClass = (fieldCount: number) => {
    if (fieldCount <= 1) return 'grid-cols-1'
    if (fieldCount <= 4) return 'grid-cols-1 md:grid-cols-2'
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
}

const formatValueForFieldState = (
    field: FormFieldConfig | undefined,
    value: unknown,
): unknown => {
    if (!field) return value
    if (value === undefined || value === null) return value

    if (field.mask) {
        return formatMaskedValue(field.mask, value)
    }

    return value
}

export type { FieldConfig, FormFieldConfig, FormMode, FormOption, ValidationFn }

export default function Form({
    camps,
    name,
    object,
    type = 'create',
    fields,
    validationSchema,
    hiddenFields,
    onCancel,
    onConfirm,
}: FormProps) {
    const initialData = isRecord(object) ? object : {}
    const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [currentStep, setCurrentStep] = useState(0)

    const mode: FormMode = type
    const sourceFromCamps = camps ?? (Array.isArray(object) ? object : undefined) ?? []
    const sourceFromObject = isRecord(object) ? Object.keys(object) : []

    const mergedFields: FormFieldConfig[] = fields && fields.length > 0
        ? fields
        : (sourceFromObject.length > 0
            ? sourceFromObject.map((fieldKey) => toFieldConfig(fieldKey, initialData[fieldKey]))
            : sourceFromCamps.map((fieldKey) => toFieldConfig(fieldKey)))

    const fieldMap = useMemo(() => {
        return new Map(mergedFields.map((field) => [field.key, field]))
    }, [mergedFields])

    const buildDisplayFormData = (source: Record<string, unknown>) => {
        const keysToNormalize = mergedFields.length > 0
            ? mergedFields.map((field) => field.key)
            : Object.keys(source)

        return Object.fromEntries(
            keysToNormalize.map((key) => {
                const field = fieldMap.get(key)
                return [key, formatValueForFieldState(field, source[key])]
            })
        )
    }

    useEffect(() => {
        if (isRecord(object)) {
            setFormData(buildDisplayFormData(object))
            return
        }

        if (Array.isArray(object)) {
            const emptyObject = object.reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = ''
                return acc
            }, {})
            setFormData(buildDisplayFormData(emptyObject))
            return
        }

        setFormData({})
    }, [fieldMap, mergedFields, object])

    const fieldsToHide = hiddenFields ?? DEFAULT_HIDDEN_FIELDS
    const visibleFields = mergedFields.filter((field) => !field.hidden && !fieldsToHide.includes(field.key))

    const splitFieldsIntoSteps = (fieldsToSplit: FormFieldConfig[]): FormFieldConfig[][] => {
        if (fieldsToSplit.length === 0) return [[]]
        if (mode === 'delete' || fieldsToSplit.length <= FIELDS_PER_STEP) return [fieldsToSplit]

        const chunks: FormFieldConfig[][] = []
        for (let start = 0; start < fieldsToSplit.length; start += FIELDS_PER_STEP) {
            chunks.push(fieldsToSplit.slice(start, start + FIELDS_PER_STEP))
        }

        return chunks
    }

    const normalizeFieldValue = (
        field: FormFieldConfig | undefined,
        value: unknown,
        stage: 'change' | 'submit'
    ): unknown => {
        if (!field) return value
        if (value === undefined || value === null) return value

        if (field.mask) {
            if (stage === 'change') {
                return formatMaskedValue(field.mask, value)
            }

            value = normalizeMaskedValue(field.mask, value)
        }

        if (field.type === 'select') {
            if (value === '') return ''
            const matchingOption = field.options?.find((option) => String(option.value) === String(value))
            return matchingOption ? matchingOption.value : value
        }

        if (field.type === 'number') {
            if (value === '') return ''
            if (typeof value === 'number') return value

            const textValue = String(value).trim()
            if (textValue.length === 0) return ''
            if (stage === 'change') return textValue

            const parsedValue = Number(textValue)
            return Number.isNaN(parsedValue) ? value : parsedValue
        }

        return value
    }

    const buildNormalizedFormData = (
        source: Record<string, unknown>,
        stage: 'change' | 'submit'
    ): Record<string, unknown> => {
        const keysToNormalize = mergedFields.length > 0
            ? mergedFields.map((field) => field.key)
            : Object.keys(source)

        const normalizedEntries = keysToNormalize.map((key) => {
            const field = fieldMap.get(key)
            return [key, normalizeFieldValue(field, source[key], stage)] as const
        })

        return Object.fromEntries(normalizedEntries)
    }

    const fieldSteps = splitFieldsIntoSteps(visibleFields)
    const totalSteps = fieldSteps.length
    const currentFields = fieldSteps[currentStep] ?? []
    const currentStepColumns = getColumnClass(currentFields.length)
    const isViewMode = mode === 'view'
    const isReadOnlyMode = mode === 'view' || mode === 'delete'
    const hasMultipleSteps = totalSteps > 1

    const imgs: Record<FormMode, string> = {
        edit: '/imgsForm/image-edit.svg',
        view: '/imgsForm/image-view.svg',
        delete: '/imgsForm/image-delete.svg',
        create: '/imgsForm/image-add.svg',
    }

    const tipos: Record<FormMode, string> = {
        edit: 'Editar',
        view: 'Visualizar',
        delete: 'Deletar',
        create: 'Criar',
    }

    useEffect(() => {
        setCurrentStep(0)
        setErrors({})
    }, [object, camps, fields, type])

    useEffect(() => {
        if (currentStep > totalSteps - 1) {
            setCurrentStep(Math.max(0, totalSteps - 1))
        }
    }, [currentStep, totalSteps])

    const validateFields = (fieldsForValidation: FormFieldConfig[]) => {
        const nextErrors: Record<string, string> = {}
        const validatedKeys = fieldsForValidation.map((field) => field.key)
        const normalizedFormData = buildNormalizedFormData(formData, 'submit')

        fieldsForValidation.forEach((field) => {
            const value = normalizedFormData[field.key]
            const fieldLabel = field.label ?? toLabel(field.key)
            const valueAsText = value === undefined || value === null ? '' : String(value).trim()

            if (field.required && valueAsText.length === 0 && !isViewMode && mode !== 'delete') {
                nextErrors[field.key] = `${fieldLabel} é obrigatório.`
                return
            }

            const fieldValidator = field.validate ?? validationSchema?.[field.key]
            if (fieldValidator) {
                const message = fieldValidator(value, normalizedFormData, mode)
                if (message) nextErrors[field.key] = message
            }
        })

        setErrors((previousErrors) => {
            const updatedErrors = { ...previousErrors }

            validatedKeys.forEach((key) => {
                delete updatedErrors[key]
            })

            return {
                ...updatedErrors,
                ...nextErrors,
            }
        })

        return Object.keys(nextErrors).length === 0
    }

    const validateStepsUntil = (targetStep: number) => {
        if (isReadOnlyMode) return true

        const lastStepToValidate = Math.min(targetStep - 1, fieldSteps.length - 1)
        for (let stepIndex = 0; stepIndex <= lastStepToValidate; stepIndex += 1) {
            const stepFields = fieldSteps[stepIndex] ?? []
            const isValidStep = validateFields(stepFields)
            if (!isValidStep) {
                setCurrentStep(stepIndex)
                return false
            }
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isViewMode || isLoading) return

        if (currentStep < totalSteps - 1) {
            handleNextStep()
            return
        }

        if (!onConfirm) return
        if (!validateFields(visibleFields)) return

        const normalizedFormData = buildNormalizedFormData(formData, 'submit')

        setIsLoading(true)
        try {
            await onConfirm(normalizedFormData)
        } catch (error) {
            console.error('Erro no formulário:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: FormFieldConfig, value: unknown) => {
        const normalizedValue = normalizeFieldValue(field, value, 'change')

        setFormData((prev) => ({
            ...prev,
            [field.key]: normalizedValue,
        }))

        if (errors[field.key]) {
            setErrors((prev) => ({ ...prev, [field.key]: '' }))
        }
    }

    const goToStep = (targetStep: number) => {
        if (targetStep < 0 || targetStep >= totalSteps) return

        if (targetStep <= currentStep || isReadOnlyMode) {
            setCurrentStep(targetStep)
            return
        }

        const canAdvance = validateStepsUntil(targetStep)
        if (canAdvance) setCurrentStep(targetStep)
    }

    const handleNextStep = () => {
        if (currentStep >= totalSteps - 1) return

        const nextStep = currentStep + 1
        const canAdvance = isReadOnlyMode || validateStepsUntil(nextStep)
        if (!canAdvance) return

        setCurrentStep(nextStep)
    }

    const handlePreviousStep = () => {
        if (currentStep <= 0) return
        setCurrentStep((prev) => prev - 1)
    }

    const getFieldDisabled = (field: FormFieldConfig) => {
        if (field.disabled) return true
        if (isReadOnlyMode) return true
        return field.readOnlyInModes?.includes(mode) ?? false
    }

    const renderField = (field: FormFieldConfig) => {
        const fieldValue = formData[field.key]
        const fieldError = errors[field.key]
        const errorId = getFieldErrorId(field.key)
        const resolvedMask = resolveInputMask(field.mask)
        const resolvedInputMode = field.inputMode ?? resolvedMask?.inputMode
        const resolvedMaxLength = field.maxLength ?? resolvedMask?.maxLength
        const commonProps = {
            required: field.required && !isReadOnlyMode,
            disabled: getFieldDisabled(field),
            label: field.label ?? toLabel(field.key),
            error: fieldError,
            errorId,
        }

        if (field.type === 'select') {
            return (
                <div key={field.key} className='w-full'>
                    <label className='mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]'>
                        {commonProps.label}
                        {commonProps.required && <span className='text-red-500 ml-1'>*</span>}
                    </label>
                    <select
                        value={toInputValue(fieldValue)}
                        required={commonProps.required}
                        disabled={commonProps.disabled}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        aria-invalid={Boolean(commonProps.error)}
                        aria-describedby={commonProps.error ? commonProps.errorId : undefined}
                        className='w-full rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[#E3E7EA] disabled:bg-[#F4F6F8] disabled:text-[#9AA5AD]'
                    >
                        <option value=''>{field.placeholder ?? commonProps.label}</option>
                        {(field.options ?? []).map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {commonProps.error && (
                        <p id={commonProps.errorId} className='mt-1.5 text-sm font-medium text-red-600'>
                            {commonProps.error}
                        </p>
                    )}
                </div>
            )
        }

        if (field.type === 'textarea') {
            return (
                <div key={field.key} className='w-full'>
                    <label className='mb-2 block text-sm font-semibold tracking-[0.01em] text-[var(--foreground-muted)]'>
                        {commonProps.label}
                        {commonProps.required && <span className='text-red-500 ml-1'>*</span>}
                    </label>
                    <textarea
                        value={toInputValue(fieldValue)}
                        required={commonProps.required}
                        disabled={commonProps.disabled}
                        placeholder={field.placeholder ?? commonProps.label}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        aria-invalid={Boolean(commonProps.error)}
                        aria-describedby={commonProps.error ? commonProps.errorId : undefined}
                        className='min-h-[120px] w-full resize-none rounded-sm border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--foreground)] transition-all duration-[var(--motion-duration-fast)] focus:border-[var(--primary-1)] focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:border-[#E3E7EA] disabled:bg-[#F4F6F8] disabled:text-[#9AA5AD]'
                    />
                    {commonProps.error && (
                        <p id={commonProps.errorId} className='mt-1.5 text-sm font-medium text-red-600'>
                            {commonProps.error}
                        </p>
                    )}
                </div>
            )
        }

        return (
            <Input
                key={field.key}
                type={field.mask ? 'text' : field.type ?? 'text'}
                placeholder={field.placeholder ?? commonProps.label}
                required={commonProps.required}
                disabled={commonProps.disabled}
                inputMode={resolvedInputMode}
                maxLength={resolvedMaxLength}
                value={toInputValue(fieldValue)}
                label={commonProps.label}
                error={commonProps.error}
                aria-describedby={commonProps.error ? commonProps.errorId : undefined}
                aria-invalid={Boolean(commonProps.error)}
                onChange={(e) => handleInputChange(field, e.target.value)}
            />
        )
    }

    return (
        <form
            className='flex w-full max-w-[1120px] flex-col rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-5 text-[var(--foreground)] sm:p-6'
            onSubmit={handleSubmit}
            aria-busy={isLoading}
        >
            <div className='flex flex-col gap-4 border-b border-[var(--divider)] pb-5 md:flex-row md:items-center md:justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-[24px] font-semibold text-[var(--foreground)] sm:text-[28px]'>
                        {mode === 'create' ? 'Cadastro' : `${tipos[mode]} ${name ?? ''}`}
                    </h1>
                    <p className='text-sm text-[var(--foreground-muted)]'>Revise os campos antes de confirmar.</p>
                </div>

                {hasMultipleSteps && (
                    <div className='flex flex-wrap items-center gap-2 font-semibold text-primary-1'>
                        <span className='mr-1 text-sm text-[var(--foreground-muted)]'>Etapas</span>
                        {Array.from({ length: totalSteps }).map((_, index) => {
                            const isActive = index === currentStep
                            const isCompleted = index < currentStep

                            return (
                                <button
                                    key={`step-${index}`}
                                    type='button'
                                    onClick={(event) => {
                                        event.preventDefault()
                                        goToStep(index)
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center rounded-sm border text-sm transition-all ${isActive || isCompleted
                                        ? 'border-[var(--secundary-1)] bg-[var(--secundary-1)] text-white'
                                        : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--primary-1)]'
                                        }`}
                                    aria-label={`Ir para etapa ${index + 1}`}
                                >
                                    {index + 1}
                                </button>
                            )
                        })}
                        <span className={`rounded-sm border px-4 py-1 text-sm ${currentStep === totalSteps - 1 ? 'border-[var(--secundary-1)] bg-[var(--secundary-1)] text-white' : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--primary-1)]'}`}>
                            CONFIRMAR
                        </span>
                    </div>
                )}
            </div>

            <div className='mt-6 grid grid-cols-1 gap-5 md:grid-cols-12'>
                <div className='hidden items-start justify-center rounded-sm border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-5 md:col-span-4 md:flex'>
                    <Image src={imgs[mode]} alt={tipos[mode]} className='w-full h-auto max-w-[260px]' width={260} height={260} />
                </div>
                <div className='rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4 md:col-span-8 md:p-5'>
                    <p className='mb-3 text-sm text-[var(--foreground-muted)]'>
                        Etapa {currentStep + 1} de {totalSteps}
                    </p>
                    <div className={`grid ${currentStepColumns} gap-4`}>
                        {currentFields.map((field) => renderField(field))}
                    </div>
                </div>
            </div>

            <div className='mt-6 flex flex-col gap-3 border-t border-[var(--divider)] pt-5 md:flex-row'>
                <Button
                    variant='secondary'
                    className='!w-full !max-w-none'
                    onClick={onCancel}
                    type='button'
                >
                    {mode === 'view' ? 'Fechar' : 'Cancelar'}
                </Button>

                {currentStep > 0 && (
                    <Button
                        variant='secondary'
                        className='!w-full !max-w-none'
                        onClick={handlePreviousStep}
                        type='button'
                    >
                        Voltar
                    </Button>
                )}

                {currentStep < totalSteps - 1 ? (
                    <Button
                        className='!w-full !max-w-none'
                        type='button'
                        onClick={(event) => {
                            event.preventDefault()
                            handleNextStep()
                        }}
                    >
                        Avançar
                    </Button>
                ) : isViewMode ? null : (
                    <Button
                        className='!w-full !max-w-none'
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : mode === 'delete' ? 'Confirmar exclusão' : 'Confirmar'}
                    </Button>
                )}
            </div>
        </form>
    )
}

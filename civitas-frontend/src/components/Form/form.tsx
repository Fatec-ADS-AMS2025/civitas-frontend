"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Button from '../button'
import Input from '../Input'

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
    required?: boolean;
    hidden?: boolean;
    disabled?: boolean;
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

    useEffect(() => {
        if (isRecord(object)) {
            setFormData(object)
            return
        }

        if (Array.isArray(object)) {
            const emptyObject = object.reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = ''
                return acc
            }, {})
            setFormData(emptyObject)
            return
        }

        setFormData({})
    }, [object])

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
        const commonProps = {
            required: field.required && !isReadOnlyMode,
            disabled: getFieldDisabled(field),
            label: field.label ?? toLabel(field.key),
            error: fieldError,
            errorId,
        }

        if (field.type === 'select') {
            return (
                <div key={field.key} className='w-full mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                        className='w-full px-4 py-3 border-2 border-primary-1 rounded-full bg-white text-gray-700 focus:outline-none disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200'
                    >
                        <option value=''>{field.placeholder ?? commonProps.label}</option>
                        {(field.options ?? []).map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {commonProps.error && (
                        <p id={commonProps.errorId} className='mt-1 text-sm text-red-600'>
                            {commonProps.error}
                        </p>
                    )}
                </div>
            )
        }

        if (field.type === 'textarea') {
            return (
                <div key={field.key} className='w-full mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                        className='w-full px-4 py-3 border-2 border-primary-1 rounded-2xl bg-white text-gray-700 focus:outline-none disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 min-h-[120px] resize-none'
                    />
                    {commonProps.error && (
                        <p id={commonProps.errorId} className='mt-1 text-sm text-red-600'>
                            {commonProps.error}
                        </p>
                    )}
                </div>
            )
        }

        return (
            <Input
                key={field.key}
                type={field.type ?? 'text'}
                placeholder={field.placeholder ?? commonProps.label}
                required={commonProps.required}
                disabled={commonProps.disabled}
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
            className='flex flex-col w-full max-w-[980px] text-gray-900'
            onSubmit={handleSubmit}
            aria-busy={isLoading}
        >
            <div className='flex flex-col gap-4 pb-5 border-b border-gray-200 md:flex-row md:items-center md:justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-4xl font-bold tracking-wide uppercase'>
                        {mode === 'create' ? 'Cadastro' : `${tipos[mode]} ${name ?? ''}`}
                    </h1>
                    <p className='text-gray-500 font-medium'>Preencha os campos e CONFIRME.</p>
                </div>

                {hasMultipleSteps && (
                    <div className='flex items-center gap-2 text-primary-1 font-semibold flex-wrap'>
                        <span className='text-sm text-gray-600'>Etapas:</span>
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
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-colors ${isActive || isCompleted
                                        ? 'border-primary-1 bg-primary-1 text-white'
                                        : 'border-primary-1 text-primary-1'
                                        }`}
                                    aria-label={`Ir para etapa ${index + 1}`}
                                >
                                    {index + 1}
                                </button>
                            )
                        })}
                        <span className={`px-4 py-1 rounded-full border-2 text-sm ${currentStep === totalSteps - 1 ? 'border-primary-1 bg-primary-1 text-white' : 'border-primary-1 text-primary-1'}`}>
                            CONFIRMAR
                        </span>
                    </div>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-5 mt-6'>
                <div className='hidden md:flex md:col-span-4 items-start justify-center bg-gray-50 rounded-2xl p-6 border border-gray-100'>
                    <Image src={imgs[mode]} alt={tipos[mode]} className='w-full h-auto max-w-[260px]' width={260} height={260} />
                </div>
                <div className='md:col-span-8'>
                    <p className='text-sm text-gray-500 mb-2'>
                        Etapa {currentStep + 1} de {totalSteps}
                    </p>
                    <div className={`grid ${currentStepColumns} gap-3`}>
                        {currentFields.map((field) => renderField(field))}
                    </div>
                </div>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row gap-3'>
                <Button
                    variant='secondary'
                    className='!w-full !text-base !py-3 !px-6 !font-semibold'
                    onClick={onCancel}
                    type='button'
                >
                    {mode === 'view' ? 'Fechar' : 'Cancelar'}
                </Button>

                {currentStep > 0 && (
                    <Button
                        variant='secondary'
                        className='!w-full !text-base !py-3 !px-6 !font-semibold'
                        onClick={handlePreviousStep}
                        type='button'
                    >
                        Voltar
                    </Button>
                )}

                {currentStep < totalSteps - 1 ? (
                    <Button
                        className='!w-full !text-base !py-3 !px-6 !font-semibold'
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
                        className='!w-full !text-base !py-3 !px-6 !font-semibold'
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

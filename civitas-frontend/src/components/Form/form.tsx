"use client"
import React, { useState, useEffect } from 'react'
import Button from '../button'
import Input from '../Input'
import Image from 'next/image'

type FormMode = 'create' | 'edit' | 'view' | 'delete'

type FormOption = {
    value: string | number;
    label: string;
}

type ValidationFn = (value: unknown, formData: Record<string, unknown>, mode: FormMode) => string | undefined;

type FieldConfig = {
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

type FormProps = {
    camps?: string[];
    name?: string;
    object?: object | string[];
    type?: FormMode;
    fields?: FieldConfig[];
    validationSchema?: Record<string, ValidationFn>;
    hiddenFields?: string[];
    onCancel?: () => void;
    onConfirm?: (data: Record<string, unknown>) => Promise<unknown> | unknown;
}

const DEFAULT_HIDDEN_FIELDS = ['id', 'idSecretaria', 'idFornecedor', 'idOrcamento']

const toLabel = (field: string): string => field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const inferFieldType = (value: unknown): FieldConfig['type'] => {
    if (typeof value === 'number') return 'number'
    return 'text'
}

const toFieldConfig = (key: string, sourceValue?: unknown): FieldConfig => ({
    key,
    label: toLabel(key),
    placeholder: toLabel(key),
    type: inferFieldType(sourceValue),
})

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return !!value && typeof value === 'object' && !Array.isArray(value)
}

export type { FieldConfig, FormMode, ValidationFn }

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
    const [isLoading, setIsLoading] = useState(false);
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

    const mergedFields: FieldConfig[] = fields && fields.length > 0
        ? fields
        : (sourceFromObject.length > 0
            ? sourceFromObject.map((fieldKey) => toFieldConfig(fieldKey, initialData[fieldKey]))
            : sourceFromCamps.map((fieldKey) => toFieldConfig(fieldKey)))

    const fieldsToHide = hiddenFields ?? DEFAULT_HIDDEN_FIELDS
    const visibleFields = mergedFields.filter((field) => !field.hidden && !fieldsToHide.includes(field.key))

    const contagem = visibleFields.length
    const tipoColunas = contagem <= 4 ? 'grid-cols-1' : contagem <= 8 ? 'grid-cols-2' : 'grid-cols-3'

    const getDesiredSteps = () => {
        if (mode === 'delete') return 1
        if (visibleFields.length <= 4) return 1
        if (visibleFields.length <= 8) return 2
        return 3
    }

    const splitFieldsIntoSteps = (fieldsToSplit: FieldConfig[], maxSteps: number): FieldConfig[][] => {
        if (fieldsToSplit.length === 0) return [[]]

        const steps = Math.max(1, Math.min(maxSteps, fieldsToSplit.length))
        const baseSize = Math.floor(fieldsToSplit.length / steps)
        const remainder = fieldsToSplit.length % steps

        const chunks: FieldConfig[][] = []
        let start = 0

        for (let step = 0; step < steps; step++) {
            const extra = step < remainder ? 1 : 0
            const end = start + baseSize + extra
            chunks.push(fieldsToSplit.slice(start, end))
            start = end
        }

        return chunks
    }

    const fieldSteps = splitFieldsIntoSteps(visibleFields, getDesiredSteps())
    const totalSteps = fieldSteps.length
    const currentFields = fieldSteps[currentStep] ?? []

    const imgs: Record<FormMode, string> = {
        edit: '/imgsForm/image-edit.svg',
        view: '/imgsForm/image-view.svg',
        delete: '/imgsForm/image-delete.svg',
        create: '/imgsForm/image-add.svg'
    }

    const tipos: Record<FormMode, string> = {
        edit: 'Editar',
        view: 'Visualizar',
        delete: 'Deletar',
        create: 'Criar'
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

    const validateFields = (fieldsForValidation: FieldConfig[]) => {
        const nextErrors: Record<string, string> = {}
        const validatedKeys = fieldsForValidation.map((field) => field.key)

        fieldsForValidation.forEach((field) => {
            const value = formData[field.key]
            const fieldLabel = field.label ?? toLabel(field.key)
            const valueAsText = value === undefined || value === null ? '' : String(value).trim()

            if (field.required && valueAsText.length === 0 && mode !== 'view' && mode !== 'delete') {
                nextErrors[field.key] = `${fieldLabel} é obrigatório.`
                return
            }

            const fieldValidator = field.validate ?? validationSchema?.[field.key]
            if (fieldValidator) {
                const message = fieldValidator(value, formData, mode)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'view') return

        if (currentStep < totalSteps - 1) {
            handleNextStep()
            return
        }

        if (!onConfirm) return;
        if (!validateFields(visibleFields)) return

        setIsLoading(true);
        try {
            await onConfirm(formData);
        } catch (error) {
            console.error('Erro no formulário:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (fieldKey: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            [fieldKey]: value
        }));
        if (errors[fieldKey]) {
            setErrors((prev) => ({ ...prev, [fieldKey]: '' }))
        }
    };

    const goToStep = (targetStep: number) => {
        if (targetStep < 0 || targetStep >= totalSteps) return

        if (targetStep <= currentStep) {
            setCurrentStep(targetStep)
            return
        }

        const canAdvance = isReadOnlyMode || validateFields(currentFields)
        if (canAdvance) setCurrentStep(targetStep)
    }

    const handleNextStep = () => {
        if (currentStep >= totalSteps - 1) return
        const canAdvance = isReadOnlyMode || validateFields(currentFields)
        if (!canAdvance) return
        setCurrentStep((prev) => prev + 1)
    }

    const isReadOnlyMode = mode === 'view' || mode === 'delete'

    const getFieldDisabled = (field: FieldConfig) => {
        if (field.disabled) return true
        if (isReadOnlyMode) return true
        return field.readOnlyInModes?.includes(mode) ?? false
    }

    const renderField = (field: FieldConfig) => {
        const fieldValue = formData[field.key]
        const commonProps = {
            required: field.required && !isReadOnlyMode,
            disabled: getFieldDisabled(field),
            label: field.label ?? toLabel(field.key),
            error: errors[field.key],
        }

        if (field.type === 'select') {
            return (
                <div key={field.key} className='w-full mb-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {commonProps.label}
                        {commonProps.required && <span className='text-red-500 ml-1'>*</span>}
                    </label>
                    <select
                        value={String(fieldValue ?? '')}
                        required={commonProps.required}
                        disabled={commonProps.disabled}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className='w-full px-4 py-3 border-2 border-primary-1 rounded-full bg-white text-gray-700 focus:outline-none disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200'
                    >
                        <option value=''>{field.placeholder ?? commonProps.label}</option>
                        {(field.options ?? []).map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {commonProps.error && <p className='mt-1 text-sm text-red-600'>{commonProps.error}</p>}
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
                        value={String(fieldValue ?? '')}
                        required={commonProps.required}
                        disabled={commonProps.disabled}
                        placeholder={field.placeholder ?? commonProps.label}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className='w-full px-4 py-3 border-2 border-primary-1 rounded-2xl bg-white text-gray-700 focus:outline-none disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 min-h-[120px] resize-none'
                    />
                    {commonProps.error && <p className='mt-1 text-sm text-red-600'>{commonProps.error}</p>}
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
                value={String(fieldValue ?? '')}
                label={commonProps.label}
                error={commonProps.error}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
            />
        )
    }

    return (
        <form className='flex flex-col w-full max-w-[980px] text-gray-900' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4 pb-5 border-b border-gray-200 md:flex-row md:items-center md:justify-between'>
                <div className='flex flex-col'>
                    <h1 className='text-4xl font-bold tracking-wide uppercase'>{mode === 'create' ? 'Cadastro' : `${tipos[mode]} ${name ?? ''}`}</h1>
                    <p className='text-gray-500 font-medium'>Preencha os campos e CONFIRME.</p>
                </div>
                <div className='flex items-center gap-2 text-primary-1 font-semibold'>
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
            </div>

            <div className='grid grid-cols-1 md:grid-cols-12 gap-5 mt-6'>
                <div className='hidden md:flex md:col-span-4 items-start justify-center bg-gray-50 rounded-2xl p-6 border border-gray-100'>
                    <Image src={imgs[mode]} alt={tipos[mode]} className='w-full h-auto max-w-[260px]' width={260} height={260} />
                </div>
                <div className='md:col-span-8'>
                    <p className='text-sm text-gray-500 mb-2'>Etapa {currentStep + 1} de {totalSteps}</p>
                    <div className={`grid ${tipoColunas} gap-3`}>
                        {currentFields.map((field) => renderField(field))}
                    </div>
                </div>
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200 gap-3 grid grid-cols-1 md:grid-cols-2'>
                <Button variant='secondary' className='!w-full !text-base !py-3 !px-6 !font-semibold' onClick={onCancel} type='button'>
                    Cancelar
                </Button>
                {(mode === 'view' || currentStep < totalSteps - 1) ? (
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
                ) : (
                    <Button
                        className='!w-full !text-base !py-3 !px-6 !font-semibold'
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : mode === 'delete' ? 'Confirmar exclusão' : 'Confirmar'}
                    </Button>
                )}
            </div>
        </form>
    )
}

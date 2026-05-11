"use client"
import React, { useEffect, useMemo, useState } from 'react'
import FormModal from './form-modal'
import {
    getSectionOrder,
    groupFieldsBySection,
    isFieldRequired,
    isFieldValueEmpty,
    isRecord,
    toLabel,
} from './form-utils'
import type { InputMask } from '@/lib/input-mask'
import {
    DEFAULT_HIDDEN_FIELDS,
    buildDisplayFormData,
    buildNormalizedFormData,
    normalizeFieldValue,
    toFieldConfig,
} from './form-helpers'

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

type SectionDefinition = {
    title: string
    description?: string
    variant?: 'default' | 'highlight'
}

type FormFieldConfig = {
    key: string;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'number' | 'password' | 'tel' | 'date' | 'select' | 'textarea' | 'documento';
    mask?: InputMask;
    required?: boolean;
    requiredInModes?: FormMode[];
    hidden?: boolean;
    disabled?: boolean;
    accept?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    maxLength?: number;
    options?: FormOption[];
    resolveOptions?: (formData: Record<string, unknown>, mode: FormMode) => FormOption[];
    readOnlyInModes?: FormMode[];
    resolveDisabled?: (formData: Record<string, unknown>, mode: FormMode) => boolean;
    clearOnDisable?: boolean;
    clearOnInvalidOption?: boolean;
    validate?: ValidationFn;
    section?: string;
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
    extraContent?: React.ReactNode;
    onCancel?: () => void;
    onConfirm?: (data: Record<string, unknown>) => Promise<unknown> | unknown;
}

export type { FieldConfig, FormFieldConfig, FormMode, FormOption, SectionDefinition, ValidationFn }

export default function Form({
    camps,
    name,
    object,
    type = 'create',
    fields,
    validationSchema,
    hiddenFields,
    extraContent,
    onCancel,
    onConfirm,
}: FormProps) {
    const initialData = useMemo(() => (isRecord(object) ? object : {}), [object])
    const [formData, setFormData] = useState<Record<string, unknown>>(initialData)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const mode: FormMode = type
    // Resolve a lista de campos via config, keys do objeto ou camps.
    const sourceFromCamps = useMemo(
        () => camps ?? (Array.isArray(object) ? object : undefined) ?? [],
        [camps, object]
    )
    const sourceFromObject = useMemo(
        () => (isRecord(object) ? Object.keys(object) : []),
        [object]
    )
    const mergedFields: FormFieldConfig[] = useMemo(() => {
        if (fields && fields.length > 0) return fields
        if (sourceFromObject.length > 0) {
            return sourceFromObject.map((fieldKey) => toFieldConfig(fieldKey, initialData[fieldKey]))
        }
        return sourceFromCamps.map((fieldKey) => toFieldConfig(fieldKey))
    }, [fields, sourceFromObject, sourceFromCamps, initialData])

    const fieldMap = useMemo(() => {
        return new Map(mergedFields.map((field) => [field.key, field]))
    }, [mergedFields])

    const normalizedFormData = useMemo(
        () => buildNormalizedFormData(formData, mergedFields, fieldMap, 'change'),
        [fieldMap, formData, mergedFields]
    )

    const resolvedFields = useMemo(
        () =>
            mergedFields.map((field) => ({
                ...field,
                options: field.resolveOptions
                    ? field.resolveOptions(normalizedFormData, mode)
                    : field.options,
                disabled:
                    field.disabled ||
                    (field.resolveDisabled
                        ? field.resolveDisabled(normalizedFormData, mode)
                        : false),
            })),
        [mergedFields, mode, normalizedFormData]
    )

    const resolvedFieldMap = useMemo(() => {
        return new Map(resolvedFields.map((field) => [field.key, field]))
    }, [resolvedFields])

    // Sincroniza estado inicial com objeto/camps fornecidos.
    useEffect(() => {
        if (isRecord(object)) {
            setFormData(buildDisplayFormData(object, mergedFields, fieldMap))
            return
        }

        if (Array.isArray(object)) {
            const emptyObject = object.reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = ''
                return acc
            }, {})
            setFormData(buildDisplayFormData(emptyObject, mergedFields, fieldMap))
            return
        }

        setFormData({})
    }, [fieldMap, mergedFields, object])

    useEffect(() => {
        if (mode === 'view' || mode === 'delete') return

        const nextUpdates: Record<string, unknown> = {}

        resolvedFields.forEach((field) => {
            if (field.type !== 'select') return

            const currentValue = formData[field.key]
            const hasCurrentValue =
                currentValue !== undefined &&
                currentValue !== null &&
                String(currentValue).trim().length > 0

            if (!hasCurrentValue) return

            if (field.disabled && field.clearOnDisable) {
                nextUpdates[field.key] = ''
                return
            }

            if (field.clearOnInvalidOption) {
                const hasMatchingOption = (field.options ?? []).some(
                    (option) => String(option.value) === String(currentValue)
                )

                if (!hasMatchingOption) {
                    nextUpdates[field.key] = ''
                }
            }
        })

        if (Object.keys(nextUpdates).length === 0) return

        setFormData((previous) => {
            const hasAnyChange = Object.entries(nextUpdates).some(
                ([key, value]) => previous[key] !== value
            )

            return hasAnyChange ? { ...previous, ...nextUpdates } : previous
        })
    }, [formData, mode, resolvedFields])

    // Oculta identificadores implicitos, salvo override explicito.
    const fieldsToHide = hiddenFields ?? DEFAULT_HIDDEN_FIELDS
    const visibleFields = resolvedFields.filter((field) => !field.hidden && !fieldsToHide.includes(field.key))

    const isViewMode = mode === 'view'

    useEffect(() => {
        setErrors({})
    }, [object, camps, fields, type])

    // Valida apenas o subconjunto informado para manter erros localizados.
    const validateFields = (fieldsForValidation: FormFieldConfig[]) => {
        const nextErrors: Record<string, string> = {}
        const validatedKeys = fieldsForValidation.map((field) => field.key)
        const normalizedFormData = buildNormalizedFormData(formData, resolvedFields, resolvedFieldMap, 'submit')

        fieldsForValidation.forEach((field) => {
            const value = normalizedFormData[field.key]
            const fieldLabel = field.label ?? toLabel(field.key)
            if (isFieldRequired(field, mode) && isFieldValueEmpty(field, value) && !isViewMode && mode !== 'delete') {
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

    // Fluxo de submit com validacao e normalizacao final.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isViewMode || isLoading) return

        if (!onConfirm) return
        if (!validateFields(visibleFields)) return

        const normalizedFormData = buildNormalizedFormData(formData, resolvedFields, resolvedFieldMap, 'submit')

        setIsLoading(true)
        try {
            await onConfirm(normalizedFormData)
        } catch (error) {
            console.error('Erro no formulário:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Normaliza o valor no change para manter estado consistente.
    const handleInputChange = (field: FormFieldConfig, value: unknown) => {
        const normalizedValue = normalizeFieldValue(field, value, 'change', formData)

        setFormData((prev) => {
            return {
                ...prev,
                [field.key]: normalizedValue,
            }
        })

        if (errors[field.key]) {
            setErrors((prev) => ({ ...prev, [field.key]: '' }))
        }
    }

    // Agrupa campos por seção para o modal renderizar na ordem correta.
    const groupedFields = useMemo(
        () => groupFieldsBySection(visibleFields),
        [visibleFields]
    )
    const sectionOrder = useMemo(
        () => getSectionOrder(visibleFields),
        [visibleFields]
    )

    return (
        <FormModal
            groupedFields={groupedFields}
            sectionOrder={sectionOrder}
            formData={formData}
            errors={errors}
            onFieldChange={handleInputChange}
            mode={mode}
            name={name}
            isLoading={isLoading}
            isViewMode={isViewMode}
            extraContent={extraContent}
            onCancel={onCancel}
            onSubmit={handleSubmit}
        />
    )
}

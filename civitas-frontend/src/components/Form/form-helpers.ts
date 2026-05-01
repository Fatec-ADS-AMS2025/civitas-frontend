import { formatMaskedValue, normalizeMaskedValue } from '@/lib/input-mask'
import type { FormFieldConfig } from './form'
import { toLabel } from './form-utils'

const DEFAULT_HIDDEN_FIELDS = ['id']

const inferFieldType = (value: unknown): FormFieldConfig['type'] => {
    if (typeof value === 'number') return 'number'
    return 'text'
}

// Cria um config basico quando nao ha definicao explicita.
const toFieldConfig = (key: string, sourceValue?: unknown): FormFieldConfig => ({
    key,
    label: toLabel(key),
    placeholder: toLabel(key),
    type: inferFieldType(sourceValue),
})

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

const normalizeFieldValue = (
    field: FormFieldConfig | undefined,
    value: unknown,
    stage: 'change' | 'submit'
): unknown => {
    // Normaliza valores por campo para manter change vs submit consistente.
    if (!field) return value
    if (value === undefined || value === null) return value

    if (field.mask) {
        if (stage === 'change') {
            return formatMaskedValue(field.mask, value)
        }

        value = normalizeMaskedValue(field.mask, value)
    }

    // Selects devem manter o value original quando possível.
    if (field.type === 'select') {
        if (value === '') return ''
        const matchingOption = field.options?.find((option) => String(option.value) === String(value))
        return matchingOption ? matchingOption.value : value
    }

    // Numbers só são convertidos no submit.
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

const buildDisplayFormData = (
    source: Record<string, unknown>,
    mergedFields: FormFieldConfig[],
    fieldMap: Map<string, FormFieldConfig>
): Record<string, unknown> => {
    // Aplica masks e formatadores no estado inicial da UI.
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

const buildNormalizedFormData = (
    source: Record<string, unknown>,
    mergedFields: FormFieldConfig[],
    fieldMap: Map<string, FormFieldConfig>,
    stage: 'change' | 'submit'
): Record<string, unknown> => {
    // Converte UI para valores prontos no submit (numbers, selects, masks).
    const keysToNormalize = mergedFields.length > 0
        ? mergedFields.map((field) => field.key)
        : Object.keys(source)

    const normalizedEntries = keysToNormalize.map((key) => {
        const field = fieldMap.get(key)
        return [key, normalizeFieldValue(field, source[key], stage)] as const
    })

    return Object.fromEntries(normalizedEntries)
}

export {
    DEFAULT_HIDDEN_FIELDS,
    buildDisplayFormData,
    buildNormalizedFormData,
    normalizeFieldValue,
    toFieldConfig,
}

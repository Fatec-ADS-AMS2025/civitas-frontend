# 📚 Documentação do Checkbox

## Uso Básico

```tsx
import { Checkbox } from '@/components/checkbox';

// Checkbox simples
<Checkbox label="Lembrar-me" />

// Checkbox controlado
<Checkbox 
  label="Aceitar termos"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
/>

// Estado intermediário
<Checkbox 
  label="Selecionar Todos"
  indeterminate={someChecked}
  onChange={handleSelectAll}
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `label` | `string` | - | Texto do label |
| `checked` | `boolean` | - | Estado controlado |
| `indeterminate` | `boolean` | `false` | Estado intermediário |
| `disabled` | `boolean` | `false` | Desabilita o checkbox |
| `onChange` | `(e) => void` | - | Callback de mudança |

## Grupo de Checkboxes

```tsx
import { CheckboxGroup } from '@/components/checkbox';

<CheckboxGroup
  options={[
    { value: 'opt1', label: 'Opção 1' },
    { value: 'opt2', label: 'Opção 2', disabled: true },
  ]}
  value={selected}
  onChange={setSelected}
/>
```
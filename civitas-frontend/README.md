# 📚 Documentação do Checkbox

## Uso Básico

### Checkbox Simples
```tsx
import { Checkbox } from '@/components/checkbox';

<Checkbox label="Lembrar-me" />

/* Checkbox Controlado */
import { useState } from 'react';
import { Checkbox } from '@/components/checkbox';

export default function Example() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Checkbox 
      label="Aceitar termos"
      checked={accepted}
      onChange={(e) => setAccepted(e.target.checked)}
    />
  );
}

/*Estado Intermediário*/
const [allChecked, setAllChecked] = useState(false);
const [someChecked, setSomeChecked] = useState(true);

<Checkbox 
  label="Selecionar Todos"
  checked={allChecked}
  indeterminate={someChecked}
  onChange={(e) => setAllChecked(e.target.checked)}
/>

/*Grupo de Checkboxes*/
import { CheckboxGroup } from '@/components/checkbox';
import { useState } from 'react';

export default function Example() {
  const [selected, setSelected] = useState<string[]>(['option1']);

  return (
    <CheckboxGroup
      options={[
        { value: 'option1', label: 'Opção 1' },
        { value: 'option2', label: 'Opção 2' },
        { value: 'option3', label: 'Opção 3' },
        { value: 'option4', label: 'Opção 4 (Desabilitada)', disabled: true },
      ]}
      value={selected}
      onChange={setSelected}
      name="example"
    />
  );
}
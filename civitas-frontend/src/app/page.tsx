'use client';

import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@/components/checkbox';

export default function Home() {
  const [isChecked, setIsChecked] = useState(false);
  const [subItems, setSubItems] = useState({ item1: false, item2: false, item3: false });
  const [groupSelected, setGroupSelected] = useState<string[]>(['option1']);

  const allChecked = Object.values(subItems).every(Boolean);
  const someChecked = Object.values(subItems).some(Boolean) && !allChecked;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-[#004C57]">Componente Checkbox</h1>

        {/* Básico */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#004C57] mb-4">Checkbox Básico</h2>
          <Checkbox 
            label="Concordo com os termos"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <p className="mt-3 text-sm text-gray-600">Estado: {isChecked ? '✓ Marcado' : '○ Desmarcado'}</p>
        </section>

        {/* Estados */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#004C57] mb-4">Estados</h2>
          <div className="space-y-3">
            <Checkbox label="Ativo" />
            <Checkbox label="Marcado" defaultChecked />
            <Checkbox label="Desabilitado" disabled />
            <Checkbox label="Desabilitado (marcado)" disabled defaultChecked />
          </div>
        </section>

        {/* Intermediário */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#004C57] mb-4">Estado Intermediário</h2>
          <Checkbox
            label="Selecionar Todos"
            checked={allChecked}
            indeterminate={someChecked}
            onChange={(e) => {
              const val = e.target.checked;
              setSubItems({ item1: val, item2: val, item3: val });
            }}
          />
          <div className="ml-8 mt-3 space-y-2 border-l-2 border-[#58AFAE] pl-4">
            {Object.entries(subItems).map(([key, checked]) => (
              <Checkbox
                key={key}
                label={`Item ${key.replace('item', '')}`}
                checked={checked}
                onChange={(e) => setSubItems(p => ({ ...p, [key]: e.target.checked }))}
              />
            ))}
          </div>
        </section>

        {/* Grupo */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#004C57] mb-4">Grupo de Checkboxes</h2>
          <CheckboxGroup
            options={[
              { value: 'option1', label: 'Opção01' },
              { value: 'option2', label: 'Opção02' },
              { value: 'option3', label: 'opção03' },
              { value: 'option4', label: 'Opção04', disabled: true },
            ]}
            value={groupSelected}
            onChange={setGroupSelected}
            name="notifications"
          />
          <p className="mt-4 text-sm text-gray-600">Selecionados: {groupSelected.join(', ') || 'Nenhum'}</p>
        </section>
      </div>
    </main>
  );
}
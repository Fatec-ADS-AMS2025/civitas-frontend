'use client';

import { useState } from 'react';
import { Checkbox, CheckboxGroup } from '@/components/checkbox';

export default function Home() {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [groupSelected, setGroupSelected] = useState<string[]>(['option1']);

  // Simular estado intermediário para o exemplo "Selecionar Tudo"
  const [subItems, setSubItems] = useState({
    item1: false,
    item2: false,
    item3: false,
  });

  const allChecked = Object.values(subItems).every(Boolean);
  const someChecked = Object.values(subItems).some(Boolean) && !allChecked;

  const handleParentChange = (isChecked: boolean) => {
    setSubItems({
      item1: isChecked,
      item2: isChecked,
      item3: isChecked,
    });
  };

  const handleSubItemChange = (key: keyof typeof subItems, value: boolean) => {
    setSubItems((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Bloco de teste visual rápido */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Teste Visual Rápido</h3>
          <div className="flex gap-8">
            <div>
              <p className="text-sm mb-2">Desmarcado:</p>
              <Checkbox label="Desmarcado" checked={false} onChange={() => {}} />
            </div>
            <div>
              <p className="text-sm mb-2">Marcado:</p>
              <Checkbox label="Marcado" checked={true} onChange={() => {}} />
            </div>
            <div>
              <p className="text-sm mb-2">Intermediário:</p>
              <Checkbox label="Intermediário" indeterminate={true} />
            </div>
          </div>
        </div>

        {/* Exemplos gerais */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Exemplos de Checkbox
          </h2>

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            {/* Exemplo básico */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Checkbox Básico
              </h3>
              <Checkbox label="Lembrar-me" />
            </div>

            {/* Checkbox controlado */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Checkbox Controlado
              </h3>
              <Checkbox
                label="Lembrar-me"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <p className="mt-2 text-sm text-gray-600">
                Estado atual: {checked ? 'Marcado' : 'Desmarcado'}
              </p>
            </div>

            {/* Estado Intermediário manual */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Estado Intermediário (Indeterminate)
              </h3>
              <Checkbox
                label="Estado Intermediário Manual"
                indeterminate={indeterminate}
                onChange={() => setIndeterminate(!indeterminate)}
              />
              <button
                onClick={() => setIndeterminate(!indeterminate)}
                className="mt-2 px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 text-sm"
              >
                Alternar Estado
              </button>
            </div>

            {/* Exemplo prático: Selecionar Tudo */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Exemplo Prático: Selecionar Tudo
              </h3>
              <div className="space-y-3">
                <Checkbox
                  label="Selecionar Todos"
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={(e) => handleParentChange(e.target.checked)}
                />
                <div className="ml-8 space-y-2">
                  <Checkbox
                    label="Item 1"
                    checked={subItems.item1}
                    onChange={(e) => handleSubItemChange('item1', e.target.checked)}
                  />
                  <Checkbox
                    label="Item 2"
                    checked={subItems.item2}
                    onChange={(e) => handleSubItemChange('item2', e.target.checked)}
                  />
                  <Checkbox
                    label="Item 3"
                    checked={subItems.item3}
                    onChange={(e) => handleSubItemChange('item3', e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes desabilitados */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Checkbox Desabilitado
              </h3>
              <div className="space-y-3">
                <Checkbox label="Desabilitado (desmarcado)" disabled />
                <Checkbox
                  label="Desabilitado (marcado)"
                  disabled
                  defaultChecked
                />
                <Checkbox
                  label="Desabilitado (intermediário)"
                  disabled
                  indeterminate
                />
              </div>
            </div>

            {/* Checkbox sem label */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                Checkbox sem Label
              </h3>
              <Checkbox />
            </div>
          </div>
        </section>

        {/* Grupo de checkboxes */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Grupo de Checkboxes
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <CheckboxGroup
              options={[
                { value: 'option1', label: 'Opção 1' },
                { value: 'option2', label: 'Opção 2' },
                { value: 'option3', label: 'Opção 3' },
                { value: 'option4', label: 'Opção 4 (Desabilitada)', disabled: true },
              ]}
              value={groupSelected}
              onChange={setGroupSelected}
            />
            <p className="mt-4 text-sm text-gray-600">
              Selecionados: {groupSelected.join(', ') || 'Nenhum'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
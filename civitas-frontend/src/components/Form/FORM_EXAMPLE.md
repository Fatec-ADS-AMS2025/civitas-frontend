# Exemplo de uso do formulario com secoes

## Estrutura basica

O formulario generico suporta agrupamento de campos em secoes. A ordem obrigatoria e:

1. Campos sem section no topo
2. Campos com section no meio (em grupos)
3. Campos finais sem section (ex.: situacao)

Evite secoes com apenas 1 campo (exceto "Status").

## Nomes padrao de secoes

- Endereco
- Contato
- Documentos
- Acesso
- Relacionamentos
- Classificacao
- Consumo
- Datas
- Configuracao
- Vinculacao
- Status

## Exemplo completo

```typescript
import Form, { type FieldConfig as ModalFieldConfig } from "@/components/Form/form";

const fields: ModalFieldConfig[] = [
  { key: "nome", label: "Nome", required: true },
  { key: "email", label: "E-mail", type: "email", required: true },
  { key: "cpf", label: "CPF", mask: "cpf", required: true, section: "Documentos" },
  { key: "rg", label: "RG", required: true, section: "Documentos" },
  { key: "logradouro", label: "Logradouro", required: true, section: "Endereco" },
  { key: "numero", label: "Numero", required: true, section: "Endereco" },
  { key: "bairro", label: "Bairro", required: true, section: "Endereco" },
  { key: "cep", label: "CEP", mask: "cep", required: true, section: "Endereco" },
  { key: "cidade", label: "Cidade", required: true, section: "Endereco" },
  { key: "estado", label: "Estado", required: true, section: "Endereco" },
  { key: "senha", label: "Senha", type: "password", required: true, section: "Acesso" },
  { key: "tipoUsuario", label: "Tipo", type: "select", required: true, section: "Acesso" },
  { key: "situacao", label: "Situacao", type: "select", required: true, section: "Status" },
];

export default function MyPage() {
  const handleConfirm = async (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <Form
      fields={fields}
      type="create"
      name="Usuario"
      onConfirm={handleConfirm}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
```

## Comportamento esperado

- Campos sem section ficam no topo (sem container de secao)
- Secoes nomeadas aparecem com titulo, borda, padding e espacamento
- Grid responsivo com auto-fit e min de 250px
- Scroll interno com max-height de 80vh
- Validacao, mask e modos view/delete continuam funcionando

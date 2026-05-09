# Evidencias - Sprint 16 Documento em Cadastro de Despesa

## Sprint Results

Foi entregue o campo reutilizavel `DocumentoField` no formulario generico, agora com upload de arquivo local, conversao para Base64 cru e exibicao de nome, tipo, tamanho e status de carregamento. O cadastro de despesa passou a exigir documento e fluxo na criacao, salvando primeiro o documento em `/api/documentos` e depois a despesa em `/api/despesas`, mantendo o payload da despesa sem o campo `documento`.

Validacao manual realizada em ambiente local:
- Backend: `http://localhost:5210`
- Frontend: `http://localhost:3000`
- Tela: `http://localhost:3000/dashboard/despesas`
- Usuario: `admin@civitas.dev`
- Documento criado: `20260721`
- Despesa criada: codigo `716801`, registro `#006`

## Pull Request

### Titulo

Sprint 16 - Implementar upload de documento no cadastro de despesa

### Objetivo

Implementar o campo de documento no formulario generico e integrar o cadastro de despesas ao fluxo exigido pela API: upload local do arquivo, conversao para Base64, criacao do documento em `/api/documentos` e criacao da despesa em `/api/despesas`.

### Criterios de Aceite

- [x] Campo de documento implementado no formulario generico.
- [x] Usuario consegue selecionar/anexar arquivo local do computador.
- [x] Dados basicos do documento sao exibidos: nome, tipo, tamanho e status.
- [x] Estrutura do objeto documento e montada no frontend.
- [x] Payload de documento segue o formato esperado pela API.
- [x] Cadastro de despesa integrado ao documento.
- [x] Despesa salva apos documento criado.
- [x] Feedback visual para loading, erro, validacao e sucesso.
- [x] Campo respeita dark mode, alto contraste e responsividade basica.
- [x] Form generico segue tratando documento como campo normal sem quebrar demais formularios.

### Alteracoes Realizadas

- Nova funcionalidade: upload local em `DocumentoField`.
- Nova funcionalidade: service/model de `FluxoDTO`.
- Refatoracao: normalizacao e validacao de campo objeto no form generico.
- Integracao: despesas criam documento antes de enviar o payload aceito por `DespesaDTO`.
- Tratamento de erros: validacao sem documento, erro de leitura/conversao e mensagens da API.

### Evidencias de Testes

- `01-despesas-listagem-dark.png`: tela de despesas autenticada em modo escuro.
- `02-validacao-sem-documento.png`: validacao bloqueando cadastro sem documento.
- `03-documento-inicial-convertido-base64.png`: primeiro arquivo local convertido.
- `04-documento-trocado-convertido-base64.png`: troca do arquivo e substituicao do estado anterior.
- `05-despesa-cadastrada-listagem.png`: toast de sucesso apos cadastro.
- `06-alto-contraste.png`: tela em alto contraste.
- `07-responsivo-mobile.png`: responsividade basica em viewport mobile.
- `08-despesa-cadastrada-registro-filtrado.png`: registro criado visivel na listagem.
- `payloads-capturados.json`: payloads reais capturados pelo navegador.
- `respostas-api-capturadas.json`: respostas reais dos endpoints.
- `validacao-fluxo-ui.json`: resumo estruturado das validacoes.

### Relacionado

Task: Sprint 16 - Frontend - Implementar Campo Selecionar Documento no Form Generico e Atualizar Cadastro de Despesa

### Observacoes

O backend atual nao possui rollback transacional entre `/api/documentos` e `/api/despesas`; se a despesa falhar apos criar documento, a UI mostra o erro retornado pela API. O payload de despesa permanece sem `documento`, conforme contrato atual do `DespesaDTO`.

## Payloads Capturados

Documento:

```json
{
  "idDocumento": 0,
  "digitalizacao": "RG9jdW1lbnRvIEZJTkFMIHBhcmEgdmFsaWRhY2FvIENpdml0YXMgMjAyNjA3MjEKRXN0ZSBhcnF1aXZvIHN1YnN0aXR1aSBhIHByaW1laXJhIHNlbGVjYW8uCg==",
  "numeroDocumento": 20260721,
  "idFornecedor": 1,
  "idFluxo": 2
}
```

Despesa:

```json
{
  "id": 0,
  "numeroDocumento": "20260721",
  "codigo": "716801",
  "dataEmissao": "2026-05-07",
  "valorPrevisto": 15,
  "valorPago": 0,
  "consumoPrevisto": 15,
  "consumoReal": 0,
  "dataVencimento": "2026-05-20",
  "status": 1,
  "idUsuario": 1,
  "idUnidadeConsumidora": 1
}
```

## Validacoes

- `npm run build`: executado com sucesso.
- `dotnet test`: executado, mas falha por pendencia existente no backend (`PendingModelChangesWarning` durante `MigrateAsync` nos testes).
- Fluxo UI completo: executado com Puppeteer.
- API confirmou persistencia do documento `idDocumento: 4` e da despesa `id: 6`.

# AGENTS.md - Guia Operacional de IA (Frontend Civitas)

## 1. Objetivo
Este arquivo define como qualquer IA deve atuar neste frontend.
A prioridade e:
1. Manter a logica existente funcionando (sem regressao).
2. Entregar codigo de facil manutencao.
3. Respeitar os contratos de rota (front e back) antes de alterar qualquer fluxo.
4. Codar com postura de dev Senior: previsivel, seguro, legivel e testavel.

## 2. Regras obrigatorias de engenharia (Senior)
- Nunca quebrar fluxos existentes para "melhorar" estilo.
- Sempre evoluir com mudancas pequenas e reversiveis.
- Evitar duplicacao: preferir reutilizar `src/hooks/generic.ts`, `src/global/formPayload.ts`, `src/global/situacao.ts` e componentes compartilhados.
- Manter nomes semanticos e consistentes com o dominio.
- Tratar erros de API com mensagem clara para usuario e log tecnico para dev.
- Preservar compatibilidade de payload com o backend; nunca inventar campo sem checar contrato.
- Antes de qualquer PR, validar:
  - tipagem
  - fluxo CRUD completo da tela alterada
  - filtros/pesquisa
  - estados de loading/erro/vazio

## 3. Logica central do GenericService (fonte de verdade)
Arquivo: `src/hooks/generic.ts`

### 3.1 Contratos
- `BASE_URL = NEXT_PUBLIC_API_URL || http://localhost:5210/api`
- Envelope padrao esperado: `{ code?, message?, data? }`.
- Pode receber:
  - lista direta
  - lista paginada em `data.items`
  - item unico em `data`

### 3.2 Metodos padrao
- `getAll(query)` -> `GET /{endpoint}?page&size&sortBy&sortDirection`
- `getById(id)` -> `GET /{endpoint}/{id}`
- `create(data)` -> `POST /{endpoint}`
- `update(id, data)` -> `PUT /{endpoint}/{id}`
- `delete(id)` -> `DELETE /{endpoint}/{id}`
- `patch(id, data)` -> `PATCH /{endpoint}/{id}`
- `alterarSituacao(id)` -> `PATCH /{endpoint}/situacao/{id}`

### 3.3 Regras de uso
- Sempre preferir os services em `src/hooks/*` em vez de `fetch` solto na pagina.
- Novos modulos devem herdar de `GenericService<T>` sempre que o contrato for CRUD padrao.
- Se endpoint fugir do CRUD (ex: busca por cpf/nome), implementar metodo especifico no service da entidade.

## 4. Regras de tabela/listagem (importante)
Arquivo: `src/components/Table/table.tsx`
- A coluna de status/situacao e opcional.
- Status so deve aparecer se vier em `columns` (`status`, `situacao`, `statusLabel`, `situacaoLabel`).
- Quando houver coluna de status, manter badge visual (Ativo/Inativo).
- Nao adicionar coluna de status "forcada" por fora de `columns`.

## 5. Rotas de pagina (Frontend App Router)
| Rota Front | Arquivo | Objetivo | Campos/Interacoes principais |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Home inicial | Navegacao principal |
| `/login` | `src/app/login/page.jsx` | Login | email/credenciais (UI) |
| `/dashboard` | `src/app/dashboard/page.tsx` | Hub dashboard | cards/resumo |
| `/dashboard/usuarios` | `src/app/dashboard/usuarios/page.tsx` | CRUD de usuarios | nome, cpf, rg, matricula, endereco, email, senha, tipoUsuario, situacao |
| `/dashboard/instituicoes` | `src/app/dashboard/instituicoes/page.tsx` | CRUD de instituicoes | nome, razao social, cnpj, endereco, contato, idTipoInstituicao, idSecretaria, situacao |
| `/dashboard/secretaria` | `src/app/dashboard/secretaria/page.tsx` | CRUD de secretarias | descricao, nome, razao social, cnpj, endereco, contato, situacao |
| `/dashboard/fornecedor` | `src/app/dashboard/fornecedor/page.tsx` | CRUD de fornecedores | nomeFantasia, nome/razao, cnpj, endereco, contato, situacao |
| `/dashboard/orcamentos` | `src/app/dashboard/orcamentos/page.tsx` | CRUD de orcamentos | anoOrcamento, valorOrcamento, idInstituicao, idTipoDespesa |
| `/dashboard/despesas` | `src/app/dashboard/despesas/page.tsx` | Tela local de despesas (UI/estado local) | descricao, categoria, valor, data, solicitaUc, situacao |
| `/dashboard/financeiro` | `src/app/dashboard/financeiro/page.tsx` | Suite financeira (hook agregador) | filtros de periodo/status/instituicao + CRUD financeiro |

## 6. Catalogo de rotas Backend (o que pede e o que retorna)
Padrao de retorno: `{ code, message, data }`.

### 6.1 Usuarios (`/api/usuarios`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/usuarios` | Query opcional `page,size,sortBy,sortDirection` | `data: UsuarioDTO[]` (ou paginado) |
| GET `/api/usuarios/cpf` | Query `cpf` | `data: UsuarioDTO[] \| null` |
| GET `/api/usuarios/{id}` | `id` | `data: UsuarioDTO \| null` |
| POST `/api/usuarios` | Body `UsuarioDTO` | `data: UsuarioDTO` criado |
| PUT `/api/usuarios/{id}` | `id` + Body `UsuarioDTO` | `data: UsuarioDTO` atualizado |
| DELETE `/api/usuarios/{id}` | `id` | `data: null` |
| PATCH `/api/usuarios/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.2 Instituicoes (`/api/instituicoes`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/instituicoes` | Query opcional | `data: InstituicaoDTO[]` |
| GET `/api/instituicoes/{id}` | `id` | `data: InstituicaoDTO \| null` |
| GET `/api/instituicoes/nome` | Query `name` | `data: InstituicaoDTO[] \| null` |
| POST `/api/instituicoes` | Body `InstituicaoDTO` | `data: InstituicaoDTO` criado |
| PUT `/api/instituicoes/{id}` | `id` + Body `InstituicaoDTO` | `data: InstituicaoDTO` atualizado |
| PATCH `/api/instituicoes/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.3 Secretarias (`/api/secretarias`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/secretarias` | Query opcional | `data: SecretariaDTO[]` |
| GET `/api/secretarias/{id}` | `id` | `data: SecretariaDTO \| null` |
| POST `/api/secretarias` | Body `SecretariaDTO` | `data: SecretariaDTO` criado |
| PUT `/api/secretarias/{id}` | `id` + Body `SecretariaDTO` | `data: SecretariaDTO` atualizado |
| DELETE `/api/secretarias/{id}` | `id` | `data: null` |
| PATCH `/api/secretarias/situacao/{id}` | `id` | `data: { idSecretaria/id, situacao }` |

### 6.4 Fornecedores (`/api/fornecedores`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/fornecedores` | Query opcional | `data: FornecedorDTO[]` |
| GET `/api/fornecedores/{id}` | `id` | `data: FornecedorDTO \| null` |
| POST `/api/fornecedores` | Body `FornecedorDTO` | `data: FornecedorDTO` criado |
| PUT `/api/fornecedores/{id}` | `id` + Body `FornecedorDTO` | `data: FornecedorDTO` atualizado |
| PATCH `/api/fornecedores/situacao/{id}` | `id` | `data: { idFornecedor/id, situacao }` |

### 6.5 Orcamentos (`/api/orcamentos`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/orcamentos` | Query opcional | `data: OrcamentoDTO[]` |
| GET `/api/orcamentos/{id}` | `id` | `data: OrcamentoDTO \| null` |
| POST `/api/orcamentos` | Body `OrcamentoDTO` | `data: OrcamentoDTO` criado |
| PUT `/api/orcamentos/{id}` | `id` + Body `OrcamentoDTO` | `data: OrcamentoDTO` atualizado |
| DELETE `/api/orcamentos/{id}` | `id` | `data: null` |

### 6.6 Despesas (`/api/despesas`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/despesas` | Query opcional | `data: DespesaDTO[]` |
| GET `/api/despesas/{id}` | `id` | `data: DespesaDTO \| null` |
| POST `/api/despesas` | Body `DespesaDTO` | `data: DespesaDTO` criado |
| PUT `/api/despesas/{id}` | `id` + Body `DespesaDTO` | `data: DespesaDTO` atualizado |
| PATCH `/api/despesas/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.7 Tipo de despesa (`/api/tipo-despesa`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/tipo-despesa` | Query opcional | `data: TipoDespesaDTO[]` |
| GET `/api/tipo-despesa/{id}` | `id` | `data: TipoDespesaDTO \| null` |
| POST `/api/tipo-despesa` | Body `TipoDespesaDTO` | `data: TipoDespesaDTO` criado |
| PUT `/api/tipo-despesa/{id}` | `id` + Body `TipoDespesaDTO` | `data: TipoDespesaDTO` atualizado |
| PATCH `/api/tipo-despesa/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.8 Tipo de instituicao (`/api/tipo-instituicao`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/tipo-instituicao` | Query opcional | `data: TipoInstituicaoDTO[]` |
| GET `/api/tipo-instituicao/{id}` | `id` | `data: TipoInstituicaoDTO \| null` |
| POST `/api/tipo-instituicao` | Body `TipoInstituicaoDTO` | `data: TipoInstituicaoDTO` criado |
| PUT `/api/tipo-instituicao/{id}` | `id` + Body `TipoInstituicaoDTO` | `data: TipoInstituicaoDTO` atualizado |
| PATCH `/api/tipo-instituicao/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.9 Unidade de medida (`/api/unidade-medida`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/unidade-medida` | Query opcional | `data: UnidadeMedidaDTO[]` |
| GET `/api/unidade-medida/{id}` | `id` | `data: UnidadeMedidaDTO \| null` |
| POST `/api/unidade-medida` | Body `UnidadeMedidaDTO` | `data: UnidadeMedidaDTO` criado |
| PUT `/api/unidade-medida/{id}` | `id` + Body `UnidadeMedidaDTO` | `data: UnidadeMedidaDTO` atualizado |
| PATCH `/api/unidade-medida/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.10 Fluxos (`/api/fluxos`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/fluxos` | Query opcional | `data: FluxoDTO[]` |
| GET `/api/fluxos/{id}` | `id` | `data: FluxoDTO \| null` |
| POST `/api/fluxos` | Body `FluxoDTO` | `data: FluxoDTO` criado |
| PUT `/api/fluxos/{id}` | `id` + Body `FluxoDTO` | `data: FluxoDTO` atualizado |
| PATCH `/api/fluxos/status/{id}` | `id` + Body `Status` | `data: { idFluxo, statusAtual }` |

### 6.11 Auditorias (`/api/auditorias`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/auditorias` | Query opcional | `data: AuditoriaDTO[]` |
| GET `/api/auditorias/{id}` | `id` | `data: AuditoriaDTO \| null` |
| GET `/api/auditorias/usuario/{usuarioId}` | `usuarioId` | `data: AuditoriaDTO[] \| null` |
| GET `/api/auditorias/entidade` | Query `nomeEntidade` | `data: AuditoriaDTO[] \| null` |
| GET `/api/auditorias/operacao` | Query `operacao` | `data: AuditoriaDTO[] \| null` |
| POST `/api/auditorias` | Body `AuditoriaDTO` | `data: AuditoriaDTO` criado |
| PUT `/api/auditorias/{id}` | `id` + Body `AuditoriaDTO` | `data: AuditoriaDTO` atualizado |
| DELETE `/api/auditorias/{id}` | `id` | `data: null` |
| PATCH `/api/auditorias/situacao/{id}` | `id` | `data: { id, situacao }` |

### 6.12 Documentos (`/api/documentos`)
| Metodo/Rota | O que pede | O que retorna |
| --- | --- | --- |
| GET `/api/documentos` | Query opcional | `data: DocumentoDTO[]` |
| GET `/api/documentos/{id}` | `id` | `data: DocumentoDTO \| null` |
| POST `/api/documentos` | Body `DocumentoDTO` | `data: DocumentoDTO` criado |
| PUT `/api/documentos/{id}` | `id` + Body `DocumentoDTO` | `data: DocumentoDTO` atualizado |
| DELETE `/api/documentos/{id}` | `id` | `data: null` |

## 7. Campos por DTO (referencia rapida)
- `UsuarioDTO`: `id, cpf, nome, rg, logradouro, numero, matricula, cidade, estado, cep, bairro, email, senha, situacao, tipoUsuario`
- `InstituicaoDTO`: `id, nome, nomeRazaoSocial, cnpj, logradouro, numero, bairro, cep, telefone, email, cidade, estado, situacao, idTipoInstituicao, idSecretaria`
- `SecretariaDTO`: `idSecretaria, situacao, descricao, cnpj, nome, logradouro, numero, bairro, cep, nomeRazaoSocial, telefone, email, cidade, estado`
- `FornecedorDTO`: `idFornecedor, nomeFantasia, situacao, cnpj, nome, logradouro, numero, bairro, cep, telefone, email, cidade, estado`
- `OrcamentoDTO`: `idOrcamento, anoOrcamento/ano, valorOrcamento/valor, idInstituicao, idTipoDespesa, situacao`
- `DespesaDTO`: `id, numeroDocumento, uc, dataEmicao, consumoPrevisto, dataVencimento, situacao, idTipoDespesa, idOrcamento, idInstituicao, idFornecedor, idUsuario` (+ legados `descricao, valor, data, categoria`)
- `TipoDespesaDTO`: `id, descricao, situacao`
- `TipoInstituicaoDTO`: `id, descricao, situacao`

## 8. Checklist obrigatorio antes de alterar qualquer tela
1. Conferir rota frontend da pagina e service/hook associado.
2. Conferir contrato de request/response da rota backend.
3. Garantir que payload enviado e o esperado pelo DTO.
4. Preservar fluxo de erro/loading/estado vazio.
5. Validar impacto em busca/filtro/form/modal/tabela.
6. Se mudar componente compartilhado, revisar todas as paginas consumidoras.

## 9. Estilo de entrega esperado da IA
- Atuar como dev Senior.
- Explicar trade-offs quando houver mais de um caminho.
- Evitar "refatoracao por refatoracao".
- Priorizar robustez, legibilidade e manutencao de longo prazo.
- Quando faltar contexto, buscar no codigo antes de supor.

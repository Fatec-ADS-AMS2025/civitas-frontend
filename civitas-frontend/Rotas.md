# Rotas da API

Todas as rotas retornam um objeto **Response** com as chaves `code`, `message` e `data`.

## Interfaces e campos requeridos (Body/Query)

### PaginationQuery (Query)
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `page` | `int` | Não | Padrão: 1 |
| `size` | `int` | Não | Padrão: 20, máximo: 100 |
| `sortBy` | `string` | Não | Nome do campo para ordenação |
| `sortDirection` | `string` | Não | `asc`/`desc` |

### TipoDespesaDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `descricao` | `string` | Não informado |  |
| `solicitaUc` | `SolicitaUc` | Não informado | Enum `Sim`/`Não` |
| `situacao` | `Situacao` | Não informado | Enum `ATIVO`/`INATIVO` |
| `idUnidadeMedida` | `int` | Não informado |  |

### DespesaDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `numeroDocumento` | `string` | Sim |  |
| `uc` | `string` | Condicional | Obrigatório se o tipo de despesa exigir UC |
| `dataEmicao` | `string` | Não informado | Recomendado ISO 8601 |
| `consumoPrevisto` | `double` | Não informado |  |
| `dataVencimento` | `DateOnly` | Sim |  |
| `situacao` | `Situacao` | Não informado |  |
| `idTipoDespesa` | `int` | Sim |  |
| `idOrcamento` | `int` | Sim |  |
| `idInstituicao` | `int` | Não informado |  |
| `idFornecedor` | `int` | Não informado |  |
| `idUsuario` | `int` | Não informado |  |

### AuditoriaDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | Não |  |
| `data` | `string` | Sim |  |
| `hora` | `string` | Sim |  |
| `operacao` | `string` | Sim | Máx. 100 |
| `nomeEntidade` | `string` | Sim | Máx. 100 |
| `valoresAtingidos` | `string` | Não | Máx. 500 |
| `novosValores` | `string` | Não | Máx. 500 |
| `situacao` | `Situacao` | Sim |  |
| `usuarioId` | `int` | Sim |  |
| `usuario` | `UsuarioDTO` | Não | Preenchido em consultas |

### OrcamentoDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `idOrcamento` | `int` | PUT | Ignorado no POST |
| `anoOrcamento` | `int` | Sim | Deve ser > 0 |
| `valorOrcamento` | `double` | Sim | Deve ser > 0 |
| `idInstituicao` | `int` | Sim |  |
| `idTipoDespesa` | `int` | Sim |  |

### SecretariaDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `idSecretaria` | `int` | PUT | Ignorado no POST |
| `situacao` | `Situacao` | Não informado |  |
| `descricao` | `string` | Não informado |  |
| `cnpj` | `string` | Sim |  |
| `nome` | `string` | Não informado |  |
| `logradouro` | `string` | Não informado |  |
| `numero` | `string` | Não informado |  |
| `bairro` | `string` | Não informado |  |
| `cep` | `string` | Não informado |  |
| `nomeRazaoSocial` | `string` | Não informado |  |
| `email` | `string` | Não informado | Validar formato |
| `telefone` | `string` | Não informado |  |
| `cidade` | `string` | Não informado |  |
| `estado` | `string` | Não informado |  |

### DocumentoDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `idDocumento` | `int` | Não | Ignorado no POST |
| `digitalizacao` | `byte[]` | Sim |  |
| `numeroDocumento` | `int` | Não informado |  |
| `idFornecedor` | `int` | Sim |  |
| `idFluxo` | `int` | Sim |  |

### FornecedorDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `idFornecedor` | `int` | PUT | Ignorado no POST |
| `nomeFantasia` | `string` | Não informado |  |
| `situacao` | `Situacao` | Não informado |  |
| `cnpj` | `string` | Sim |  |
| `nome` | `string` | Não informado |  |
| `logradouro` | `string` | Não informado |  |
| `numero` | `string` | Não informado |  |
| `bairro` | `string` | Não informado |  |
| `cep` | `string` | Não informado |  |
| `telefone` | `string` | Não informado |  |
| `email` | `string` | Não informado |  |
| `cidade` | `string` | Não informado |  |
| `estado` | `string` | Não informado |  |

### UnidadeMedidaDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `descricao` | `string` | Sim |  |
| `abreviatura` | `string` | Sim |  |
| `situacao` | `Situacao` | Não informado |  |

### InstituicaoDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `cnpj` | `string` | Sim |  |
| `nome` | `string` | Não informado |  |
| `logradouro` | `string` | Não informado |  |
| `numero` | `string` | Não informado |  |
| `bairro` | `string` | Não informado |  |
| `cep` | `string` | Não informado |  |
| `nomeRazaoSocial` | `string` | Não informado |  |
| `telefone` | `string` | Não informado |  |
| `email` | `string` | Sim |  |
| `cidade` | `string` | Não informado |  |
| `estado` | `string` | Não informado |  |
| `situacao` | `Situacao` | Não informado |  |
| `idTipoInstituicao` | `int` | Sim |  |
| `idSecretaria` | `int` | Sim |  |

### UsuarioDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `cpf` | `string` | Sim |  |
| `nome` | `string` | Sim |  |
| `rg` | `string` | Não informado |  |
| `logradouro` | `string` | Não informado |  |
| `numero` | `string` | Não informado |  |
| `cidade` | `string` | Não informado |  |
| `estado` | `string` | Não informado |  |
| `cep` | `string` | Não informado |  |
| `bairro` | `string` | Não informado |  |
| `email` | `string` | Sim |  |
| `senha` | `string` | Não informado |  |
| `matricula` | `string` | Não informado |  |
| `situacao` | `Situacao` | Não informado |  |
| `tipoUsuario` | `TipoUsuario` | Não informado |  |

### FluxoDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `idFluxo` | `int` | PUT/PATCH | Ignorado no POST |
| `valorPago` | `float` | Não informado |  |
| `consumo` | `int` | Não informado |  |
| `status` | `Status` | Não informado |  |

### TipoInstituicaoDTO
| Campo | Tipo | Obrigatório | Observações |
| --- | --- | --- | --- |
| `id` | `int` | PUT | Ignorado no POST |
| `descricao` | `string` | Sim |  |
| `situacao` | `Situacao` | Não informado |  |

### Enums usados em body
| Enum | Valores |
| --- | --- |
| `Situacao` | `ATIVO = 1`, `INATIVO = 2` |
| `Status` | `a_pagar = 1`, `paga = 2`, `atrasado = 3` |
| `SolicitaUc` | `Sim = 1`, `Não = 2` |
| `TipoUsuario` | `VISITANTE = 1`, `ADMINISTRADOR = 2`, `FUNCIONARIO = 3` |

## TipoDespesa (`api/tipo-despesa`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/tipo-despesa` | Query: `PaginationQuery` | `Response` com lista paginada de `TipoDespesaDTO` |
| `GET /api/tipo-despesa/{id}` | Route: `id` | `Response` com `TipoDespesaDTO` ou `data=null` |
| `POST /api/tipo-despesa` | Body: `TipoDespesaDTO` | `Response` com `TipoDespesaDTO` criado |
| `PUT /api/tipo-despesa/{id}` | Route: `id`; Body: `TipoDespesaDTO` | `Response` com `TipoDespesaDTO` atualizado |
| `PATCH /api/tipo-despesa/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Despesa (`api/despesas`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/despesas` | Query: `PaginationQuery` | `Response` com lista paginada de `DespesaDTO` |
| `GET /api/despesas/{id}` | Route: `id` | `Response` com `DespesaDTO` ou `data=null` |
| `POST /api/despesas` | Body: `DespesaDTO` | `Response` com `DespesaDTO` criado |
| `PUT /api/despesas/{id}` | Route: `id`; Body: `DespesaDTO` | `Response` com `DespesaDTO` atualizado |
| `PATCH /api/despesas/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Auditoria (`api/auditorias`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/auditorias` | Query: `PaginationQuery` | `Response` com lista paginada de `AuditoriaDTO` |
| `GET /api/auditorias/{id}` | Route: `id` | `Response` com `AuditoriaDTO` ou `data=null` |
| `GET /api/auditorias/usuario/{usuarioId}` | Route: `usuarioId` | `Response` com lista de `AuditoriaDTO` ou `data=null` |
| `GET /api/auditorias/entidade` | Query: `nomeEntidade` | `Response` com lista de `AuditoriaDTO` ou `data=null` |
| `GET /api/auditorias/operacao` | Query: `operacao` | `Response` com lista de `AuditoriaDTO` ou `data=null` |
| `POST /api/auditorias` | Body: `AuditoriaDTO` | `Response` com `AuditoriaDTO` criado |
| `PUT /api/auditorias/{id}` | Route: `id`; Body: `AuditoriaDTO` | `Response` com `AuditoriaDTO` atualizado |
| `DELETE /api/auditorias/{id}` | Route: `id` | `Response` com `data=null` |
| `PATCH /api/auditorias/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Orcamento (`api/orcamentos`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/orcamentos` | Query: `PaginationQuery` | `Response` com lista paginada de `OrcamentoDTO` |
| `GET /api/orcamentos/{id}` | Route: `id` | `Response` com `OrcamentoDTO` ou `data=null` |
| `POST /api/orcamentos` | Body: `OrcamentoDTO` | `Response` com `OrcamentoDTO` criado |
| `PUT /api/orcamentos/{id}` | Route: `id`; Body: `OrcamentoDTO` | `Response` com `OrcamentoDTO` atualizado |
| `DELETE /api/orcamentos/{id}` | Route: `id` | `Response` com `data=null` |

## Secretaria (`api/secretarias`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `POST /api/secretarias` | Body: `SecretariaDTO` | `Response` com `SecretariaDTO` criado |
| `PUT /api/secretarias/{id}` | Route: `id`; Body: `SecretariaDTO` | `Response` com `SecretariaDTO` atualizado |
| `GET /api/secretarias` | Query: `PaginationQuery` | `Response` com lista paginada de `SecretariaDTO` |
| `GET /api/secretarias/{id}` | Route: `id` | `Response` com `SecretariaDTO` ou `data=null` |
| `DELETE /api/secretarias/{id}` | Route: `id` | `Response` com `data=null` |
| `PATCH /api/secretarias/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Documento (`api/documentos`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/documentos` | Query: `PaginationQuery` | `Response` com lista paginada de `DocumentoDTO` |
| `GET /api/documentos/{id}` | Route: `id` | `Response` com `DocumentoDTO` ou `data=null` |
| `POST /api/documentos` | Body: `DocumentoDTO` | `Response` com `DocumentoDTO` criado |
| `PUT /api/documentos/{id}` | Route: `id`; Body: `DocumentoDTO` | `Response` com `DocumentoDTO` atualizado |
| `DELETE /api/documentos/{id}` | Route: `id` | `Response` com `data=null` |

## Fornecedor (`api/fornecedores`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `POST /api/fornecedores` | Body: `FornecedorDTO` | `Response` com `FornecedorDTO` criado |
| `PUT /api/fornecedores/{id}` | Route: `id`; Body: `FornecedorDTO` | `Response` com `FornecedorDTO` atualizado |
| `GET /api/fornecedores` | Query: `PaginationQuery` | `Response` com lista paginada de `FornecedorDTO` |
| `GET /api/fornecedores/{id}` | Route: `id` | `Response` com `FornecedorDTO` ou `data=null` |
| `PATCH /api/fornecedores/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## UnidadeMedida (`api/unidade-medida`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/unidade-medida` | Query: `PaginationQuery` | `Response` com lista paginada de `UnidadeMedidaDTO` |
| `GET /api/unidade-medida/{id}` | Route: `id` | `Response` com `UnidadeMedidaDTO` ou `data=null` |
| `POST /api/unidade-medida` | Body: `UnidadeMedidaDTO` | `Response` com `UnidadeMedidaDTO` criado |
| `PUT /api/unidade-medida/{id}` | Route: `id`; Body: `UnidadeMedidaDTO` | `Response` com `UnidadeMedidaDTO` atualizado |
| `PATCH /api/unidade-medida/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Instituicao (`api/instituicoes`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/instituicoes` | Query: `PaginationQuery` | `Response` com lista paginada de `InstituicaoDTO` |
| `GET /api/instituicoes/{id}` | Route: `id` | `Response` com `InstituicaoDTO` ou `data=null` |
| `GET /api/instituicoes/nome` | Query: `name` | `Response` com lista de `InstituicaoDTO` ou `data=null` |
| `POST /api/instituicoes` | Body: `InstituicaoDTO` | `Response` com `InstituicaoDTO` criado |
| `PUT /api/instituicoes/{id}` | Route: `id`; Body: `InstituicaoDTO` | `Response` com `InstituicaoDTO` atualizado |
| `PATCH /api/instituicoes/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Usuario (`api/usuarios`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/usuarios` | Query: `PaginationQuery` | `Response` com lista paginada de `UsuarioDTO` |
| `GET /api/usuarios/cpf` | Query: `cpf` | `Response` com lista de `UsuarioDTO` ou `data=null` |
| `GET /api/usuarios/{id}` | Route: `id` | `Response` com `UsuarioDTO` ou `data=null` |
| `POST /api/usuarios` | Body: `UsuarioDTO` | `Response` com `UsuarioDTO` criado |
| `PUT /api/usuarios/{id}` | Route: `id`; Body: `UsuarioDTO` | `Response` com `UsuarioDTO` atualizado |
| `DELETE /api/usuarios/{id}` | Route: `id` | `Response` com `data=null` |
| `PATCH /api/usuarios/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

## Fluxo (`api/fluxos`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `POST /api/fluxos` | Body: `FluxoDTO` | `Response` com `FluxoDTO` criado |
| `PUT /api/fluxos/{id}` | Route: `id`; Body: `FluxoDTO` | `Response` com `FluxoDTO` atualizado |
| `GET /api/fluxos` | Query: `PaginationQuery` | `Response` com lista paginada de `FluxoDTO` |
| `GET /api/fluxos/{id}` | Route: `id` | `Response` com `FluxoDTO` ou `data=null` |
| `PATCH /api/fluxos/status/{id}` | Route: `id`; Body: `Status` | `Response` com `{ idFluxo, statusAtual }` |

## TipoInstituicao (`api/tipo-instituicao`)
| Rota | O que pede | O que retorna |
| --- | --- | --- |
| `GET /api/tipo-instituicao` | Query: `PaginationQuery` | `Response` com lista paginada de `TipoInstituicaoDTO` |
| `GET /api/tipo-instituicao/{id}` | Route: `id` | `Response` com `TipoInstituicaoDTO` ou `data=null` |
| `POST /api/tipo-instituicao` | Body: `TipoInstituicaoDTO` | `Response` com `TipoInstituicaoDTO` criado |
| `PUT /api/tipo-instituicao/{id}` | Route: `id`; Body: `TipoInstituicaoDTO` | `Response` com `TipoInstituicaoDTO` atualizado |
| `PATCH /api/tipo-instituicao/situacao/{id}` | Route: `id` | `Response` com `{ id, situacao }` |

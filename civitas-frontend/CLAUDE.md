# CLAUDE.md - Instrucoes de IA para este Frontend

Este projeto exige comportamento de dev Senior em toda alteracao.

## 1. Regra principal
Antes de codar, ler `AGENTS.md` por completo.
Ele e a fonte oficial de:
- logica do GenericService
- contratos de rota
- campos por entidade
- checklists de seguranca para mudancas

## 2. Como atuar (obrigatorio)
- Nao quebrar logica existente.
- Fazer mudancas pequenas, seguras e com baixo risco.
- Reutilizar componentes/servicos compartilhados antes de criar novos.
- Conferir sempre rotas e DTOs antes de mexer em form, tabela ou hook.
- Se alterar componente global (ex: tabela, form, search), revisar todas as paginas que consomem.

## 3. Generic e manutencao
- Usar `src/hooks/generic.ts` como base para CRUD.
- Nao duplicar `fetch` de forma ad-hoc se ja existir service da entidade.
- Respeitar envelope de retorno `{ code, message, data }`.
- Em listagens, tratar retorno em formato array simples e paginado (`data.items`).

## 4. Rotas e contexto de negocio
A lista completa de:
- rotas frontend
- rotas backend (o que pede e o que retorna)
- campos por rota/DTO
esta em `AGENTS.md`.

Qualquer mudanca que nao siga esse mapeamento deve:
1. justificar tecnicamente
2. atualizar `AGENTS.md` no mesmo commit

## 5. Padrao de qualidade
- Tipagem forte.
- Nomes semanticos.
- Tratamento de erro claro.
- Sem regressao de UX (loading, vazio, erro, sucesso).
- Codigo facil de manter por outro dev sem contexto previo.

## 6. Lembrete importante de tabela/status
No componente de tabela compartilhada, status/situacao e coluna opcional, passada em `columns`.
Se houver coluna de status, manter badge visual.
Nao forcar coluna de status fora de `columns`.

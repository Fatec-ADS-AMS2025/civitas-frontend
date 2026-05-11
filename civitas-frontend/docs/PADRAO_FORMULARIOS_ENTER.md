# Padrao de Formularios com Enter - Civitas Frontend

Data: 2026-03-08

## Objetivo
Garantir comportamento consistente e acessivel para envio de formularios no frontend:

- Estrutura semantica com `form`
- Acao principal com `button type="submit"`
- Logica centralizada no `onSubmit` do `form`
- Enter executando a mesma acao do clique no botao principal

## Padrao obrigatorio

1. Estrutura
- Usar `form` para qualquer fluxo de envio.
- Inputs precisam estar dentro do `form` correspondente.
- Botao principal precisa ser `type="submit"`.
- Botoes secundarios devem ser `type="button"`.

2. Execucao
- O envio deve acontecer no `onSubmit` do `form`.
- Nao depender de `onClick` como unico gatilho de envio.
- Evitar `onKeyDown`/`onKeyPress` para simular submit quando o HTML nativo resolve.

3. Loading e duplicidade
- Bloquear reenvio durante processamento (`if (loading) return` + `disabled`).
- Exibir estado perceptivel (`aria-busy`, texto de carregamento).

4. Acessibilidade
- `label` associado com `htmlFor`.
- Campo com erro usando `aria-invalid`.
- Erro ligado ao campo via `aria-describedby`.
- Foco por teclado preservado (Tab, Shift+Tab, Enter).

## Componentes padronizados

### `src/app/login/page.jsx`
- Mantem `form onSubmit={handleLogin}`.
- Botao principal `type="submit"`.
- Enter em email/senha executa login.
- Guard de loading evita submit duplicado.

### `src/components/Form/form.tsx`
- Mantem submit centralizado no `form`.
- Acao principal com `Button type="submit"`.
- Cancelar como botao secundario (`type="button"` por default no componente `Button`).
- Escape continua como excecao intencional para fechar/cancelar.

### `src/components/Table/searchbar.tsx`
- Busca/filtro agora executa no `onSubmit`.
- Enter e clique em "Buscar" executam exatamente a mesma acao.
- Botao principal "Buscar" e `type="submit"`.
- "Cadastrar", "Filtrar" e "Limpar" sao `type="button"`.
- Modal segue fora do `form` para evitar aninhamento de formularios.

## Excecoes intencionais

- Escape no `Form` (modal CRUD): cancela/fecha formulario.
- Escape e Tab no `Modal`: gerenciamento de foco e acessibilidade.
- Paginas sem formulario implementado ainda (ex.: `despesas`) devem seguir este padrao quando evoluirem.

## Limitacoes atuais mapeadas

- Nao existe componente/rota de drawer no frontend atual.
- Rotas de cadastro e recuperacao de acesso (`/signup`, `/forgot-password`) nao estao implementadas no `app`.
- Fluxos futuros devem seguir o mesmo padrao descrito neste documento.

## Checklist para novos formularios

- [ ] Existe `form` semantico?
- [ ] Existe `onSubmit` centralizado?
- [ ] A acao principal e `type="submit"`?
- [ ] Botoes secundarios estao como `type="button"`?
- [ ] Enter dispara a mesma acao do botao principal?
- [ ] Loading bloqueia envio duplicado?
- [ ] Erros estao acessiveis (`aria-invalid`, `aria-describedby`)?

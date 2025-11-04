# Input Component - Civitas (Sprint 02)

## Descrição
Componente de entrada de dados simples e reutilizável para o sistema Civitas, desenvolvido com React, TypeScript e Tailwind CSS. Criado especificamente para atender aos requisitos da Sprint 02.

## Características
- ✅ Componente simples e reutilizável
- ✅ Suporte completo ao TypeScript
- ✅ Totalmente responsivo
- ✅ Acessibilidade (ARIA) integrada
- ✅ Estados visuais (foco, erro, desabilitado)
- ✅ Validação visual com mensagens de erro
- ✅ Estilização com Tailwind CSS
- ✅ Indicadores visuais para campos obrigatórios

## Interface Props

```tsx
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}
```

### Props Disponíveis

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-----------|
| `label` | `string` | `undefined` | Texto do rótulo do campo |
| `error` | `string` | `undefined` | Mensagem de erro a ser exibida |
| `className` | `string` | `''` | Classes CSS adicionais |
| `...props` | `HTMLInputAttributes` | - | Todas as props nativas do input HTML |

## Exemplos de Uso

### Input Básico
```tsx
<Input placeholder="Digite seu texto aqui" />
```

### Input com Label e Campo Obrigatório
```tsx
<Input 
  label="Nome completo"
  placeholder="Digite seu nome"
  required
/>
```

### Input de Email com Validação de Erro
```tsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const handleEmailChange = (e) => {
  setEmail(e.target.value);
  if (e.target.value && !e.target.value.includes('@')) {
    setEmailError('Digite um email válido');
  } else {
    setEmailError('');
  }
};

<Input 
  type="email"
  label="Email"
  placeholder="seu@email.com"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
  required
/>
```

### Input de Senha
```tsx
<Input 
  type="password"
  label="Senha"
  placeholder="Digite sua senha"
  required
/>
```

### Input Desabilitado
```tsx
<Input 
  label="Campo desabilitado"
  placeholder="Este campo está desabilitado"
  value="Valor fixo"
  disabled
/>
```

### Input com Estado de Erro
```tsx
<Input 
  label="Campo com erro"
  placeholder="Digite algo aqui"
  error="Este campo contém um erro"
/>
```

## Funcionalidades

### Validação Visual
- Borda vermelha quando há erro
- Mensagem de erro exibida abaixo do campo
- Indicador visual (*) para campos obrigatórios

### Estados do Input
- **Normal**: Borda cinza, fundo branco
- **Foco**: Borda azul, anel de foco azul
- **Erro**: Borda vermelha, anel de foco vermelho
- **Desabilitado**: Fundo cinza claro, texto acinzentado
- **Transições**: Animações suaves entre estados

### Responsividade
- Largura total (`w-full`) no container
- Padding adequado (px-4 py-3)
- Bordas arredondadas (rounded-lg)
- Espaçamento entre campos (mb-4)

## Acessibilidade

- ✅ Labels associados corretamente com `htmlFor` e ID único
- ✅ Estados de foco visíveis
- ✅ Suporte a leitores de tela
- ✅ Indicadores visuais para campos obrigatórios
- ✅ Mensagens de erro associadas ao campo
- ✅ Contraste adequado de cores

## Design System

O componente segue o design system do Civitas com:
- Cores padronizadas (background, foreground, gray-500)
- Bordas arredondadas consistentes
- Espaçamentos padronizados
- Tipografia coerente

## Personalização

O componente aceita classes CSS personalizadas através da prop `className`:

```tsx
<Input 
  className="my-custom-class"
  label="Input personalizado"
/>
```

## Dependências

- React 19.1.0+
- TypeScript 5+
- Tailwind CSS 4+
- Next.js 15.5.4+

## Localização dos Arquivos

```
src/components/Input.tsx           # Componente principal
src/app/componentes/page.tsx       # Página de demonstração
docs/INPUT_COMPONENT_SPRINT02.md   # Esta documentação
```

## Sprint 02 - Conclusão

Este componente atende completamente aos requisitos da Sprint 02:
- ✅ Campo de input funcional
- ✅ Componente reutilizável
- ✅ Design simples e limpo
- ✅ Validação de erro integrada
- ✅ Acessibilidade garantida
- ✅ Responsivo para todas as telas
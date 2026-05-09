# Sprint 02 - Campo de Input - Civitas Frontend

## 🎯 Objetivo
Criar um campo de input funcional e estilizado para o sistema Civitas. O input deve seguir a identidade visual existente, ser responsivo, acessível e permitir fácil interação do usuário.

## ✅ Critérios de Aceite

### ✅ 1. Input implementado e estilizado conforme padrões do sistema
- [x] Design seguindo a identidade visual do Civitas
- [x] Cores consistentes com o design system (teal/verde-azulado)
- [x] Bordas totalmente arredondadas (`rounded-sm`)
- [x] Espaçamentos e tipografia padronizados
- [x] Estados visuais bem definidos (normal, foco, erro, desabilitado)

### ✅ 2. Funcionalidade testada (digitação, foco, envio de dados)
- [x] Digitação funcional em todos os tipos de input
- [x] Estados de foco com indicação visual clara
- [x] Validação de dados integrada
- [x] Mensagens de erro contextuais
- [x] Envio de dados através de onChange handlers

### ✅ 3. Responsivo e acessível
- [x] **Cores**: Contraste adequado (cinza-800 no texto, teal-500 no foco)
- [x] **Tamanho**: Padding confortável (px-4 py-3) para toque móvel
- [x] **Contraste**: WCAG compliant para texto e backgrounds
- [x] **Label**: Associação correta com htmlFor e IDs únicos
- [x] **Placeholder**: Texto descritivo e acessível
- [x] **Navegação**: Suporte completo a teclado e screen readers

## 🗒️ Variações do Input Implementadas

### 1. Input de Texto Padrão
```tsx
<Input
  placeholder="Digite seu nome"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 2. Input de Email com Validação
```tsx
<Input
  type="email"
  placeholder="Digite o seu E-mail"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
/>
```

### 3. Input de Senha
```tsx
<Input
  type="password"
  placeholder="Digite a sua Senha"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### 4. Input Desabilitado
```tsx
<Input
  placeholder="Campo desabilitado"
  value="Valor fixo"
  disabled
/>
```

### 5. Input com Estado de Erro
```tsx
<Input
  placeholder="Campo com erro"
  error="Este campo contém um erro"
/>
```

### 6. Input com Label e Campo Obrigatório
```tsx
<Input
  label="Nome completo"
  placeholder="Digite seu nome"
  required
/>
```

## 📋 Interface TypeScript

```tsx
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;      // Texto do rótulo (opcional)
  error?: string;      // Mensagem de erro (opcional)
  className?: string;  // Classes CSS adicionais (opcional)
}
```

## 🎨 Especificações de Design

### Cores
- **Texto**: `text-gray-800` (#1f2937)
- **Placeholder**: `placeholder:text-gray-400` (#9ca3af)
- **Borda Normal**: `border-gray-300` (#d1d5db)
- **Foco**: `focus:ring-teal-500 focus:border-teal-500` (#14b8a6)
- **Erro**: `border-red-500 focus:ring-red-500` (#ef4444)
- **Background**: `bg-white` (#ffffff)

### Dimensões
- **Padding**: `px-4 py-3` (16px horizontal, 12px vertical)
- **Border Radius**: `rounded-sm` (totalmente arredondado)
- **Width**: `w-full` (largura total do container)
- **Margin Bottom**: `mb-4` (16px entre campos)

### Estados Visuais
- **Normal**: Borda cinza, background branco
- **Hover**: `hover:border-gray-400` - borda mais escura
- **Foco**: Ring teal + borda teal + transição suave
- **Erro**: Borda vermelha + ring vermelho + mensagem abaixo
- **Desabilitado**: Background cinza + cursor not-allowed

## 🔧 Como Usar no Sistema

### 1. Importação
```tsx
import { Input } from '@/components/Input'
```

### 2. Uso Básico
```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  
  return (
    <Input
      type="email"
      placeholder="Digite o seu E-mail"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}
```

### 3. Com Validação
```tsx
function FormWithValidation() {
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

  return (
    <Input
      type="email"
      placeholder="Digite o seu E-mail"
      value={email}
      onChange={handleEmailChange}
      error={emailError}
    />
  );
}
```

## 📱 Responsividade

### Mobile (< 768px)
- Largura total da tela
- Padding confortável para toque
- Tamanho de fonte legível

### Tablet (768px - 1024px)
- Largura adaptável ao container
- Espaçamentos proporcionais

### Desktop (> 1024px)
- Largura máxima controlada
- Hover states ativos
- Transições suaves

## ♿ Acessibilidade

### WCAG 2.1 Compliance
- [x] **Contraste**: Razão mínima 4.5:1 para texto normal
- [x] **Foco**: Indicador visual claro e consistente
- [x] **Labels**: Associação semântica correta
- [x] **Navegação**: Ordem lógica de tabulação
- [x] **Screen Readers**: Suporte completo com ARIA

### Testes de Acessibilidade
- [x] Navegação apenas por teclado
- [x] Leitura por screen reader
- [x] Zoom até 200% sem quebra de layout
- [x] Alto contraste compatível

## 🧪 Testes Realizados

### Funcionalidade
- [x] Digitação em todos os tipos de input
- [x] Validação em tempo real
- [x] Estados de foco e blur
- [x] Envio de dados via formulário
- [x] Limpeza de campos

### Compatibilidade
- [x] Chrome, Firefox, Safari, Edge
- [x] iOS Safari, Chrome Mobile, Samsung Internet
- [x] Teclados virtuais funcionais
- [x] Orientação portrait/landscape

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── Input.tsx                    # Componente principal
├── app/
│   └── componentes/
│       └── page.tsx                 # Página de demonstração
└── docs/
    ├── INPUT_COMPONENT_SPRINT02.md  # Documentação técnica
    └── SPRINT02_FINAL_REPORT.md     # Este relatório
```

## 🚀 Demonstração

### URL de Teste
- **Local**: http://localhost:3000/componentes
- **Exemplos**: Tela de login do Civitas com todos os tipos de input

### Screenshots
- Página de demonstração replicando o design exato do Civitas
- Header com logo e identidade visual
- Formulário com todos os estados do input
- Layout responsivo em diferentes tamanhos de tela

## 📦 Dependências

```json
{
  "react": "19.1.0",
  "typescript": "5",
  "tailwindcss": "4",
  "next": "15.5.4"
}
```

## ✅ Status da Sprint 02

### Entregáveis Completos
- [x] Campo de input funcional implementado
- [x] Design seguindo identidade visual do Civitas
- [x] Variações: texto, email, senha, desabilitado, erro
- [x] Funcionalidade testada: digitação, foco, validação
- [x] Responsividade total: mobile, tablet, desktop
- [x] Acessibilidade WCAG 2.1 compliant
- [x] Documentação completa com exemplos
- [x] Página de demonstração funcional

### Critérios de Aceite
✅ **Input implementado e estilizado conforme padrões do sistema**
✅ **Funcionalidade testada (digitação, foco, envio de dados)**
✅ **Responsivo e acessível (cores, tamanho, contraste, label e placeholder adequados)**
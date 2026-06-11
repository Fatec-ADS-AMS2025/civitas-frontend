# Componente Input - Documentação

## 📋 Visão Geral
O componente Input é um campo de entrada funcional, estilizado e acessível desenvolvido para o sistema Civitas. Ele oferece diversas variações e segue os padrões de design system estabelecidos.

## ✅ Critérios de Aceite Atendidos

### ✅ Input implementado e estilizado conforme padrões do sistema
- Estilização consistente com Tailwind CSS
- Cores e tipografia padronizadas
- Estados visuais bem definidos (normal, foco, desabilitado)

### ✅ Funcionalidade testada
- ✅ Digitação funcional
- ✅ Estados de foco adequados
- ✅ Envio de dados via onChange
- ✅ Validação de tipos (texto, senha, número)

### ✅ Responsivo e acessível
- ✅ Layout responsivo
- ✅ Contraste adequado de cores
- ✅ Labels e placeholders apropriados
- ✅ Atributos ARIA implementados
- ✅ Suporte a teclado

## 🔧 Instalação e Uso

### Importação
```tsx
import { Input } from '@/components/Input';
```

### Uso Básico
```tsx
import { useState } from 'react';
import { Input } from '@/components/Input';

function MeuComponente() {
  const [valor, setValor] = useState('');

  return (
    <Input
      label="Nome"
      placeholder="Digite seu nome"
      value={valor}
      onChange={(e) => setValor(e.target.value)}
    />
  );
}
```

## 📝 Props do Componente

| Prop | Tipo | Obrigatório | Padrão | Descrição |
|------|------|-------------|---------|-----------|
| `label` | `string` | ✅ | - | Texto do rótulo do campo |
| `type` | `'text' \| 'password' \| 'number'` | ❌ | `'text'` | Tipo do input |
| `placeholder` | `string` | ❌ | - | Texto de placeholder |
| `value` | `string \| number` | ❌ | - | Valor controlado |
| `onChange` | `(e: ChangeEvent<HTMLInputElement>) => void` | ❌ | - | Função de callback para mudanças |
| `disabled` | `boolean` | ❌ | `false` | Campo desabilitado |
| `iconLeft` | `React.ReactNode` | ❌ | - | Ícone à esquerda |
| `iconRight` | `React.ReactNode` | ❌ | - | Ícone à direita |
| `name` | `string` | ❌ | - | Nome do campo para formulários |
| `required` | `boolean` | ❌ | `false` | Campo obrigatório |

## 🎨 Variações Disponíveis

### 1. Input de Texto
```tsx
<Input
  label="Email"
  type="text"
  placeholder="Digite seu email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### 2. Input de Senha
```tsx
<Input
  label="Senha"
  type="password"
  placeholder="Digite sua senha"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  required
/>
```

### 3. Input de Número
```tsx
<Input
  label="Idade"
  type="number"
  placeholder="Digite sua idade"
  value={idade}
  onChange={(e) => setIdade(e.target.value)}
/>
```

### 4. Input Desabilitado
```tsx
<Input
  label="Campo Bloqueado"
  placeholder="Este campo está desabilitado"
  disabled
/>
```

### 5. Input com Ícone à Esquerda
```tsx
<Input
  label="Buscar"
  placeholder="Digite para buscar..."
  iconLeft={<SearchIcon />}
  value={busca}
  onChange={(e) => setBusca(e.target.value)}
/>
```

### 6. Input com Ícone à Direita
```tsx
<Input
  label="Senha"
  type="password"
  placeholder="Digite sua senha"
  iconRight={<EyeIcon />}
  value={senha}
  onChange={(e) => setSentena(e.target.value)}
/>
```

## 🎯 Exemplo Completo de Formulário

```tsx
'use client'

import { useState } from 'react';
import { Input } from '@/components/Input';

export default function FormularioCompleto() {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    senha: '',
    idade: '',
    telefone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Envie os dados para o fluxo da tela aqui.
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <Input
        label="Nome Completo"
        placeholder="Digite seu nome"
        value={dados.nome}
        onChange={(e) => setDados({...dados, nome: e.target.value})}
        required
      />
      
      <Input
        label="Email"
        type="text"
        placeholder="seu@email.com"
        value={dados.email}
        onChange={(e) => setDados({...dados, email: e.target.value})}
        required
      />
      
      <Input
        label="Senha"
        type="password"
        placeholder="Digite uma senha segura"
        value={dados.senha}
        onChange={(e) => setDados({...dados, senha: e.target.value})}
        required
      />
      
      <Input
        label="Idade"
        type="number"
        placeholder="Digite sua idade"
        value={dados.idade}
        onChange={(e) => setDados({...dados, idade: e.target.value})}
      />
      
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-sm hover:bg-blue-700"
      >
        Enviar
      </button>
    </form>
  );
}
```

## 🌐 Acessibilidade

O componente segue as melhores práticas de acessibilidade:

- **Labels**: Cada input possui um label associado
- **ARIA**: Atributos `aria-label` adequados
- **Foco**: Estados de foco bem definidos
- **Contraste**: Cores com contraste adequado
- **Navegação**: Suporte completo a navegação por teclado
- **Campos obrigatórios**: Indicador visual (*) para campos required

## 📱 Responsividade

O componente é totalmente responsivo:
- **Mobile**: Layout otimizado para telas pequenas
- **Tablet**: Adaptação automática para telas médias  
- **Desktop**: Layout completo para telas grandes

## 🎨 Customização de Estilos

### Classes CSS Aplicadas
```css
/* Estilo base */
.input-base {
  @apply w-full px-4 py-2 border rounded-sm focus:outline-none focus:ring-2 transition-colors duration-200 bg-white text-gray-900 placeholder-gray-400;
}

/* Estado desabilitado */
.input-disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed;
}

/* Estado de foco */
.input-focus {
  @apply border-gray-300 focus:border-primary-500 focus:ring-primary-300;
}
```

## 🚀 Demonstração ao Vivo

Para ver o componente funcionando, acesse:
```
http://localhost:3000/componentes
```

## 📷 Screenshots

![Componente Input em funcionamento](../attachments/input-examples.png)

*Exemplos do componente Input com todas as variações implementadas*

## 🔄 Atualizações e Melhorias

### Versão 1.0.0 (Atual)
- ✅ Implementação básica
- ✅ Variações de tipo (texto, senha, número)
- ✅ Estados (normal, desabilitado, foco)
- ✅ Suporte a ícones
- ✅ Acessibilidade completa
- ✅ Responsividade

### Próximas versões
- 🔄 Validação integrada
- 🔄 Máscaras de input
- 🔄 Temas customizáveis
- 🔄 Animações aprimoradas

---

**Desenvolvido para o Sistema Civitas**  
*Sprint 02 - Desenvolvimento Front-end*

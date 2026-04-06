/*
  SNIPPETS DE CÓDIGO - COMPONENTE INPUT
  Exemplos de uso rápido para copy/paste
*/

// 1. IMPORTAÇÃO BÁSICA
// import { Input } from '@/components/Input';

// 2. INPUT SIMPLES
/*
<Input
  label="Nome"
  placeholder="Digite seu nome"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
/>
*/

// 3. INPUT DE SENHA
/*
<Input
  label="Senha"
  type="password"
  placeholder="Digite sua senha"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  required
/>
*/

// 4. INPUT NUMÉRICO
/*
<Input
  label="Idade"
  type="number"
  placeholder="Digite sua idade"
  value={idade}
  onChange={(e) => setIdade(e.target.value)}
/>
*/

// 5. INPUT DESABILITADO
/*
<Input
  label="Campo Bloqueado"
  placeholder="Campo desabilitado"
  disabled
/>
*/

// 6. INPUT COM ÍCONE À ESQUERDA
/*
<Input
  label="Buscar"
  placeholder="Digite para buscar..."
  iconLeft={<span>🔍</span>}
  value={busca}
  onChange={(e) => setBusca(e.target.value)}
/>
*/

// 7. INPUT COM ÍCONE À DIREITA
/*
<Input
  label="Visualizar"
  placeholder="Com ícone à direita"
  iconRight={<span>👁️</span>}
  value={valor}
  onChange={(e) => setValor(e.target.value)}
/>
*/

// 8. FORMULÁRIO COMPLETO COM MÚLTIPLOS INPUTS

'use client'

import { useState } from 'react';
import { Input } from '@/components/Input';

function FormularioExemplo() {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: ''
  });

  const handleChange = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDados(prev => ({
      ...prev,
      [campo]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Input
        label="Nome Completo"
        placeholder="Digite seu nome"
        value={dados.nome}
        onChange={handleChange('nome')}
        required
      />
      
      <Input
        label="Email"
        type="text"
        placeholder="seu@email.com"
        value={dados.email}
        onChange={handleChange('email')}
       // iconLeft={<span>📧</span>}
        required
      />
      
      <Input
        label="Senha"
        type="password"
        placeholder="Digite uma senha segura"
        value={dados.senha}
        onChange={handleChange('senha')}
       // iconRight={<span>🔒</span>}
        required
      />
      
      <Input
        label="Telefone"
        placeholder="(11) 99999-9999"
        value={dados.telefone}
        onChange={handleChange('telefone')}
        //iconLeft={<span>📱</span>}
      />
    </div>
  );
}

'use client'

import { Input } from '@/components/Input'
import { useState } from 'react'

export default function PageComponentes() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Validação simples de email
    if (e.target.value && !e.target.value.includes('@')) {
      setEmailError('Digite um email válido');
    } else {
      setEmailError('');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite apenas letras, espaços, acentos e caracteres especiais do português
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]*$/;
    
    if (nameRegex.test(value)) {
      setName(value);
      setNameError('');
    } else {
      setNameError('Nome deve conter apenas letras');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Civitas */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-8 h-8 bg-teal-600 rounded mr-2 flex items-center justify-center">
              <span className="text-white text-sm font-bold">🏛️</span>
            </div>
            <span className="text-teal-600 font-semibold text-xl">Civitas</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Componente Input</h1>
          <p className="text-sm text-gray-600">Seguindo o Design System Civitas</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            {/* Input de Email */}
            <Input
              type="email"
              placeholder="Digite o seu E-mail"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
            />
            
            {/* Input de Senha */}
            <Input
              type="password"
              placeholder="Digite a sua Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {/* Input de Número */}
            <Input
              type="number"
              placeholder="Digite um número"
            />

            {/* Input de Texto com Label */}
            <Input
              label="Nome completo"
              placeholder="Digite seu nome completo"
              value={name}
              onChange={handleNameChange}
              error={nameError}
              required
            />

            {/* Input Desabilitado */}
            <Input
              placeholder="Campo desabilitado"
              value="Exemplo desabilitado"
              disabled
            />

            {/* Input com Erro */}
            <Input
              placeholder="Campo com erro"
              error="Este campo contém um erro"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import React, { useState } from 'react'

interface Instituicao {
  id: number
  situacao: 'Ativa' | 'Inativa'
  nome: string
  razaoSocial: string
  cnpj: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  telefone: string
  email: string
}

const mockInstituicoes: Instituicao[] = [
  {
    id: 1,
    situacao: 'Ativa',
    nome: 'Fatec São Paulo',
    razaoSocial: 'Centro Estadual...',
    cnpj: '12.345.678/0001/90',
    cep: '01124-060',
    logradouro: 'Av.Tiradentes',
    numero: '615',
    bairro: 'Luz',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 80028-922',
    email: 'fatec@sp.gov.br'
  },
  {
    id: 2,
    situacao: 'Inativa',
    nome: 'UNICAMP',
    razaoSocial: 'Inst. Federal...',
    cnpj: '12.345.678/0001/90',
    cep: '01124-060',
    logradouro: 'Av.Tiradentes',
    numero: '617',
    bairro: 'Butantã',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 80048-922',
    email: 'unicamp@gov.br'
  },
  {
    id: 3,
    situacao: 'Ativa',
    nome: 'Fatec Jales',
    razaoSocial: 'Centro Estadual...',
    cnpj: '32.345.678/0001/90',
    cep: '01124-060',
    logradouro: 'Av.Tirage',
    numero: '619',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 80028-922',
    email: 'fatec@sp.gov.br'
  }
]

export default function InstituicoesPage() {
  const [filtros, setFiltros] = useState({
    nome: '',
    cnpj: '',
    cidade: '',
    estado: '',
    situacao: ''
  })

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      cnpj: '',
      cidade: '',
      estado: '',
      situacao: ''
    })
  }

  const filtrarInstituicoes = () => {
    console.log('Aplicando filtros:', filtros)
  }

  const handleAcao = (acao: string, id: number) => {
    console.log(`Ação ${acao} na instituição ${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold civitas-teal-dark">Listagem de Instituições</h1>
          <nav className="text-sm civitas-gray-dark mt-1">
            Home &lt; Instituições &lt; Listagem
          </nav>
        </div>
        <button className="flex items-center civitas-gray-dark hover:text-gray-800">
          <span className="mr-2">←</span>
          Voltar
        </button>
      </div>

      {/* Área de Busca e Filtros */}
      <div className="bg-civitas-gray-dark rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-white text-lg font-medium mb-2">Busca:</h2>
        <p className="civitas-gray-light text-sm mb-6">Aqui você busca e filtra</p>
        
        {/* Filtros - Layout responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          <input
            type="text"
            placeholder="Nome"
            value={filtros.nome}
            onChange={(e) => handleFiltroChange('nome', e.target.value)}
            className="px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-700 bg-white w-full font-sans text-sm"
          />
          <input
            type="text"
            placeholder="CNPJ"
            value={filtros.cnpj}
            onChange={(e) => handleFiltroChange('cnpj', e.target.value)}
            className="px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-700 bg-white w-full font-sans text-sm"
          />
          <input
            type="text"
            placeholder="Cidade"
            value={filtros.cidade}
            onChange={(e) => handleFiltroChange('cidade', e.target.value)}
            className="px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-700 bg-white w-full font-sans text-sm"
          />
          <select
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
            className="px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-500 bg-white w-full font-sans text-sm"
            title="Filtrar por estado"
          >
            <option value="">Todos Estados</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
          </select>
          <select
            value={filtros.situacao}
            onChange={(e) => handleFiltroChange('situacao', e.target.value)}
            className="px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-teal-500 outline-none text-gray-500 bg-white w-full font-sans text-sm"
            title="Filtrar por situação"
          >
            <option value="">Todas Situações</option>
            <option value="Ativa">Ativa</option>
            <option value="Inativa">Inativa</option>
          </select>
          <button
            onClick={() => handleAcao('cadastrar', 0)}
            className="flex items-center justify-center bg-civitas-teal-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition-all w-full font-sans text-sm font-medium"
          >
            <span className="mr-2">+</span>
            Cadastrar
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={filtrarInstituicoes}
            className="flex items-center justify-center bg-transparent text-white px-6 py-2 rounded-full border border-white hover:opacity-90 transition-all w-full sm:w-auto font-sans text-sm"
          >
            <span className="material-symbols-outlined mr-2 text-sm">filter_alt</span>
            Filtrar
          </button>
          <button
            onClick={limparFiltros}
            className="bg-civitas-red-limpar text-white px-6 py-2 rounded-full hover:opacity-90 transition-all w-full sm:w-auto font-sans text-sm"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Tabela de Instituições - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-sans">
            <thead className="bg-civitas-teal-primary text-white">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">ID</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Situação</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Nome</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Razão Social</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">CNPJ</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">CEP</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Logradouro</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Número</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Bairro</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Cidade</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Estado</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Telefone</th>
                <th className="px-3 py-3 text-left text-sm font-medium border-r border-white/20">Email</th>
                <th className="px-3 py-3 text-left text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockInstituicoes.map((instituicao, index) => (
                <tr key={instituicao.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.id}</td>
                  <td className="px-3 py-3 border-r border-gray-200">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      instituicao.situacao === 'Ativa' 
                        ? 'bg-civitas-teal-active text-white' 
                        : 'bg-civitas-red-inactive text-white'
                    }`}>
                      {instituicao.situacao}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.nome}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.razaoSocial}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.cnpj}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.cep}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.logradouro}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.numero}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.bairro}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.cidade}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.estado}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.telefone}</td>
                  <td className="px-3 py-3 text-sm civitas-gray-dark border-r border-gray-200">{instituicao.email}</td>
                  <td className="px-3 py-3">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleAcao('visualizar', instituicao.id)}
                        className="p-1 hover:opacity-70 hover:bg-gray-50 rounded"
                        title="Visualizar"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button
                        onClick={() => handleAcao('editar', instituicao.id)}
                        className="p-1 hover:opacity-70 hover:bg-gray-50 rounded"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleAcao('excluir', instituicao.id)}
                        className="p-1 hover:opacity-70 hover:bg-gray-50 rounded"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards de Instituições - Mobile */}
      <div className="block md:hidden space-y-4 font-sans">
        {mockInstituicoes.map((instituicao) => (
          <div key={instituicao.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold civitas-gray-dark">{instituicao.nome}</h3>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                instituicao.situacao === 'Ativa' 
                  ? 'bg-civitas-teal-active text-white' 
                  : 'bg-civitas-red-inactive text-white'
              }`}>
                {instituicao.situacao}
              </span>
            </div>
            
            <div className="text-sm civitas-gray-dark space-y-1 mb-4">
              <div><strong>ID:</strong> {instituicao.id}</div>
              <div><strong>Razão Social</strong></div>
              <div>{instituicao.razaoSocial}</div>
              <div><strong>CNPJ</strong></div>
              <div>{instituicao.cnpj}</div>
              <div><strong>Endereço</strong></div>
              <div>{instituicao.logradouro}, {instituicao.numero} - {instituicao.bairro}</div>
              <div><strong>CEP</strong></div>
              <div>{instituicao.cep}</div>
              <div><strong>Cidade / Estado</strong></div>
              <div>{instituicao.cidade} - {instituicao.estado}</div>
              <div><strong>Telefone</strong></div>
              <div>{instituicao.telefone}</div>
              <div><strong>E-mail</strong></div>
              <div className="civitas-gray-dark">{instituicao.email}</div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAcao('visualizar', instituicao.id)}
                className="flex-1 bg-civitas-gray-dark text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                Ver
              </button>
              <button
                onClick={() => handleAcao('editar', instituicao.id)}
                className="flex-1 bg-civitas-teal-primary text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                Editar
              </button>
              <button
                onClick={() => handleAcao('excluir', instituicao.id)}
                className="flex-1 bg-civitas-red-limpar text-white py-2 px-4 rounded-full text-sm font-medium hover:opacity-90 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex justify-center mt-6 font-sans">
        <div className="flex items-center space-x-1">
          <button className="px-3 py-2 text-sm civitas-gray-dark hover:opacity-70 hover:bg-gray-100 rounded">←</button>
          <button className="px-3 py-2 text-sm bg-civitas-teal-primary text-white rounded font-medium">1</button>
          <button className="px-3 py-2 text-sm civitas-gray-dark hover:opacity-70 hover:bg-gray-100 rounded">2</button>
          <button className="px-3 py-2 text-sm civitas-gray-dark hover:opacity-70 hover:bg-gray-100 rounded">3</button>
          <button className="px-3 py-2 text-sm civitas-gray-dark hover:opacity-70 hover:bg-gray-100 rounded">→</button>
        </div>
      </div>
    </div>
  )
}

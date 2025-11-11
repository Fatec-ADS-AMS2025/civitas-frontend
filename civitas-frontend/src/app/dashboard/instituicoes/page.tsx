'use client'

import React, { useState } from 'react'
import Button from '@/components/button'

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

  const [instituicoesFiltradas, setInstituicoesFiltradas] = useState<Instituicao[]>(mockInstituicoes)

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
    setInstituicoesFiltradas(mockInstituicoes)
  }

  const filtrarInstituicoes = () => {
    let resultado = mockInstituicoes.filter(instituicao => {
      return (
        (filtros.nome === '' || instituicao.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
        (filtros.cnpj === '' || instituicao.cnpj.includes(filtros.cnpj)) &&
        (filtros.cidade === '' || instituicao.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())) &&
        (filtros.estado === '' || instituicao.estado === filtros.estado) &&
        (filtros.situacao === '' || instituicao.situacao === filtros.situacao)
      )
    })
    setInstituicoesFiltradas(resultado)
  }

  const handleAcao = (acao: string, id: number) => {
    console.log(`Ação ${acao} na instituição ${id}`)
  }

  return (
    <div className="min-h-screen bg-transparent font-sans px-6 sm:px-10 lg:px-20 py-6 sm:py-10 lg:py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#004C57]">Listagem de Instituições</h1>
          <nav className="text-sm text-gray-500 mt-1 mb-5">
            Home &lt; Instituições &lt; Listagem
          </nav>
        </div>
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <span className="mr-2">←</span>
          Voltar
        </button>
      </div>

      {/* Área de Busca e Filtros */}
      <div className="bg-[#2E2E2E] rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-white text-lg font-medium mb-2">Busca:</h2>
        <p className="text-gray-300 text-sm mb-6">Aqui você busca e filtra</p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Nome"
            value={filtros.nome}
            onChange={(e) => handleFiltroChange('nome', e.target.value)}
            className="px-5 py-3 rounded-full border-[3px] border-[#0D5660] focus:ring-2 focus:ring-[#0D5660] outline-none text-gray-700 bg-white text-sm flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder="CNPJ"
            value={filtros.cnpj}
            onChange={(e) => handleFiltroChange('cnpj', e.target.value)}
            className="px-5 py-3 rounded-full border-[3px] border-[#0D5660] focus:ring-2 focus:ring-[#0D5660] outline-none text-gray-700 bg-white text-sm flex-1 min-w-[200px]"
          />

          <Button
            onClick={() => handleAcao('cadastrar', 0)}
            variant="primary"
            style={{
              backgroundColor: '#58AFAE',
              border: '1px solid white',
              padding: '14px 24px',
              borderRadius: '9999px',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              minWidth: '150px'
            }}
            className="hover:opacity-90 transition-all"
          >
            <span className="mr-2 text-lg">+</span>
            Cadastrar
          </Button>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={filtrarInstituicoes}
            className="flex items-center justify-center bg-transparent text-white px-20 py-2.5 rounded-full border border-white hover:opacity-90 transition-all w-full sm:w-auto text-sm"
          >
            <span className="material-symbols-outlined mr-2 text-sm">filter_alt</span>
            Filtrar
          </button>

          <button
            onClick={limparFiltros}
            className="bg-[#E74C3C] text-white px-22 py-3.5 rounded-full hover:opacity-90 transition-all w-full sm:w-auto text-base font-semibold"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#58AFAE] text-white">
              <tr>
                {['ID', 'Situação', 'Nome', 'Razão Social', 'CNPJ', 'CEP', 'Logradouro', 'Número', 'Bairro', 'Cidade', 'Estado', 'Telefone', 'Email', 'Ações'].map((col) => (
                  <th key={col} className="px-3 py-3 text-left font-medium border-r border-white/20">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instituicoesFiltradas.length > 0 ? (
                instituicoesFiltradas.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">{i.id}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          i.situacao === 'Ativa'
                            ? 'bg-[#4A9D9D] text-white'
                            : 'bg-[#E74C3C] text-white'
                        }`}
                      >
                        {i.situacao}
                      </span>
                    </td>
                    <td className="px-3 py-3">{i.nome}</td>
                    <td className="px-3 py-3">{i.razaoSocial}</td>
                    <td className="px-3 py-3">{i.cnpj}</td>
                    <td className="px-3 py-3">{i.cep}</td>
                    <td className="px-3 py-3">{i.logradouro}</td>
                    <td className="px-3 py-3">{i.numero}</td>
                    <td className="px-3 py-3">{i.bairro}</td>
                    <td className="px-3 py-3">{i.cidade}</td>
                    <td className="px-3 py-3">{i.estado}</td>
                    <td className="px-3 py-3">{i.telefone}</td>
                    <td className="px-3 py-3">{i.email}</td>
                    <td className="px-3 py-3">
                      <div className="flex space-x-1">
                        <button className="p-1 hover:bg-gray-100 rounded"><span className="material-symbols-outlined text-sm">visibility</span></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><span className="material-symbols-outlined text-sm">edit_square</span></button>
                        <button className="p-1 hover:bg-[#E74C3C]/20 rounded ">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="px-3 py-8 text-center text-gray-500">
                    Nenhuma instituição encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

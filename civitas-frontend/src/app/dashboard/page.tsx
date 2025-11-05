"use client"
import React, { useState, useEffect } from 'react'

export default function Dashboard() {
  const [fontSize, setFontSize] = useState(16) // Tamanho base da fonte em pixels
  const [highContrast, setHighContrast] = useState(false)

  // Aplicar as mudanças no documento
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [fontSize, highContrast])

  // Função para aumentar fonte (A+)
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24)) // Máximo 24px
  }

  // Função para resetar fonte (Aa)
  const resetFontSize = () => {
    setFontSize(16) // Volta ao padrão
  }

  // Função para diminuir fonte (A-)
  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12)) // Mínimo 12px
  }

  // Função para alternar alto contraste
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev)
  }
  return (
    <div className="min-h-screen bg-transparent font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">Bem-Vindo {"{user}"}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Vamos ao gerenciamento?</p>
          </div>
          <div className="bg-orange-400 text-black px-3 sm:px-4 py-4 sm:py-6 rounded-full flex flex-col items-center justify-center font-bold relative w-12 sm:w-16 h-28 sm:h-36 self-center sm:self-auto">
            {/* Botão Aumentar Fonte */}
            <button 
              onClick={increaseFontSize}
              className="text-sm sm:text-lg leading-tight mb-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
              title="Aumentar tamanho da fonte"
              aria-label="Aumentar tamanho da fonte"
            >
              A+
            </button>
            
            {/* Botão Resetar Fonte */}
            <button 
              onClick={resetFontSize}
              className="text-sm sm:text-lg leading-tight mb-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
              title="Tamanho normal da fonte"
              aria-label="Tamanho normal da fonte"
            >
              Aa
            </button>
            
            {/* Botão Diminuir Fonte */}
            <button 
              onClick={decreaseFontSize}
              className="text-sm sm:text-lg leading-tight mb-2 sm:mb-3 hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
              title="Diminuir tamanho da fonte"
              aria-label="Diminuir tamanho da fonte"
            >
              A-
            </button>
            
            {/* Botão Alto Contraste */}
            <button 
              onClick={toggleHighContrast}
              className="absolute bottom-2 sm:bottom-3 w-4 sm:w-5 h-4 sm:h-5 rounded-full overflow-hidden border border-black hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
              title={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
              aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
            >
              <div className="w-full h-full flex">
                <div className={`w-1/2 h-full transition-colors ${highContrast ? 'bg-white' : 'bg-black'}`}></div>
                <div className={`w-1/2 h-full transition-colors ${highContrast ? 'bg-black' : 'bg-orange-400'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
        {/* Top Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full mb-4 sm:mb-6">
      
      {/* Valor Disponível */}
      <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-[#004C57] overflow-hidden min-h-[120px] sm:min-h-[140px]"
        style={{ background: "linear-gradient(180deg, #008A9A 0%, #A2F2FF 100%)" }}
      >
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">Valor Disponível</h3>
          <p className="text-xs sm:text-sm mb-2 opacity-80">Atualmente:</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold flex flex-wrap gap-1 sm:gap-2 leading-tight">* * * * * *</div>
        </div>

        {/* Icon */}
        <span className="material-symbols-outlined material-icon-filled absolute -top-1 sm:-top-2 -right-1 sm:-right-2 rotate-[330deg] opacity-15 sm:opacity-20 text-[80px] sm:text-[120px] lg:text-[150px]">
          account_balance
        </span>
      </div>

      {/* Balança */}
      <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-[#D1D1D1] overflow-hidden min-h-[120px] sm:min-h-[140px] sm:col-span-2 lg:col-span-1"
        style={{ background: "linear-gradient(180deg, #000000 0%, #4A4A4A 100%)" }}
      >
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">Balança</h3>
          <p className="text-xs sm:text-sm mb-2 opacity-80">Valor disponível - Gastos totais</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold flex flex-wrap gap-1 sm:gap-2 leading-tight">* * * * * *</div>
        </div>

        {/* Icon */}
        <span className="material-symbols-outlined material-icon-filled absolute -top-2 sm:-top-4 -right-2 sm:-right-4 rotate-[330deg] opacity-10 sm:opacity-15 text-[100px] sm:text-[140px] lg:text-[170px]">
          monitoring
        </span>
      </div>

      {/* Gastos Totais */}
      <div className="relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-[#8B3C00] overflow-hidden min-h-[120px] sm:min-h-[140px] sm:col-span-2 lg:col-span-1"
        style={{ background: "linear-gradient(180deg, #FF8C26 0%, #FFB871 100%)" }}
      >
        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">Gastos Totais</h3>
          <p className="text-xs sm:text-sm mb-2 opacity-80">nos últimos 30 dias</p>
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold flex flex-wrap gap-1 sm:gap-2 leading-tight">* * * * * *</div>
        </div>

        {/* Icon */}
        <span className="material-symbols-outlined material-icon-filled absolute -top-1 sm:-top-2 -right-1 sm:-right-2 rotate-[330deg] opacity-15 sm:opacity-20 text-[80px] sm:text-[120px] lg:text-[150px]">
          payments
        </span>
      </div>
    </div>

        {/* Countdown */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <p className="text-gray-700 font-bold text-sm sm:text-base px-2">14 dias até a reposição da verba.</p>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Gastos Previstos */}
          <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">Gastos previstos para esse mês:</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Se não houver imprevistos, esse é o valor dos gastos totais.</p>
              </div>
              <span className="text-gray-400 self-start sm:self-center">...</span>
            </div>
            <button className="w-full bg-[#C5C5C5] text-gray-800 rounded-full py-2.5 sm:py-3 px-4 sm:px-6 font-medium hover:bg-[#B5B5B5] active:bg-[#B5B5B5] transition-colors text-sm sm:text-base touch-manipulation">
              {"{Cálculo de gastos previstos}"}
            </button>
          </div>

          {/* Instituições Desbalanceadas */}
          <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">Instituições desbalanceadas</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Estão gastando bem mais que a média:</p>
              </div>
              <span className="text-gray-400 self-start sm:self-center">...</span>
            </div>
            <button className="w-full bg-[#C5C5C5] text-gray-800 rounded-full py-2.5 sm:py-3 px-4 sm:px-6 font-medium hover:bg-[#B5B5B5] active:bg-[#B5B5B5] transition-colors text-sm sm:text-base touch-manipulation">
              {"{Nome da Instituição}"}
            </button>
          </div>
        </div>

        {/* Chart and Last Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Gráfico */}
          <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Gráfico</h3>
              <span className="text-gray-400">...</span>
            </div>
            <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* Chart representation EXACTLY like the reference image */}
              <div className="w-full h-full relative p-3 sm:p-4 lg:p-6">
                <svg className="w-full h-full" viewBox="0 0 350 160">
                  {/* Gradientes exatos da imagem de referência */}
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3"/>
                      <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.02"/>
                    </linearGradient>
                    <linearGradient id="coralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f87171" stopOpacity="0.3"/>
                      <stop offset="70%" stopColor="#fca5a5" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#fef2f2" stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Área preenchida azul (valor disponível) - FORMA EXATA DA IMAGEM */}
                  <path d="M20,120 Q35,115 50,108 Q65,100 80,90 Q95,80 110,65 Q125,50 140,45 Q155,40 170,50 Q185,60 200,75 Q215,90 230,100 Q245,110 260,95 Q275,80 290,70 Q305,60 320,65 Q335,70 345,75 L345,135 L20,135 Z" 
                        fill="url(#blueGradient)" />
                  
                  {/* Área preenchida coral/rosa (gastos) - FORMA EXATA DA IMAGEM */}
                  <path d="M20,125 Q30,122 40,118 Q50,114 60,110 Q70,106 80,102 Q90,98 100,95 Q110,92 120,96 Q130,100 140,105 Q150,110 160,115 Q170,120 180,118 Q190,116 200,110 Q210,104 220,98 Q230,92 240,88 Q250,84 260,82 Q270,80 280,78 Q290,76 300,75 Q310,74 320,73 Q330,72 340,71 Q345,70.5 345,70 L345,135 L20,135 Z" 
                        fill="url(#coralGradient)" />
                  
                  {/* Linha azul escura (valor disponível) - CURVA EXATA */}
                  <path d="M20,120 Q35,115 50,108 Q65,100 80,90 Q95,80 110,65 Q125,50 140,45 Q155,40 170,50 Q185,60 200,75 Q215,90 230,100 Q245,110 260,95 Q275,80 290,70 Q305,60 320,65 Q335,70 345,75" 
                        stroke="#1e40af" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Linha coral/rosa grossa (gastos) - CURVA EXATA */}
                  <path d="M20,125 Q30,122 40,118 Q50,114 60,110 Q70,106 80,102 Q90,98 100,95 Q110,92 120,96 Q130,100 140,105 Q150,110 160,115 Q170,120 180,118 Q190,116 200,110 Q210,104 220,98 Q230,92 240,88 Q250,84 260,82 Q270,80 280,78 Q290,76 300,75 Q310,74 320,73 Q330,72 340,71 Q345,70.5 345,70" 
                        stroke="#f87171" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Linha vertical pontilhada mostrando onde a data 16/07/2026 está conectada */}
                  <line x1="340" y1="30" x2="340" y2="135" stroke="#f87171" strokeWidth="2" strokeDasharray="4,4" opacity="0.7"/>
                  
                  {/* Marcador circular no ponto de conexão */}
                  <circle cx="340" cy="71" r="3" fill="#f87171" opacity="0.8"/>
                </svg>
                
                {/* Data centralizada EXATAMENTE como na imagem */}
                <div className="absolute top-2 sm:top-3 lg:top-4 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm lg:text-base text-gray-500 font-medium">15/07/2026</div>
                
                {/* Legendas posicionadas com cores corretas */}
                <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 left-2 sm:left-4 lg:left-6 text-xs sm:text-sm lg:text-base text-[#1e40af] font-medium">
                  Verde: Valor disponível
                </div>
                <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 right-2 sm:right-4 lg:right-6 text-xs sm:text-sm lg:text-base text-[#f87171] font-medium">
                  Vermelho: Gastos
                </div>
                
                {/* Data rosa posicionada com linha conectora */}
                <div className="absolute bottom-6 sm:bottom-8 lg:bottom-10 right-2 sm:right-4 lg:right-6 text-xs sm:text-sm lg:text-base text-[#f87171] font-medium">16/07/2026</div>
                
                {/* Linha conectando a data final com o gráfico */}
                <svg className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-12 sm:right-16 lg:right-20 w-6 sm:w-7 lg:w-8 h-3 sm:h-3.5 lg:h-4" viewBox="0 0 32 16">
                  <line x1="0" y1="8" x2="28" y2="8" stroke="#f87171" strokeWidth="2" strokeDasharray="2,2"/>
                  <circle cx="30" cy="8" r="2" fill="#f87171"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Últimos Gastos */}
          <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">Últimos Gastos:</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Aqui você pode ver onde está indo os fundos:</p>
              </div>
              <span className="text-gray-400 self-start sm:self-center">...</span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">- R$ 539 Área da saúde</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">17/07/2026 08:17</div>
                  <button className="text-xs text-blue-600 hover:underline touch-manipulation">Ver mais...</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">- R$ 777 Secretaria</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">17/07/2026 08:17</div>
                  <button className="text-xs text-blue-600 hover:underline touch-manipulation">Ver mais...</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">- R$ 4.000 Reforma</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">16/07/2026 08:15</div>
                  <button className="text-xs text-blue-600 hover:underline touch-manipulation">Ver mais...</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">- R$ 777,07 Sabesp</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">16/07/2026 06:10</div>
                  <button className="text-xs text-blue-600 hover:underline touch-manipulation">Ver mais...</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-0 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">+777,777,77 Verba</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs text-gray-500">15/07/2026 06:09</div>
                  <button className="text-xs text-blue-600 hover:underline touch-manipulation">Ver mais...</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

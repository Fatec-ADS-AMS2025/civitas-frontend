'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

/**
 * Hook público de autenticação (MVP).
 * Expõe usuário atual, estado e ações de login/logout.
 */
export default function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}

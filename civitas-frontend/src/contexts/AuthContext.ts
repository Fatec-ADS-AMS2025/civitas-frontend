'use client'

import { createContext, createElement, useCallback, useEffect, useMemo, useState } from 'react'

type AuthUser = {
  id: string
  nome: string
}

type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; message: string }

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

type AuthProviderProps = {
  children: React.ReactNode
}

type ApiEnvelope<T = unknown> = {
  message?: string
  data?: T
}

type AnyRecord = Record<string, unknown>

export const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'auth_user'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5210/api'

const removeTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const buildLoginUrls = () => {
  const normalizedBaseUrl = removeTrailingSlash(BASE_URL)
  const rootWithoutApi = normalizedBaseUrl.replace(/\/api$/i, '')

  const urls = [
    `${normalizedBaseUrl}/auth/login`,
    `${rootWithoutApi}/api/auth/login`,
    `${rootWithoutApi}/auth/login`
  ]

  return Array.from(new Set(urls))
}

/**
 * Converte qualquer resposta em um objeto de usuário seguro para o MVP.
 * Persistimos apenas { id, nome }.
 */
function normalizeUserFromResponse(payload: unknown): AuthUser | null {
  const envelope = (payload ?? {}) as ApiEnvelope<unknown> & AnyRecord
  const rawData = (envelope.data ?? payload ?? {}) as AnyRecord
  const userNode = ((rawData.usuario as AnyRecord | undefined) ??
    (rawData.user as AnyRecord | undefined) ??
    rawData) as AnyRecord

  const id =
    userNode?.id ??
    userNode?.idUsuario ??
    userNode?.usuarioId ??
    userNode?.userId ??
    null

  const nome =
    userNode?.nome ??
    userNode?.name ??
    userNode?.nomeUsuario ??
    userNode?.usuario ??
    null

  if (id === null || id === undefined || !nome) {
    return null
  }

  return {
    id: String(id),
    nome: String(nome)
  }
}

/**
 * Faz login no backend em /api/auth/login.
 * Envia chaves compatíveis para evitar erro por diferença de contrato
 * (senha/password), sem persistir dados sensíveis.
 */
async function requestLogin(email: string, password: string): Promise<AuthUser> {
  const loginUrls = buildLoginUrls()
  let lastError: unknown = null

  for (const loginUrl of loginUrls) {
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          senha: password,
          password,
          login: email,
          usuario: email
        })
      })

      const contentType = response.headers.get('content-type') || ''
      let body: unknown = null
      let textBody = ''

      if (contentType.includes('application/json')) {
        try {
          body = await response.json()
        } catch {
          body = null
        }
      } else {
        try {
          textBody = await response.text()
        } catch {
          textBody = ''
        }
      }

      if (!response.ok) {
        const bodyAsRecord = (body as AnyRecord | null) ?? null
        const apiMessage = String((bodyAsRecord?.message as string | undefined) ?? textBody ?? '').toLowerCase()

        console.error('Falha HTTP no login:', {
          url: loginUrl,
          status: response.status,
          message: (bodyAsRecord?.message as string | undefined) ?? textBody ?? ''
        })

        if (
          response.status === 401 ||
          response.status === 403 ||
          apiMessage.includes('inválid') ||
          apiMessage.includes('invalid')
        ) {
          throw new Error('INVALID_CREDENTIALS')
        }

        // Se for 404/405, tenta a próxima variação de URL
        if (response.status === 404 || response.status === 405) {
          lastError = new Error(`HTTP_${response.status}`)
          continue
        }

        throw new Error(`HTTP_${response.status}`)
      }

      const user = normalizeUserFromResponse(body)

      if (!user) {
        console.error('Resposta de login sem usuário válido:', {
          url: loginUrl,
          body
        })
        lastError = new Error('INVALID_LOGIN_RESPONSE')
        continue
      }

      console.log('Endpoint de login utilizado:', loginUrl)
      return user
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        throw error
      }

      console.error('Erro técnico ao tentar login:', {
        url: loginUrl,
        error
      })

      lastError = error
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('SERVER_ERROR'))
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Carrega usuário persistido no localStorage ao iniciar a aplicação
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)

      if (!storedUser) {
        setIsLoadingUser(false)
        return
      }

      const parsedUser = JSON.parse(storedUser) as AnyRecord

      const hasValidShape =
        parsedUser &&
        typeof parsedUser.id === 'string' &&
        typeof parsedUser.nome === 'string'

      if (hasValidShape) {
        setUser({
          id: String(parsedUser.id),
          nome: String(parsedUser.nome)
        })
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const safeUser = await requestLogin(email, password)

      // Persistência local mínima obrigatória
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
      setUser(safeUser)

      console.log('Login realizado com sucesso:', safeUser)

      return { success: true, user: safeUser }
    } catch (error) {
      console.error('Falha no login:', error)

      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return { success: false, message: 'Usuário ou senha inválidos' }
      }

      return { success: false, message: 'Erro ao conectar com o servidor' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    console.log('Logout realizado com sucesso')
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingUser,
      login,
      logout
    }),
    [user, isLoadingUser, login, logout]
  )

  return createElement(AuthContext.Provider, { value }, children)
}

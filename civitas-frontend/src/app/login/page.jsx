'use client'

import { useState } from 'react'
import Link from 'next/link'
import Checkbox from '@/components/checkbox'
import { useAppNavigation } from '@/hooks/useNavigationProgress'
import { Input } from '@/components/Input'
import useAuth from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { login, isLoading, error: generalError, clearError } = useAuth()

  const handleLogin = async (event) => {
    event.preventDefault()
    if (loading) return

    const nextErrors = { email: '', password: '' }

    if (!email.trim()) {
      nextErrors.email = 'Informe o e-mail'
    }

    if (!password.trim()) {
      nextErrors.password = 'Informe a senha'
    }

    setErrors(nextErrors)
    setGeneralError('')

    if (nextErrors.email || nextErrors.password) {
      return
    }

    setLoading(true)
    try {
      const result = await login(email.trim(), password)

      if (!result.success) {
        setGeneralError(result.message)
        return
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Erro inesperado no fluxo de login:', error)
      setGeneralError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F8F8]">
      <div className="mx-auto flex h-full w-full max-w-[1320px] flex-1 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="m-0 hidden w-1/2 items-center justify-center rounded-[28px] border border-[#E4EEF0] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.04)] lg:m-3 lg:flex">
          <div className="flex w-full flex-col items-center">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#1F2A32]">Bem-vindo ao <span className="text-[#004C57]">Civitas</span></h1>
            </div>
            <div className="flex w-full justify-center">
              <img src="/mnote.png" alt="Pessoa usando notebook" className="h-auto w-full max-w-md" />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-3 sm:p-4 lg:w-1/2 lg:p-6">
          <div className="w-full max-w-md rounded-[28px] border border-[#E4EEF0] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <img src="/logo1.png" alt="Civitas Logo" className="h-10 w-10 object-contain" />
                <span className="font-semibold text-[#004C57]">Civitas</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-[#1F2A32] sm:text-5xl">Login</h2>
              <p className="text-sm text-[#72808A]">Sistema de <span className="font-semibold">Gerenciamento</span> da Prefeitura de Jales</p>
            </div>

            <form onSubmit={handleLogin} noValidate aria-busy={isLoading} className="space-y-5">
              {generalError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{generalError}</div>}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite o seu E-mail"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (errors.email) setErrors((current) => ({ ...current, email: '' }))
                    if (generalError) clearError()
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  error={errors.email}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Senha</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a sua Senha"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (errors.password) setErrors((current) => ({ ...current, password: '' }))
                    if (generalError) clearError()
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  error={errors.password}
                />
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Checkbox id="rememberMe" label="Lembrar-me" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} />
                <Link href="/forgot-password" className="text-sm font-medium text-[#5D6A72] underline hover:text-[#004C57]">Esqueci a senha</Link>
              </div>

              <button type="submit" disabled={isLoading} className="mt-8 w-full rounded-2xl bg-[#004C57] px-4 py-3 font-bold text-white transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Entrando...' : 'Acessar Conta'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#5D6A72]">Ainda nao tem conta? <Link href="/signup" className="font-bold text-[#004C57] underline hover:brightness-110">Criar conta</Link></p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-3 w-full bg-[#004C57]" />
    </div>
  )
}

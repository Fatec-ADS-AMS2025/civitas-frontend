'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Checkbox from '@/components/checkbox'
import { Input } from '@/components/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Estados para validação, erro geral e carregamento + router
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setGeneralError('')
    const newErrors = { email: '', password: '' }

    if (!email.trim()) newErrors.email = 'E-mail é obrigatório.'
    if (!password.trim()) newErrors.password = 'Senha é obrigatória.'

    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    // Fallback seguro para URL da API
    const baseUrlEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')
    const baseUrl =
      baseUrlEnv || (typeof window !== 'undefined' ? window.location.origin : '')

    if (!baseUrl) {
      setGeneralError('Configuração da API ausente. Defina NEXT_PUBLIC_API_URL.')
      return
    }

    setLoading(true)
    try {
      const url = `${baseUrl}/auth/login`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      })

      if (!res.ok) {
        let message = 'Credenciais inválidas. Verifique e tente novamente.'
        try {
          const data = await res.json()
          if (data?.message) message = data.message
        } catch {}
        setGeneralError(message)
        return
      }

      // Caso o back retorne um destino, respeita; senão vai para /dashboard
      let redirectTo = '/dashboard'
      try {
        const data = await res.json()
        if (data?.redirectTo) redirectTo = data.redirectTo
      } catch {}
      router.push(redirectTo)
    } catch {
      setGeneralError('Não foi possível conectar ao servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <div className="container mx-auto max-w-screen-xl px-4 flex flex-1">
        {/* Left Section - Illustration */}
        <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-8 rounded-3xl m-8">
          <div className="w-full flex flex-col items-center">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Bem-vindo ao <span className="text-teal-700">Civitas</span>
              </h1>
            </div>
            
            {/* Illustration */}
            <div className="flex justify-center w-full">
              <img src="/mnote.png" alt="Woman with laptop" className="w-full max-w-md h-auto" />
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo1.png" alt="Civitas Logo" className="w-10 h-10 object-contain" />
                <span className="text-teal-700 font-semibold">Civitas</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Login</h2>
              <p className="text-gray-600 text-sm">
                Sistema de <span className="font-semibold">Gerenciamento</span> da Prefeitura de Jales
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate className="space-y-5">
              {/* Mensagem de erro geral */}
              {generalError && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {generalError}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite o seu E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a sua Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-2 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mt-6">
                <Checkbox
                  id="rememberMe"
                  label="Lembrar-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading} // desabilita durante requisição
                />
                <Link href="/forgot-password" className="text-gray-700 text-sm font-medium underline hover:text-teal-700">
                  Esqueci a senha
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-4 rounded-full transition duration-200 mt-8 text-base disabled:opacity-60 disabled:cursor-not-allowed relative"
              >
                {loading ? 'Entrando...' : 'Acessar Conta'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-700 text-sm">
                Ainda não tem conta?{' '}
                <Link href="/signup" className="text-teal-700 font-bold underline hover:text-teal-800">
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="h-10 bg-teal-700"></div>
    </div>
  )
}

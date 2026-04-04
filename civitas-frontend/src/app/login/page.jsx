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
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full h-full px-4 flex flex-1">
        <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-8 rounded-3xl m-8">
          <div className="w-full flex flex-col items-center">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Bem-vindo ao <span className="text-teal-700">Civitas</span>
              </h1>
            </div>

            <div className="flex justify-center w-full">
              <img
                src="/mnote.png"
                alt="Woman with laptop"
                className="w-full max-w-md h-auto"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/logo1.png"
                  alt="Civitas Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-teal-700 font-semibold">Civitas</span>
              </div>

              <h2 className="text-5xl font-bold text-gray-900 mb-4">Login</h2>

              <p className="text-gray-600 text-sm">
                Sistema de <span className="font-semibold">Gerenciamento</span> da Prefeitura de Jales
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-5">
              {generalError && (
                <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {generalError}
                </div>
              )}

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
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

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
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between mt-6">
                <Checkbox
                  id="rememberMe"
                  label="Lembrar-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <Link
                  href="/forgot-password"
                  className="text-gray-700 text-sm font-medium underline hover:text-teal-700"
                >
                  Esqueci a senha
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-4 rounded-full transition duration-200 mt-8 text-base"
              >
                Acessar Conta
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-700 text-sm">
                Ainda não tem conta?{' '}
                <Link
                  href="/signup"
                  className="text-teal-700 font-bold underline hover:text-teal-800"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-10 fixed bottom-0 left-0 right-0 bg-teal-700"></div>
    </div>
  )
}

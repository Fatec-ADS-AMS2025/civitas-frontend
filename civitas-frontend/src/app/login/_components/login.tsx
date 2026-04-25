'use client'

import { useState } from 'react'
import Link from 'next/link'
import Checkbox from '@/components/checkbox'
import { Input } from '@/components/Input'
import useAuth from '@/hooks/useAuth'
import { useAppNavigation } from '@/hooks/useNavigationProgress'

type FormErrors = {
	email: string
	password: string
}

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [rememberMe, setRememberMe] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' })

	const { push } = useAppNavigation()
	const { login, isLoading, error: generalError, clearError } = useAuth()

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (isLoading) return

		const nextErrors: FormErrors = { email: '', password: '' }

		if (!email.trim()) {
			nextErrors.email = 'Informe o e-mail'
		}

		if (!password.trim()) {
			nextErrors.password = 'Informe a senha'
		}

		setErrors(nextErrors)
		clearError()

		if (nextErrors.email || nextErrors.password) {
			return
		}

		try {
			const result = await login({ email: email.trim(), password })

			if (!result) {
				return
			}

			push('/dashboard')
		} catch (error) {
			console.error('Erro inesperado no fluxo de login:', error)
		}
	}

	return (
		<div className="flex w-full items-center justify-center p-3 sm:p-4 lg:w-1/2 lg:p-6">
			<div className="w-full max-w-md rounded-[28px] p-6 sm:p-8">
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
	)
}

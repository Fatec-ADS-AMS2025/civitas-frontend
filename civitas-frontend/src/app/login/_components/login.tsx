'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Checkbox from '@/components/checkbox'
import Button from '@/components/button'
import { Input } from '@/components/Input'
import useAuth from '@/hooks/useAuth'
import { useAppNavigation } from '@/hooks/useNavigationProgress'
import { credentialsStorage } from '@/lib/auth-storage'

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

	useEffect(() => {
		const savedCredentials = credentialsStorage.get()

		if (!savedCredentials) {
			return
		}

		setEmail(savedCredentials.email)
		setPassword(savedCredentials.password)
		setRememberMe(true)
	}, [])

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
			const normalizedEmail = email.trim()
			const result = await login({ email: normalizedEmail, password })

			if (!result) {
				return
			}

			if (rememberMe) {
				credentialsStorage.set({
					email: normalizedEmail,
					password,
				})
			} else {
				credentialsStorage.clear()
			}

			push('/dashboard')
		} catch (error) {
			console.error('Erro inesperado no fluxo de login:', error)
		}
	}

	return (
		<div className="flex min-h-screen w-full overflow-x-hidden items-start justify-center bg-[var(--secundary-1)] px-4 py-8 sm:px-5 sm:py-10 lg:w-1/2 lg:items-center lg:px-8 lg:py-12">
			<div className="w-full max-w-[min(28rem,calc(100vw-2rem))] rounded-sm border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)] sm:max-w-md sm:p-8">
				<div className="mb-8">
					<div className="mb-6 flex items-center gap-3">
						<img src="/logo1.png" alt="Civitas Logo" className="h-10 w-10 object-contain" />
						<span className="font-semibold text-[var(--secundary-1)]">Civitas</span>
					</div>
					<h2 className="mb-3 text-[30px] font-semibold text-[var(--foreground)] sm:text-[34px]">Entrar</h2>
					<p className="text-sm text-[var(--foreground-muted)]">Sistema de gerenciamento da Prefeitura de Jales</p>
				</div>

				<form onSubmit={handleLogin} noValidate aria-busy={isLoading} className="space-y-5">
					{generalError && <div className="civitas-error-banner px-3 py-2.5 text-sm">{generalError}</div>}

					<Input
						id="email"
						type="email"
						label="E-mail"
						placeholder="Informe o e-mail"
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

					<Input
						id="password"
						type="password"
						label="Senha"
						placeholder="Informe a senha"
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

					<div className="mt-6 flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
						<Checkbox id="rememberMe" label="Lembrar-me" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} />
						<Link href="/forgot-password" className="w-full text-left text-sm font-medium text-[var(--foreground-muted)] underline underline-offset-2 hover:text-[var(--secundary-1)] sm:w-auto sm:text-right">Esqueci a senha</Link>
					</div>

					<Button type="submit" variant="login" disabled={isLoading} className="mt-6 max-w-none">
						{isLoading ? 'Entrando...' : 'Entrar'}
					</Button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-[var(--foreground-muted)]">Ainda nao tem conta? <Link href="/signup" className="font-semibold text-[var(--secundary-1)] underline hover:brightness-110">Criar conta</Link></p>
				</div>
			</div>
		</div>
	)
}

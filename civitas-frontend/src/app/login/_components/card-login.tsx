export default function CardLogin() {
	return (
		<div className="m-0 hidden w-1/2 items-center justify-center border-r border-[var(--border-soft)] bg-[var(--surface-subtle)] p-8 lg:flex">
			<div className="flex w-full flex-col items-center">
				<div className="mb-8 text-center">
					<p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--foreground-soft)]">Acesso ao sistema</p>
					<h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Painel administrativo <span className="text-[var(--secundary-1)]">Civitas</span></h1>
					<p className="mt-3 text-sm text-[var(--foreground-muted)]">Ambiente interno para operacao e acompanhamento da prefeitura.</p>
				</div>
				<div className="flex w-full justify-center">
					<img src="/mnote.png" alt="Pessoa usando notebook" className="h-auto w-full max-w-md opacity-95" />
				</div>
			</div>
		</div>
	)
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-page)] px-4 py-10 text-[var(--foreground)]">
      <section className="civitas-surface w-full max-w-lg rounded-sm p-6 text-center shadow-[var(--shadow-md)]">
        <p className="text-sm font-semibold uppercase text-[var(--foreground-soft)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Pagina nao encontrada</h1>
        <p className="mt-3 text-sm text-[var(--foreground-muted)]">
          O endereco acessado nao existe ou foi movido.
        </p>
        <Link
          href="/dashboard"
          className="civitas-action civitas-action--primary mt-6 inline-flex min-h-[44px] items-center justify-center rounded-sm px-5"
        >
          Voltar ao dashboard
        </Link>
      </section>
    </main>
  );
}

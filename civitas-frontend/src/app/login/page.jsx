import CardLogin from './_components/card-login'
import Login from './_components/login'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="mx-auto flex h-full flex-1 w-full relative">
        <CardLogin />
        <Login />
        <div className="absolute bottom-0 h-2 w-full bg-[var(--secundary-1)]" />
      </div>

    </div>
  )
}

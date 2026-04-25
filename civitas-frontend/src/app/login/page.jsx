import CardLogin from './_components/card-login'
import Login from './_components/login'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="mx-auto flex h-full flex-1 w-full relative">
        <CardLogin />
        <Login />
        <div className="h-2 absolute bottom-0 w-full bg-[#004C57]" />
      </div>

    </div>
  )
}

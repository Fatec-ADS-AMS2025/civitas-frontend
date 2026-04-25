import CardLogin from './_components/card-login'
import Login from './_components/login'

export default function LoginPage() {
  return (
    <div className="h-screen w-full bg-[#F4F8F8]">
      <div className="mx-auto flex h-full flex-1 w-full relative">
        <CardLogin />
        <Login />
        <div className="h-3 absolute bottom-0 w-full bg-[#004C57]" />
      </div>

    </div>
  )
}

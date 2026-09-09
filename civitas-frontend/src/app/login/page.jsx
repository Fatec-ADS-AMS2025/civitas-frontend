import CardLogin from "./_components/card-login";
import Login from "./_components/login";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)]">
      <div className="relative mx-auto flex min-h-screen w-full overflow-x-hidden">
        <CardLogin />
        <Login />
        <div className="absolute bottom-0 hidden h-2 w-full bg-[var(--secundary-1)] lg:block" />
      </div>
    </div>
  );
}

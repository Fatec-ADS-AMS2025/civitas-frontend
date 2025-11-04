// Script Node para registrar o usuário de teste via API REST do back-end.
// Ajuste NEXT_PUBLIC_API_URL no .env.local do front (ex.: http://localhost:3000)
// Opcional: ajuste NEXT_PUBLIC_REGISTER_PATH se seu endpoint for diferente.

const REGISTER_PATH = process.env.NEXT_PUBLIC_REGISTER_PATH || '/auth/register'
const TEST_EMAIL = 'teste@gmail.com'
const TEST_PASSWORD = 'Fiot@!3' // ATENÇÃO: precisa bater com a senha usada no login

function getBaseUrl() {
  const env = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  return env || 'http://localhost:3000'
}

async function main() {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${REGISTER_PATH}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: 'Usuário Teste',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    })

    if (!res.ok) {
      let msg = `Falha ao registrar (${res.status})`
      try {
        const data = await res.json()
        if (data?.message) msg = data.message
        if (res.status === 409 || /exist|já existe/i.test(msg)) {
          console.log('Usuário já existe. Pronto para usar no login.')
          return
        }
      } catch {}
      console.error(msg)
      process.exit(1)
    }

    console.log('Usuário de teste criado com sucesso:', TEST_EMAIL)
  } catch (err) {
    console.error('Erro de conexão com a API:', err?.message || err)
    process.exit(1)
  }
}

main()

# Padronização: 
Aqui será apresentado algumas das padronizações que devem ser seguidas.

---

## 🧭 Guia de Padronização de Nomes - Next.js

Este documento define as regras de **nomenclatura e organização de arquivos** para manter o código limpo, previsível e fácil de manter em projetos **Next.js**.

### 📁 1. Pastas e Arquivos

Todos os nomes de **pastas e arquivos** devem ser escritos em **minúsculas**, utilizando **hífens (`-`)** para separar palavras.

#### ✅ Exemplo Correto:

/app
/user-profile
page.tsx
/dashboard
/vehicle-list
page.tsx

### ❌ Exemplo Incorreto:

/UserProfile/page.tsx
/User_Profile/page.tsx


> **Motivo:** manter compatibilidade entre sistemas operacionais e seguir o padrão usado pelo próprio Next.js.

---

## ⚛️ 2. Componentes React

Os **componentes React** devem seguir o padrão **PascalCase**, ou seja, cada palavra começa com letra maiúscula e não há separadores.

### ✅ Exemplo:
```tsx
export function UserProfileCard() {
  return <div>Perfil</div>;
}

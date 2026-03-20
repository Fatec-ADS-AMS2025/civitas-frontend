"use client"
import React, { useRef } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/sidebar';
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const paiRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname() || "/dashboard";
  const parts = pathname.split("/").filter(Boolean);
  const currentPage = parts[parts.length - 1] ?? "dashboard";
  const isDespesasPage = pathname === "/dashboard/despesas";

  const pageMeta: Record<string, { title: string; breadcrumbs: string[] }> = {
    dashboard: {
      title: "Dashboard",
      breadcrumbs: ["Home"],
    },
    despesas: {
      title: "Listagem de Despesa",
      breadcrumbs: ["Home", "Listagem", "Tipo Despesa"],
    },
    secretaria: {
      title: "Secretaria",
      breadcrumbs: ["Home", "Secretaria"],
    },
    instituicoes: {
      title: "Instituições",
      breadcrumbs: ["Home", "Instituições"],
    },
    fornecedor: {
      title: "Fornecedor",
      breadcrumbs: ["Home", "Fornecedor"],
    },
    fornecedores: {
      title: "Fornecedores",
      breadcrumbs: ["Home", "Fornecedores"],
    },
    orcamentos: {
      title: "Orçamentos",
      breadcrumbs: ["Home", "Orçamentos"],
    },
    usuarios: {
      title: "Usuários",
      breadcrumbs: ["Home", "Usuários"],
    },
  };

  const currentMeta = pageMeta[currentPage] ?? {
    title: currentPage,
    breadcrumbs: parts.map((item) => item.charAt(0).toUpperCase() + item.slice(1)),
  };

  const alterarPagina = (item: string) => {
    const paths = pathname.split("/");
    let novasRotas: any = []

    for (let i = 0; i < (paths.length - 1); i++) {
      novasRotas += (`${paths[i]}/`)
    }

    if (item == "dashboard") {
      const novaRota = `${novasRotas}`
      router.push(novaRota)
    } else {
      const novaRota = `${novasRotas}${item}`
      router.push(novaRota)
    }
  }

  return (
    <div className="flex w-full min-h-screen">

      <Sidebar />

      <div
        ref={paiRef}
        className="flex-1 w-[calc(100%-80px)] p-6 sm:ml-[80px]"
      >

        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-[#004D4D] capitalize'>
            {parts[parts.length - 1]}
          </h1>

          <div className='flex gap-1'>
            {parts.map((item, index) => (
              <span
                key={index}
                onClick={() => alterarPagina(item)}
                className='text-sm text-gray-500 mt-1 capitalize opacity-80 transition-all duration-300 cursor-pointer'
              >
                {item}
                {index < parts.length - 1 && " > "}
              </span>
            ))}
          </div>

        </div>

        {children}

      </div>

    </div>
  )
}
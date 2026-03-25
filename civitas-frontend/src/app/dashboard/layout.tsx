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
      title: "Instituicoes",
      breadcrumbs: ["Home", "Instituicoes"],
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
      title: "Orcamentos",
      breadcrumbs: ["Home", "Orcamentos"],
    },
    financeiro: {
      title: "Financeiro",
      breadcrumbs: ["Home", "Financeiro"],
    },
    usuarios: {
      title: "Usuarios",
      breadcrumbs: ["Home", "Usuarios"],
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
    <div className="flex w-full min-h-screen bg-[#F8FAFA]">

      <Sidebar />

      <div
        ref={paiRef}
        className="w-full flex-1 sm:ml-[82px]"
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 pt-6 lg:px-7 2xl:px-10">
          <div className='mb-7'>
            <h1 className='text-[34px] font-bold text-[#004D4D] capitalize lg:text-[38px]'>
              {currentMeta.title}
            </h1>

            <div className='mt-1 flex flex-wrap gap-1'>
              {parts.map((item, index) => (
                <span
                  key={index}
                  onClick={() => alterarPagina(item)}
                  className='text-sm text-gray-500 capitalize opacity-80 transition-all duration-300 cursor-pointer'
                >
                  {item}
                  {index < parts.length - 1 && " > "}
                </span>
              ))}
            </div>

          </div>

          <div className='w-full'>
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

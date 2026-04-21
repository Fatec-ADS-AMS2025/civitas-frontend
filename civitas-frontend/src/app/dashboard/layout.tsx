"use client"
import React, { useRef } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/sidebar';
import { useAppNavigation } from "@/hooks/useNavigationProgress";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const paiRef = useRef<HTMLDivElement>(null);

  const router = useAppNavigation();
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
    configuracoes: {
      title: "Configuracoes",
      breadcrumbs: ["Home", "Configuracoes"],
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

  const alterarPagina = (index: number) => {
    const target = `/${parts.slice(0, index + 1).join("/")}`;
    router.push(target);
  }

  return (
    <div className="dashboard-shell flex min-h-screen w-full bg-[#F8FAFA]">

      <Sidebar />

      <div
        ref={paiRef}
        data-contrast-target="content"
        className="w-full flex-1 sm:ml-[92px] lg:pr-[78px] 2xl:pr-[86px]"
      >
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-8 pt-5 sm:px-5 lg:px-8 lg:pt-6 2xl:px-10">
          <div className='mb-6 sm:mb-7'>
            <h1 className='text-[30px] font-bold capitalize text-[#004D4D] sm:text-[34px] lg:text-[38px]'>
              {currentMeta.title}
            </h1>

            <div className='mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1'>
              {parts.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => alterarPagina(index)}
                  className='cursor-pointer text-sm capitalize text-[#718089] opacity-90 transition-colors duration-200 hover:text-[#004D4D] hover:opacity-100'
                >
                  {item}
                  {index < parts.length - 1 && <span className="px-1 text-[#9AA8B0]">/</span>}
                </button>
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

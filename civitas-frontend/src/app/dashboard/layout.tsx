"use client"
import React, { useRef } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/sidebar';
import { useRouter } from "next/navigation";
// import { alterLoading, loading } from '@/global/useLoading';


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paiRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname() || "/dashboard"; // pega a rota atual
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

  // useEffect(() => {
  //   if (!paiRef.current) return;

  //   // adiciona a classe skeleton a todos os divs do pai
  //   const divs = paiRef.current.getElementsByClassName("skeleton");

  //   // depois de 2s, remove o skeleton
  //   const timer = setTimeout(() => {
  //     Array.from(divs).forEach(div => div.classList.remove("skeleton"));
  //     alterLoading(false);
  //   }, 2000);

  //   alterLoading(false);
  //   return () => clearTimeout(timer);
  // }, [pathname, loading]);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 px-4 py-6 sm:ml-[80px] sm:px-8' ref={paiRef}>
        <div className='mb-8'>
          {isDespesasPage ? (
            <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
              <div>
                <h1 className='text-4xl font-semibold tracking-tight text-secundary-1 sm:text-5xl'>
                  {currentMeta.title}
                </h1>
                <div className='mt-2 flex flex-wrap gap-1 text-sm text-gray-400'>
                  {currentMeta.breadcrumbs.map((item, index) => (
                    <span key={item} className='transition-colors duration-200 hover:text-secundary-1'>
                      {item}
                      {index < currentMeta.breadcrumbs.length - 1 && " > "}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                    return;
                  }
                  router.push("/dashboard");
                }}
                className='inline-flex items-center gap-2 self-start text-base font-medium text-black transition-colors hover:text-secundary-1 cursor-pointer'
              >
                <span className="material-symbols-outlined !text-[20px]">arrow_back</span>
                Voltar
              </button>
            </div>
          ) : (
            <>
              <h1 className='text-4xl font-bold text-[#004D4D] capitalize'>{currentMeta.title}</h1>
              <div className='mt-1 flex gap-1'>
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
            </>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

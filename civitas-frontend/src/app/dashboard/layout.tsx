"use client"
import React, { useEffect, useState, useRef } from 'react'
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
  const [loading, alterLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname() || "/dashboard"; // pega a rota atual
  const parts = pathname.split("/").filter(Boolean);

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

  useEffect(() => {
    if (!paiRef.current) return;

    // adiciona a classe skeleton a todos os divs do pai
    const divs = paiRef.current.getElementsByClassName("skeleton");

    // depois de 2s, remove o skeleton
    const timer = setTimeout(() => {
      Array.from(divs).forEach(div => div.classList.remove("skeleton"));
      alterLoading(false);
    }, 2000);

    alterLoading(true);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className='flex'>
      <Sidebar />
      <main id="main-content" className='flex-1 p-6 sm:ml-[80px]' ref={paiRef} role="main">
        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-[#004D4D] capitalize'>{parts[parts.length - 1]}</h1>
          <nav aria-label="Breadcrumb" className='mt-1'>
            <ol className='flex gap-1 list-none p-0 m-0'>
              {parts.map((item, index) => (
                <li key={index} className='flex items-center'>
                  {index < parts.length - 1 ? (
                    <>
                      <button
                        onClick={() => alterarPagina(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alterarPagina(item); } }}
                        className='text-sm text-gray-500 capitalize opacity-80 transition-all duration-300 cursor-pointer hover:text-gray-700 hover:underline bg-transparent border-none p-0 focus-visible:text-gray-900 focus-visible:underline'
                        type="button"
                      >
                        {item}
                      </button>
                      <span className='text-sm text-gray-400 mx-1' aria-hidden="true">&gt;</span>
                    </>
                  ) : (
                    <span
                      className='text-sm text-gray-500 capitalize opacity-80'
                      aria-current="page"
                    >
                      {item}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        {children}
      </main>
    </div>
  )
}

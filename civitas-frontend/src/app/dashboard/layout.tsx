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
      <div className='flex-1 p-6 sm:ml-[80px]' ref={paiRef}>
        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-[#004D4D] capitalize'>{parts[parts.length - 1]}</h1>
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

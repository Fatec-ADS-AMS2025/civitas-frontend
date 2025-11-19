"use client"
import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar/sidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [base, setBase] = useState<string>("Dashboard");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBase(window.location.pathname);
    }
  }, []);

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-6 sm:ml-[80px]'>
        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-[#004D4D] capitalize'>{base.split("/").pop()}</h1>
          <div className='flex'>
            {(base.split("/")).map((item, index) => (
              <span key={index} className='text-sm text-gray-500 mt-1'>
                {index >= base.split("/").length ? `${item} > ` : `${item}`}
              </span>
            ))}
          </div>

        </div>
        {children}
      </div>
    </div>
  )
}

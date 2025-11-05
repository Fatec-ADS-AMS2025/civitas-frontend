import React from 'react'
import Sidebar from '@/components/Sidebar/sidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex relative'>
      <Sidebar />
      <div className='flex-1 ml-[80px] relative z-10'>
        {children}
      </div>
    </div>
  )
}

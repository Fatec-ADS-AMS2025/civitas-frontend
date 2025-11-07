import React from 'react'
import Sidebar from '@/components/Sidebar/sidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-6 ml-[80px]'>
        {children}
      </div>
    </div>
  )
}

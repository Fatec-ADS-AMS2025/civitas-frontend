import React from 'react'
import Sidebar from '@/components/Sidebar/sidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Sidebar />
      <div className='pt-20 sm:pt-4 sm:ml-[80px] p-4 sm:p-6'>
        {children}
      </div>
    </div>
  )
}

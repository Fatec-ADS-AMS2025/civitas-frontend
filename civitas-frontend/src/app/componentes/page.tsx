import React from 'react'
import Teste from '@/components/teste'
import Sidebar from '@/components/Sidebar/sidebar'

function page() {
  return (
    <div className='flex flex-col w-screen h-screen items-center justify-center'>
      <Teste texto="Elemeto de teste" />
    </div>
  )
}

export default function SidebarPage() {
  return (
    <div className="flex">
      <Sidebar activeKey="home" />
      <main className="flex-1"></main>
    </div>
  );
}
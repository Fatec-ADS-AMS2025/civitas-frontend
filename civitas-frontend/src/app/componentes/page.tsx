import React from 'react'
import Teste from '@/components/teste'
import ButtonPage from '@/components/button'
export default function page() {
  return (
    
    <div className='flex flex-col w-screen h-screen items-center justify-center'>
      <Teste texto="Elemeto de teste" />
      <ButtonPage />
    </div>

  )
}

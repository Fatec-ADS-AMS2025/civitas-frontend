'use client';

import React, { useState } from 'react'
import Teste from '@/components/teste'
import Modal from '@/components/modal'

export default function page() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className='flex flex-col w-screen h-screen items-center justify-center'>
      <Teste texto="Elemeto de teste" />
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Abrir Modal
      </button>
      <Modal value={isModalOpen} setValue={setIsModalOpen}>
        <h1 className='text-2xl font-bold mb-4'>Conteúdo do Modal</h1>
        <p>Este é um exemplo de modal em React com TypeScript.</p>
      </Modal>
    </div>
  )
}
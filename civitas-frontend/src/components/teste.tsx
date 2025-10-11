import React from 'react'

type Props = {
    texto: string
}

export default function Teste({ texto }: Props) {
  return (
    <div className='p-2 bg-red-600 text-2xl font-bold rounded-md'>{texto}</div>
  )
}

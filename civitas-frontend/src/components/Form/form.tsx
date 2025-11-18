"use client"
import React, { useState } from 'react'
import Button from '../button'
import Input from '../Input'
import Image from 'next/image';

type FormProps = {
    camps?: any[];
    name?: string;
    object?: any;
    type?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
}

export default function Form({ camps, name, object, type, onCancel, onConfirm }: FormProps) {
    const [formData, setFormData] = useState<object>(object || {});

    const tipagem = object ? Object.keys(object) : camps;

    const contagem = tipagem?.length || 0;
    const tipoColunas = contagem <= 4 ? 'grid-cols-1' : contagem <= 8 ? 'grid-cols-2' : 'grid-cols-3';

    const imgs: { [key: string]: string } = {
        edit: '/imgsForm/image-edit.svg',
        view: '/imgsForm/image-view.svg',
        delete: '/imgsForm/image-delete.svg',
        create: '/imgsForm/image-add.svg'
    }

    const tipos: { [key: string]: string } = {
        edit: 'Editar',
        view: 'Visualizar',
        delete: 'Deletar',
        create: 'Criar'
    }

    return (
        <form className='flex flex-col' onSubmit={onConfirm}>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>{tipos[type ? type : 'create']} {name}</h1>
                <p className='text-gray-400'>Vamos lá, preencha os campos abaixo:</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2'>
                <div className='p-20'>
                    <Image src={imgs[type ? type : 'create']} alt={tipos[type ? type : 'create']} className='w-full h-full max-w-[600px] max-h-[400px]' width={100} height={100} />
                </div>
                <div className={`grid ${tipoColunas} gap-4 `}>
                    {tipagem?.map((it, index) => (
                        <React.Fragment key={index}>
                            {
                                it !== 'id' && tipagem && (
                                    <Input
                                        key={index}
                                        placeholder={tipagem[index]}
                                        required
                                        value={object[it] || ''}
                                        label={tipagem[index]}
                                        onChange={(e) => {
                                            setFormData({ ...formData, [it.id]: e.target.value });
                                        }}
                                    />
                                )
                            }
                        </React.Fragment>

                    ))}
                </div>
            </div>

            <div className='mt-4 gap-2 grid grid-cols-1 md:grid-cols-2'>
                {type !== 'view' ? <Button className='!w-full' type="submit">Confirmar</Button> : <div></div>}
                <Button variant='secondary' className='!w-full' onClick={onCancel}>Cancelar</Button>
            </div>
        </form>
    )
}

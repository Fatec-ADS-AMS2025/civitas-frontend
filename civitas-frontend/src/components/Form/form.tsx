"use client"
import React, { useState, useEffect } from 'react'
import Button from '../button'
import Input from '../Input'
import Image from 'next/image';

type FormProps = {
    camps?: any[];
    name?: string;
    object?: any;
    type?: string;
    onCancel?: () => void;
    onConfirm?: (data: any) => void;
}

export default function Form({ camps, name, object, type, onCancel, onConfirm }: FormProps) {
    const [formData, setFormData] = useState<any>(object || {});
    const [isLoading, setIsLoading] = useState(false);

    // Atualiza formData quando object muda
    useEffect(() => {
        setFormData(object || {});
    }, [object]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onConfirm) return;

        setIsLoading(true);
        try {
            await onConfirm(formData);
        } catch (error) {
            console.error('Erro no formulário:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    // Filtra campos que não devem aparecer no formulário
    const fieldsToHide = ['id', 'idSecretaria', 'idFornecedor', 'idOrcamento'];
    const visibleFields = tipagem?.filter((field: string) => !fieldsToHide.includes(field)) || [];

    return (
        <form className='flex flex-col' onSubmit={handleSubmit}>
            <div className='flex flex-col'>
                <h1 className='text-2xl font-semibold'>{tipos[type ? type : 'create']} {name}</h1>
                <p className='text-gray-400'>Vamos lá, preencha os campos abaixo:</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2'>
                <div className='p-20'>
                    <Image src={imgs[type ? type : 'create']} alt={tipos[type ? type : 'create']} className='w-full h-full max-w-[600px] max-h-[400px]' width={100} height={100} />
                </div>
                <div className={`grid ${tipoColunas} gap-2`}>
                    {visibleFields.map((field: string, index: number) => (
                        <Input
                            key={field}
                            placeholder={field}
                            required={type !== 'view'}
                            disabled={type === 'view' || type === 'delete'}
                            value={formData[field] || ''}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                        />
                    ))}
                </div>
            </div>

            <div className='mt-4 gap-2 grid grid-cols-1 md:grid-cols-2'>
                <Button variant='secondary' className='!w-full' onClick={onCancel}>
                    Cancelar
                </Button>
                {type !== 'view' ? (
                    <Button
                        className='!w-full'
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : 'Confirmar'}
                    </Button>
                ) : <div></div>}
            </div>
        </form>
    )
}

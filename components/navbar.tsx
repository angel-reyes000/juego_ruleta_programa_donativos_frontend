"use client"

import Link from 'next/link';
import { FaBars, FaPlus } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import logo from '@/public/images/5_y_Gana-removebg-preview.png';
import mini_ruleta from '../public/images/mini_ruleta.png'

const paths = [
    {
        id: 1,
        path: '/donar',
        name: "Donar", 
    },
    {
        id: 2,
        path: '/ruleta',
        name: 'Ruleta',
    },
    {
        id: 3,
        path: '/comoFunciona',
        name: 'Como funciona',
    },
    {
        id: 4,
        path: '/acercaDe',
        name: 'Acerca de',
    },
]

export default function NavBar () {
    const [openMenu, setOpenMenu] = useState<boolean>(false);

    const pathName = usePathname();
    const router = useRouter();

    const refModal = useRef<any>(null);

    useEffect(() => {

        const token = localStorage.getItem('token');    

        try {
            async function getDataUser () {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getDataUser`, {
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })

                const data = await response.json();

                if (response.status !== 200) {
                    refModal.current?.showModal();
                }

                console.log(data)
            }

            getDataUser();

        } catch (error) {
            console.log("Error in getDataUser navbar")
        }

    }, [])

    return (
        <>  
            <dialog ref={refModal} className='bg-[rgba(50,0,0,0.9)] m-auto rounded-md text-center w-[70%] sm;w-[50%] md:w-[40%] lg:w-[30%]'>
                <div className='flex flex-col p-5 gap-5'>
                    <div className='flex justify-start items-center w-full'>
                        <p onClick={() => router.push('/')} className='text-white cursor-pointer active:scale-90 hover:underline hover:text-blue-400'>{'< '}regresar</p>
                    </div>
                    <div className='flex justify-center w-full'>
                        <Image src={mini_ruleta} width={100} height={100} className='animation_mini_ruleta' alt='mini ruleta' />
                    </div>
                    <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
                        Tu sesion a expirado, inicia sesion para poder continuar!.
                    </p>
                    <div className='flex justify-center items-center w-full'>
                        <button onClick={() => router.push('/login')} className='p-2 w-[80%] rounded-md bg-gradient-to-r from-red-500 to-yellow-700 cursor-pointer active:scale-95 text-white'>
                            Iniciar sesion
                        </button>
                    </div>
                </div>
            </dialog>
            {/*--------------------------MENU FAKE------------------------------*/ }
            <div className='flex w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-3 px-6 z-8'>
                <Image onClick={() => router.push('/')} src={logo} height={50} width={50} className='text-white hidden sm:block' alt='logo de la pagina' />
                <FaBars size={50} className='text-white sm:hidden' />
                <nav className={'flex justify-end w-full'}>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'py-3 px-8 sm:block text-md rounded-4xl font-semibold hover:text-black hover:bg-[rgba(255,255,255,0.8)]' + (pathName === path.path ? ' text-black bg-[rgb(255,255,255,0.8)] ' : ' text-white ') + (openMenu ? ' block ' : 'hidden')}>{path.name}</Link>
                    ))}
                </nav>
            </div>
            {/*-----------------------MENU FLOTANTE ORIGINAL---------------------------*/}
            <header className={'flex sm:flex-row absolute fixed w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-5 sm:py-3 px-6 z-10 gap-5 sm:gap-0' + (openMenu ? ' flex-col items-start ' : '')}>
                <Image onClick={() => router.push('/')} src={logo} height={50} width={50} className='text-white hidden sm:block cursor-pointer' alt='logo de la pagina' />
                {openMenu ? (
                    <FaPlus onClick={() => setOpenMenu(!openMenu)} size={30} className='text-white sm:hidden rotate-45' />
                ):(
                    <FaBars onClick={() => setOpenMenu(!openMenu)} size={45} className='text-white sm:hidden' />
                )}
                <nav className={'flex sm:flex-row sm:gap-0 justify-end w-full' + (openMenu ? ' flex-col gap-3 ' : '')}>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'py-3 px-8 sm:block text-md rounded-4xl font-semibold hover:text-black hover:bg-[rgb(255,255,255,0.8)]' + (pathName === path.path ? ' text-black bg-[rgb(255,255,255,0.8)] ' : ' text-white ') + (openMenu ? ' block text-center ' : 'hidden')}>{path.name}</Link>
                    ))}
                </nav>
            </header>
        </>
    )
}
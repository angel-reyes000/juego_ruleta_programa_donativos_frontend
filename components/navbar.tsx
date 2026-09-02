"use client"

import Link from 'next/link';
import { FaCircle } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
        path: '/miCuenta',
        name: 'Acerca de',
    },
]

export default function NavBar () {
    const pathName = usePathname();
    const router = useRouter();

    return (
        <>
            {/*-----------------------MENU FLOTANTE ORIGINAL---------------------------*/}
            <header className='flex absolute fixed w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-1 px-6 z-10'>
                <FaCircle onClick={() => router.push('/')} size={50} className='text-white' />
                <nav className='flex justify-end w-full'>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'py-3 px-8 text-md rounded-4xl font-semibold hover:text-black hover:bg-[rgb(255,255,255,0.3)]' + (pathName === path.path ? ' text-black bg-[rgb(255,255,255,0.3)] ' : ' text-white ')}>{path.name}</Link>
                    ))}
                </nav>
            </header>
            {/*--------------------------MENU FAKE------------------------------*/ }
            <div className='flex w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-1 px-6 z-8'>
                <FaCircle onClick={() => router.push('/')} size={50} className='text-white' />
                <nav className='flex justify-end w-full'>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'py-3 px-8 text-md rounded-4xl font-semibold hover:text-black hover:bg-[rgba(255,255,255,0.3)]' + (pathName === path.path ? ' text-black bg-[rgb(255,255,255,0.3)] ' : ' text-white ')}>{path.name}</Link>
                    ))}
                </nav>
            </div>
        </>
    )
}
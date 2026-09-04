"use client"

import Link from 'next/link';
import { FaCircle, FaBars, FaPlus } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import logo from '@/public/images/5_y_Gana-removebg-preview.png';

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

    return (
        <>
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
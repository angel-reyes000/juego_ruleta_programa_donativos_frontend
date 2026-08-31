"use client"

import Link from 'next/link';
import { FaCircle } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';

const paths = [
    {
        id: 1,
        path: '/donar',
        name: "Donar", 
    },
    {
        id: 2,
        path: '/donar',
        name: 'Ruleta',
    },
    {
        id: 3,
        path: '/donar',
        name: 'Como funciona',
    },
    {
        id: 4,
        path: '/donar',
        name: 'Mi cuenta',
    },
]

export default function NavBar () {
    const pathName = usePathname();
    const router = useRouter();

    return (
        <>
            {/*-----------------------MENU FLOTANTE ORIGINAL---------------------------*/}
            <header className='flex absolute fixed w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-1 px-6'>
                <FaCircle onClick={() => router.push('/')} size={50} className='text-white' />
                <nav className='flex justify-end w-full'>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className='py-3 px-8 text-md rounded-4xl font-semibold text-white hover:text-black hover:bg-[rgb(255,255,255,0.3)]'>{path.name}</Link>
                    ))}
                </nav>
            </header>
            {/*--------------------------MENU FAKE------------------------------*/ }
            <div className='flex w-full bg-linear-to-b from-[rgba(100,0,0)] to-[rgba(30,0,0)] justify-between items-center py-1 px-6'>
                <FaCircle onClick={() => router.push('/')} size={50} className='text-white' />
                <nav className='flex justify-end w-full'>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className='py-3 px-8 text-md rounded-4xl font-semibold text-white hover:text-black hover:bg-[rgb(255,255,255,0.3)]'>{path.name}</Link>
                    ))}
                </nav>
            </div>
        </>
    )
}
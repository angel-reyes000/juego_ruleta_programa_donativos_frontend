"use client"

import MiniRoulette from '@/components/miniRoulette';
import Link from 'next/link';
import { FaBars, FaPlus, FaCog } from 'react-icons/fa';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
        path: '/acercaDe',
        name: 'Acerca de',
    },
]

export default function NavBar () {
    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [role, setRole] = useState<string>("");

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

                const role = data.role;

                if (role && role === 'admin') {
                    setRole("admin");
                }

                console.log(data)
                console.log(role)
            }

            getDataUser();

        } catch (error) {
            console.log("Error in getDataUser navbar")
        }

    }, [])

    return (
        <>  
            <dialog ref={refModal} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
                <div className='flex flex-col p-5 gap-5'>
                    <div className='flex justify-start items-center w-full'>
                        <p onClick={() => router.push('/')} className='casino_link cursor-pointer active:scale-90'>{'< '}regresar</p>
                    </div>
                    <div className='flex justify-center w-full'>
                        <MiniRoulette size={100} className='animation_mini_ruleta' />
                    </div>
                    <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
                        Tu sesion a expirado, inicia sesion para poder continuar!.
                    </p>
                    <div className='flex justify-center items-center w-full'>
                        <button onClick={() => router.push('/login')} className='casino_btn casino_btn_red w-[80%]'>
                            Iniciar sesion
                        </button>
                    </div>
                </div>
            </dialog>
            {/*--------------------------MENU FAKE------------------------------*/ }
            <div aria-hidden='true' className='casino_navbar invisible flex w-full justify-between items-center py-3 px-6 z-8'>
                <Image onClick={() => router.push('/')} src={logo} height={50} width={50} className='text-white hidden md:block' alt='logo de la pagina' />
                <FaBars size={50} className='text-white sm:hidden' />
                <nav className={'flex justify-end w-full'}>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'casino_nav_link content-center text-center py-3 px-8 sm:block text-md' + (pathName === path.path ? ' casino_nav_link_active ' : '') + (openMenu ? ' block text-center ' : 'hidden')}>{path.name}</Link>
                    ))}
                    {role === 'admin' ? (
                        <button className='casino_icon_btn ml-8 px-2'><FaCog size={30} /></button>
                    ) : null}
                </nav>
            </div>
            {/*-----------------------MENU FLOTANTE ORIGINAL---------------------------*/}
            <header className={'casino_navbar flex sm:flex-row absolute fixed w-full justify-between items-center py-5 sm:py-3 px-6 z-10 gap-5 sm:gap-0' + (openMenu ? ' flex-col items-start ' : '')}>
                <Image onClick={() => router.push('/')} src={logo} height={50} width={50} className='casino_logo text-white hidden sm:block cursor-pointer' alt='logo de la pagina' />
                {openMenu ? (
                    <FaPlus onClick={() => setOpenMenu(!openMenu)} size={30} className='text-casino-gold cursor-pointer sm:hidden rotate-45' />
                ):(
                    <FaBars onClick={() => setOpenMenu(!openMenu)} size={45} className='text-casino-gold cursor-pointer sm:hidden' />
                )}
                <nav className={'flex sm:flex-row sm:gap-2 justify-end w-full' + (openMenu ? ' flex-col gap-3 ' : '')}>
                    {paths.map(path => (
                        <Link key={path.id} href={path.path} className={'casino_nav_link content-center text-center py-3 px-8 sm:block text-md' + (pathName === path.path ? ' casino_nav_link_active ' : '') + (openMenu ? ' block text-center ' : 'hidden')}>{path.name}</Link>
                    ))}
                    {role === 'admin' ? (
                        <button onClick={() => router.push('/configuracion')} className='casino_icon_btn ml-8 px-2'>
                            <FaCog size={30} />
                        </button>
                    ) : null}
                </nav>
            </header>
        </>
    )
}
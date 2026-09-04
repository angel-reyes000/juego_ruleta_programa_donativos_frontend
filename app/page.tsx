"use client"

import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import mini_ruleta from '../public/images/mini_ruleta.png'
import Image from 'next/image';
import logo from '@/public/images/5_y_Gana-removebg-preview.png';
import './styles.css';
import 'aos/dist/aos.css';
import AOS from 'aos';

let description = `Vive la emoción de participar y pon a prueba tu suerte. Entra a una dinámica de 5 rondas donde cada giro de la ruleta te acerca más al premio. Con miles de participantes, números asignados aleatoriamente y premios en diferentes etapas.`

export default function Home () {
  const router = useRouter();
  const refModal = useRef<HTMLDialogElement>(null);

  let token = localStorage?.getItem('token') || '';

  useEffect(() => {

    AOS.init({
      duration: 1000,
      delay: 0,
      once: true,
    })

  }, [])


  return (
    <>
      <dialog ref={refModal} data-aos="fade-up" className='bg-[rgba(0,0,0,0)] m-auto rounded-md text-center w-[70%] sm;w-[50%] md:w-[40%] lg:w-[30%]'>
        <div className='flex flex-col bg-[rgba(50,0,0,0.9)] p-5 gap-5'>
          <div className='flex justify-end w-full'>
            <FaPlus onClick={() => refModal.current?.close()} size={20} className='rotate-45 text-white cursor-pointer active:scale-90' />
          </div>
          <div className='flex justify-center w-full'>
            <Image src={mini_ruleta} width={100} height={100} className='animation_mini_ruleta' alt='mini ruleta' />
          </div>
          <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
            {token ? '¿Estas seguro de cerrar sesion?' : 'Inicia sesion para continuar con tu donacion y la posibilidad de granar grandes premios!.'}
          </p>
          <div className='flex justify-center items-center w-full'>
              <button onClick={() => {
                  if (token) {
                    localStorage.removeItem('token')
                    router.push('/login')
                  } else {
                    router.push('/login')
                  }}} className='p-2 w-[80%] rounded-md bg-gradient-to-r from-red-500 to-yellow-700 cursor-pointer active:scale-95 text-white'>
                {token ? 'Cerrar sesion' : 'Iniciar sesion'}
              </button>
          </div>
        </div>
      </dialog>
      <div className="flex flex-col bg-[url('/images/fondo_incio.jpg')] h-full bg-center bg-cover bg-no-repeat py-3 px-10 md:px-20">
        <header className='h-auto'>
          <nav className='flex justify-between items-center w-full'>
            <Image src={logo} height={50} width={50} className='text-blue-300' alt='logo' />
            <p onClick={() => token ? refModal.current?.showModal() : router.push('/login')} className='p-3 text-white text-md md:text-xl rounded-sm font-semibold cursor-pointer hover:bg-[rgb(255,255,255,0.3)] hover:text-black'>{token ? 'Cerrar sesion' : 'Iniciar sesion'}</p>
          </nav>
        </header>
        <main className='flex items-center h-dvh pb-20 md:pb-30'>
          <section className='flex flex-col justify-center w-full lg:w-1/2 gap-5'>
            <h1 className='text-4xl md:text-6xl font-bold text-white'>Bienvenido al programa de donativos</h1>
            <p className='text-md md:text-lg text-white whitespace-pre-wrap'>{description}</p>
            <button onClick={() => token ? router.push('/donar') : refModal.current?.showModal()} className='text-lg text-white mt-5 font-semibold rounded-md bg-gradient-to-r from-orange-400 to-yellow-500 w-[50%] md:w-[30%] p-2 cursor-pointer active:scale-95'>Comienza aqui!</button>
          </section>
        </main>
      </div>
    </>
  )
}
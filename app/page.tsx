"use client"

import Link from 'next/link';
import { FaCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

let decription = `Vive la emoción de participar y pon a prueba tu suerte. Entra a una dinámica de 5 rondas donde cada giro de la ruleta te acerca más al premio. Con miles de participantes, números asignados aleatoriamente y premios en diferentes etapas.`

export default function Home () {
  const router = useRouter();

  return (
    <>
    <div className="flex flex-col bg-[url('/images/fondo_incio.jpg')] h-full bg-center bg-cover bg-no-repeat py-3 px-10 md:px-20">
      <header className='h-auto'>
        <nav className='flex justify-between items-center w-full'>
          <FaCircle size={30} className='text-blue-300'/>
          <p onClick={() => router.push('/login')} className='p-3 text-white text-md md:text-xl rounded-sm font-semibold cursor-pointer hover:bg-[rgb(255,255,255,0.3)] hover:text-black'>Iniciar sesion</p>
        </nav>
      </header>
      <main className='flex items-center h-dvh pb-20 md:pb-30'>
        <section className='flex flex-col justify-center w-full lg:w-1/2 gap-5'>
          <h1 className='text-4xl md:text-6xl font-bold text-white'>Bienvenido al programa de donativos</h1>
          <p className='text-md md:text-lg text-white whitespace-pre-wrap'>{decription}</p>
          <button className='text-lg text-white mt-5 font-semibold rounded-md bg-gradient-to-r from-orange-400 to-yellow-500 w-[50%] md:w-[30%] p-2 cursor-pointer active:scale-95'>Comienza aqui!</button>
        </section>
      </main>
    </div>
    </>
  )
}
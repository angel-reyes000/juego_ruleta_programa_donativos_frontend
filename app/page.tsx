"use client"

import MiniRoulette from '@/components/miniRoulette';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import logo from '@/public/images/5_y_Gana-removebg-preview.png';
import './styles.css';
import 'aos/dist/aos.css';
import AOS from 'aos';

let description = `Vive la emoción de participar y pon a prueba tu suerte. Entra a una dinámica de 5 rondas donde cada giro de la ruleta te acerca más al premio. Con miles de participantes, números asignados aleatoriamente y premios en diferentes etapas.`

export default function Home () {
  const router = useRouter();
  const refModal = useRef<HTMLDialogElement>(null);
  const [stateToken, setStateToken] = useState<boolean>(false);

  useEffect(() => {

    const token =  localStorage.getItem('token');

    async function getData () {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getDataUser`,{
            method: 'GET',
            headers: {
                authorization: `Bearer ${token}`
            }
        })

        if (response.status !== 200) {
            console.log("Error en getData MiCuenta frontend.")
            setStateToken(false);
            return response.status
        }

        //const data = await response.json();
        //console.log(data)

        setStateToken(true);

    }

    getData();

    AOS.init({
      delay: 0,
      duration: 1000,
      once: false,
      offset: 0,
    })

  }, [])


  return (
    <>
      <dialog ref={refModal} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
        <div className='flex flex-col p-5 gap-5'>
          <div className='flex justify-end w-full'>
            <FaPlus onClick={() => refModal.current?.close()} size={20} className='rotate-45 text-casino-gold cursor-pointer active:scale-90' />
          </div>
          <div className='flex justify-center w-full'>
            <MiniRoulette size={100} className='animation_mini_ruleta' />
          </div>
          <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
            {stateToken ? '¿Estas seguro de cerrar sesion?' : 'Inicia sesion para continuar con tu donacion y la posibilidad de granar grandes premios!.'}
          </p>
          <div className='flex justify-center items-center w-full'>
              <button onClick={() => {
                  if (stateToken) {
                    localStorage.removeItem('token')
                    router.push('/login')
                  } else {
                    router.push('/login')
                  }}} className='casino_btn casino_btn_red w-[80%]'>
                {stateToken ? 'Cerrar sesion' : 'Iniciar sesion'}
              </button>
          </div>
        </div>
      </dialog>
      <div className="relative flex flex-col min-h-dvh bg-[url('/images/fondo_incio.jpg')] bg-center bg-cover bg-no-repeat py-3 px-6 sm:px-10 md:px-20 overflow-hidden">
        <div className='casino_hero_overlay absolute inset-0' />
        <header className='relative h-auto'>
          <nav className='flex justify-between items-center w-full'>
            <Image src={logo} height={50} width={50} className='casino_logo' alt='logo' />
            <p onClick={() => stateToken ? refModal.current?.showModal() : router.push('/login')} className='casino_btn casino_btn_ghost text-sm md:text-lg'>{stateToken ? 'Cerrar sesion' : 'Iniciar sesion'}</p>
          </nav>
        </header>
        <main className='relative flex flex-1 flex-col-reverse lg:flex-row items-center justify-center lg:justify-between gap-8 py-10'>
          <section className='flex flex-col justify-center w-full lg:w-3/5 gap-6 text-center lg:text-left'>
            <p data-aos="fade-down" className='casino_marquee casino_neon_text text-lg md:text-2xl'>♠ ♥ ¡Tu suerte gira aqui! ♦ ♣</p>
            <h1 data-aos="fade-up" className='casino_heading text-4xl sm:text-5xl md:text-7xl leading-tight'>Bienvenido al programa de donativos</h1>
            <p data-aos="fade-up" className='text-md md:text-lg text-white/90 whitespace-pre-wrap'>{description}</p>
            <div data-aos="fade-up" className='flex flex-wrap justify-center lg:justify-start gap-3'>
              <span className='casino_chip text-sm md:text-base'>5 rondas</span>
              <span className='casino_chip text-sm md:text-base'>10 numeros</span>
              <span className='casino_chip text-sm md:text-base'>$100 = 1 ticket</span>
            </div>
            <div className='casino_fade_up flex justify-center lg:justify-start'>
              <button onClick={() => stateToken ? router.push('/donar') : refModal.current?.showModal()} className='casino_btn casino_btn_pulse text-lg md:text-xl mt-2'>Comienza aqui!</button>
            </div>
          </section>
          <section data-aos="zoom-in" className='flex justify-center items-center w-[40%] sm:w-[28%] lg:w-1/4'>
            <div className='casino_float w-full'>
              <MiniRoulette className='casino_spin_slow' />
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

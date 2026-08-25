"use client"

import mini_ruleta from '../../public/images/mini_ruleta.png';
import Image from 'next/image';
import '../styles.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User <T> {
    name: T
    last_name: T,
    phone_number: T,
    email: T,
    password: T,
    confirm_password: T,
}

export default function Signup() {
    const [user, setUser] = useState<User<string>>({
        name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    return (
        <>
            <div className="flex flex-col justify-center items-center h-dvh bg-[url('/images/fondo_signup.jpg')] bg-center bg-cover bg-no-repeat">
                <div className="flex flex-col items-center justify-center py-7 px-10 rounded-xl h-auto w-[90%] md:w-[70%] lg:w-[50%] border-2 border-none bg-gradient-to-b from-[rgb(50,0,0,0.7)] to-[rgb(0,0,0,0.7)]">
                    <h1 className="text-center text-3xl font-semibold text-white">Bienvenido, registrate para donar y poder participar!</h1>
                    <Image className='mt-5 mb-2 animation_mini_ruleta' src={mini_ruleta} height={100} width={100} alt='mini ruleta' />
                    <form className="flex flex-col md:flex-row md:flex-wrap justify-between text-white w-full h-full gap-y-5">                    
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Nombre:</span>
                            <input value={user.name} onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" type="text" placeholder="ej. Angel Alejandro" maxLength={30} required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Apellido:</span>
                            <input value={user.last_name} onChange={(e) => setUser(prev => ({...prev, last_name: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" type="text" placeholder="ej. Reyes Carrasco" maxLength={30} required></input>
                        </label> 
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Numero celular:</span>
                            <input value={user.phone_number} onChange={(e) => setUser(prev => ({...prev, phone_number: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" maxLength={10} required></input>
                        </label>                   
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Correo electronico:</span>
                            <input value={user.email} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" type="email" placeholder="ej. example@dominio.xxxx" required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Contraseña:</span>
                            <input value={user.password} onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" maxLength={15} required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Confirmar contraseña:</span>
                            <input value={user.confirm_password} onChange={(e) => setUser(prev => ({...prev, confirm_password: e.target.value}))} className="p-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" maxLength={15} required></input>
                        </label>
                        <div className="flex justify-center w-full mt-10 mb-2">
                            <button onClick={(e) => e.preventDefault} className="p-2 w-[90%] md:w-[70%] lg:w-[50%] font-semibold bg-gradient-to-r from-red-700 to-red-400 rounded-md cursor-pointer active:scale-95">Registrarse</button>
                        </div>
                    </form>
                    <button onClick={() => console.log(user)}>clickkk</button>
                    <p className="text-white">¿Ya tienes una cuenta? <span className='text-blue-400 hover:underline cursor-pointer'><Link href={'/login'}>Iniciar sesion</Link></span></p> 
                </div>
            </div>
        </>
    )
}
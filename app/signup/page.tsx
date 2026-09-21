"use client"

import MiniRoulette from '@/components/miniRoulette';
import '../styles.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    const [invalidData, setInvalidData] = useState<string>("");

    const router = useRouter();

    async function postUser (e: any) {
        e.preventDefault()

        if (user.password !== user.confirm_password) {
            setInvalidData("Tu contraseña no es igual a la del campo 'confirmar contraseña'")
            setTimeout(() => setInvalidData(""), 5000)
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/users`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name,
                    last_name: user.last_name,
                    phone_number: user.phone_number,
                    email: user.email,
                    password: user.password,
                })
            })

            const data = await response.json()

            if (response.status != 201) {
                console.log("Error al crear usuario")
                setInvalidData(() => data.error)
                setTimeout(() => setInvalidData(""), 5000)
                return 
            }

            setUser(prev => ({...prev, name: "", last_name: "", phone_number: "", email: "", password: "", confirm_password: ""}))
            router.push('/login')

        } catch (error) {
            console.log("Error in postUser frontend: ", error)
        }
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-dvh py-10">
                <div className="fixed inset-0 blur-[3px] opacity-40 bg-[url('/images/fondo_signup.jpg')] bg-center bg-cover bg-no-repeat" />
                <div className="casino_card casino_lights casino_fade_up flex flex-col items-center justify-center py-7 px-6 sm:px-10 z-10 h-auto w-[88%] md:w-[70%] lg:w-[50%]">
                    <h1 className="casino_heading text-center text-3xl">Crear una nueva cuenta</h1>
                    <MiniRoulette size={100} className='mt-5 mb-2 animation_mini_ruleta' />
                    <form className="flex flex-col md:flex-row md:flex-wrap justify-between text-white w-full h-full gap-y-5">                    
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Nombre:</span>
                            <input value={user.name} onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))} className="casino_input" type="text" placeholder="ej. Angel Alejandro" maxLength={30} required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Apellido:</span>
                            <input value={user.last_name} onChange={(e) => setUser(prev => ({...prev, last_name: e.target.value}))} className="casino_input" type="text" placeholder="ej. Reyes Carrasco" maxLength={30} required></input>
                        </label> 
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Numero celular:</span>
                            <input value={user.phone_number} onChange={(e) => setUser(prev => ({...prev, phone_number: e.target.value}))} className="casino_input" maxLength={10} required></input>
                        </label>                   
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Correo electronico:</span>
                            <input value={user.email} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} className="casino_input" type="email" placeholder="ej. example@dominio.xxxx" maxLength={50} required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Contraseña:</span>
                            <input type='password' value={user.password} onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))} className="casino_input" maxLength={15} required></input>
                        </label>
                        <label className="flex flex-col w-full md:w-[48%] gap-1">
                            <span className="font-semibold">Confirmar contraseña:</span>
                            <input type='password' value={user.confirm_password} onChange={(e) => setUser(prev => ({...prev, confirm_password: e.target.value}))} className="casino_input" maxLength={15} required></input>
                        </label>
                        <p className='text-right w-full casino_error text-[0.8rem]'>{invalidData}</p>
                        <div className="flex justify-center w-full mt-10 mb-2">
                            <button onClick={(e) => postUser(e)} className="casino_btn w-[90%] md:w-[70%] lg:w-[50%]">Registrarse</button>
                        </div>
                    </form>
                    <p className="text-white">¿Ya tienes una cuenta? <span className='casino_link cursor-pointer'><Link href={'/login'}>Iniciar sesion</Link></span></p> 
                </div>
            </div>
        </>
    )
}
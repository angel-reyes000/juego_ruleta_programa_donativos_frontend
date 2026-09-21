"use client"

import MiniRoulette from '@/components/miniRoulette';
import '../styles.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 

interface User {
    email: string
    password: string
}

export default function Login() {
    const [user, setUser] = useState<User>({
        email: "",
        password: "",
    });
    const [invalidData, setInvalidData] = useState<string>("");

    const router = useRouter();

    async function loginUser (e: any) {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/loginUser`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password,
                })
            })

            const data = await response.json()

            console.log(data)

            if (response.status != 200) {
                console.log("Login invalido")
                setInvalidData(data.error)
                setTimeout(() => setInvalidData(""), 5000)
                return
            }

            localStorage.setItem('token', data.token)
            setUser(prev => ({...prev, email: "", password: ""}))
            router.push('/')
            
        } catch (error) {
            console.log("Error en loginUser frontend.")
        }
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center min-h-dvh py-10">
                <div className="fixed inset-0 blur-[3px] opacity-40 bg-[url('/images/fondo_signup.jpg')] bg-center bg-cover bg-no-repeat" />
                <div className="casino_card casino_lights casino_fade_up flex flex-col items-center py-7 px-6 sm:px-10 z-10 h-auto w-[88%] sm:w-[70%] md:w-[50%] lg:w-[30%]">
                    <h1 className="casino_heading text-center text-3xl">Iniciar sesion</h1>
                    <MiniRoulette size={100} className='mt-5 mb-2 animation_mini_ruleta' />
                    <form onSubmit={(e) => loginUser(e)} className="flex flex-col md:flex-wrap justify-center items-center text-white w-full h-full gap-y-5">                                    
                        <label className="flex flex-col w-full gap-1">
                            <span className="font-semibold">Correo electronico:</span>
                            <input value={user.email} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} className="casino_input" type="email" placeholder="ej. example@dominio.xxxx" required></input>
                        </label>
                        <label className="flex flex-col w-full gap-1">
                            <span className="font-semibold">Contraseña:</span>
                            <input type='password' value={user.password} onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))} className="casino_input" maxLength={15} required></input>
                        </label>
                        <p className='casino_error text-[0.8rem] w-full text-right'>{invalidData}</p>
                        <div className="flex justify-center w-full mt-10 mb-2">
                            <button type='submit' className="casino_btn w-[90%]">Registrarse</button>
                        </div>
                    </form>
                    <p className="text-white">No tienes una cuenta? <span className='casino_link cursor-pointer'><Link href={'/signup'}>Registrate</Link></span></p> 
                </div>
            </div>
        </>
    )
}
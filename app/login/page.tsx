"use client"

import mini_ruleta from '../../public/images/mini_ruleta.png';
import Image from 'next/image';
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
            <div className="flex flex-col justify-center items-center h-dvh bg-[url('/images/fondo_signup.jpg')] bg-center bg-cover bg-no-repeat">
                <div className="flex flex-col items-center py-7 px-10 rounded-xl h-auto w-[70%] md:w-[50%] lg:w-[30%] border-2 border-none bg-gradient-to-b from-[rgb(50,0,0,0.7)] to-[rgb(0,0,0,0.7)]">
                    <h1 className="text-left text-3xl font-semibold text-white">Hola de nuevo!</h1>
                    <Image className='mt-5 mb-2 animation_mini_ruleta' src={mini_ruleta} height={100} width={100} alt='mini ruleta' />
                    <form onSubmit={(e) => loginUser(e)} className="flex flex-col md:flex-wrap justify-center items-center text-white w-full h-full gap-y-5">                                    
                        <label className="flex flex-col w-full gap-1">
                            <span className="font-semibold">Correo electronico:</span>
                            <input value={user.email} onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))} className="py-2 px-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" type="email" placeholder="ej. example@dominio.xxxx" required></input>
                        </label>
                        <label className="flex flex-col w-full gap-1">
                            <span className="font-semibold">Contraseña:</span>
                            <input value={user.password} onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))} className="py-2 px-2 outline-none bg-gray-900 focus:border-2 focus:border-[rgb(255,255,255,0.8)] rounded-md" maxLength={15} required></input>
                        </label>
                        <p className='text-red-500 text-[0.8rem] w-full text-right'>{invalidData}</p>
                        <div className="flex justify-center w-full mt-10 mb-2">
                            <button type='submit' className="p-2 w-[90%] font-semibold bg-gradient-to-r from-red-700 to-red-400 rounded-md cursor-pointer active:scale-95">Registrarse</button>
                        </div>
                    </form>
                    <p className="text-white">No tienes una cuenta? <span className='text-blue-400 hover:underline cursor-pointer'><Link href={'/signup'}>Registrate</Link></span></p> 
                </div>
            </div>
        </>
    )
}
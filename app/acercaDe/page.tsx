"use client"

import NavBar from "@/components/navbar";
import { useEffect, useState } from "react";
import { FaUser, FaEdit, FaLock, FaRegEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { MdApps } from 'react-icons/md';

interface User<t>{
    name: t,
    last_name: t,
    email: t, 
    phone_number: t,
    created_at: t,
}

export default function MiCuenta () {
    const [dataUser, setDataUser] = useState<User<string>>();
    const router = useRouter();

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
                console.log("Error en getData MiCuenta")
                return response.status
            }

            const data = await response.json();
            setDataUser(data)
            console.log(data)

            return data
        }

        getData()

    }, [])

    return (
        <>
            <NavBar />
            <main className="flex flex-wrap flex-col md:flex-row justify-center h-auto min-h-dvh w-full content-start px-5 py-10 gap-5">
                <div className="casino_card casino_fade_up flex flex-row flex-wrap w-full md:w-[45%] p-5 gap-3 text-white">
                    <div className="casino_heading flex items-center w-full text-xl gap-2">
                      <FaRegEnvelope size={20} />  
                      <p>Contactanos</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Numero celular:</p>
                        <p>00 000 000 000</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Correo Electronico:</p>
                        <a className="casino_link" href="mailto:ejemplo@gmail.com">ejemplo@ejem.com</a>
                    </div>
                </div>
                <div className="casino_card casino_fade_up flex flex-row flex-wrap w-full md:w-[45%] p-5 gap-3 text-white">
                    <div className="casino_heading flex items-center w-full text-xl gap-2">
                      <FaUser />  
                      <p>Mi perfil</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Nombre:</p>
                        <p>{dataUser?.name}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Apellido:</p>
                        <p>{dataUser?.last_name}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Correo electronico:</p>
                        <p>{dataUser?.email}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Numero celular:</p>
                        <p>{dataUser?.phone_number}</p>
                    </div>
                </div>
                <div className="casino_card casino_fade_up flex flex-row flex-wrap w-full md:w-[45%] p-5 gap-3 text-white">
                    <div className="casino_heading flex items-center w-full text-xl gap-2">
                      <FaLock />  
                      <p>Cuenta</p>
                    </div>
                    <div className="w-full md:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Fecha de creacion:</p>
                        <p>{dataUser?.created_at.slice(0, 10)}</p>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/')
                    }} className="casino_btn casino_btn_red w-full">Cerrar sesion
                    </button>
                </div>
                <div className="casino_card casino_fade_up flex flex-row flex-wrap w-full md:w-[45%] p-5 gap-3 text-white">
                    <div className="casino_heading flex items-center w-full text-xl gap-2">
                      <MdApps />  
                      <p>Aplicacion</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm text-casino-gold">Version:</p>
                        <p>1.0.0</p>
                    </div>
                </div>
            </main>
        </>
    )
}
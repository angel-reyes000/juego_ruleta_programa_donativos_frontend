"use client"

import NavBar from "@/components/navbar";
import { useEffect, useState } from "react";
import { FaUser, FaEdit, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
            <main className="flex flex-wrap flex-col md:flex-row h-dvh w-full content-start px-5 py-10 gap-2 bg-[rgb(30,0,0)]">
                <div className="flex flex-row flex-wrap bg-[rgb(100,0,0)] w-full md:w-[45%] rounded-lg p-5 gap-3 text-white">
                    <div className="flex items-center w-full text-lg font-bold gap-2">
                      <FaUser />  
                      <p>Mi perfil</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm">Nombre:</p>
                        <p>{dataUser?.name}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm">Apellido:</p>
                        <p>{dataUser?.last_name}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm">Correo electronico:</p>
                        <p>{dataUser?.email}</p>
                    </div>
                    <div className="w-full sm:w-[45%]">
                        <p className="font-semibold text-sm">Numero celular:</p>
                        <p>{dataUser?.phone_number}</p>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap bg-[rgb(100,0,0)] w-full md:w-[45%] rounded-lg p-5 gap-3 text-white">
                    <div className="flex items-center w-full text-lg font-bold gap-2">
                      <FaLock />  
                      <p>Cuenta</p>
                    </div>
                    <div className="w-full md:w-[45%]">
                        <p className="font-semibold text-sm">Fecha de creacion:</p>
                        <p>{dataUser?.created_at.slice(0, 10)}</p>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/')
                    }} className="w-full p-2 border rounded-lg hover:bg-[rgba(255,255,255,0.1)] cursor-pointer active:scale-95">Cerrar sesion
                    </button>
                </div>
            </main>
        </>
    )
}
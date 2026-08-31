"use client"

import NavBar from "@/components/navbar";
import personas_ayudando from '@/public/images/personas_ayudando.jpg';
import Image from 'next/image';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import chip from '@/public/images/chip_credit_card.jpg';
import { useState } from 'react';
import '@/app/styles.css';

export default function Donar () {
    const router = useRouter();
    const [dataCard, setDataCard] = useState({
        numeroTarjeta: "",
        fechaVencimiento: "",
        CVV: "",
    });

    return (
        <>
            <NavBar />
            <main className="grid md:grid-cols-[1fr_1fr] p-2 min-h-dvh max-h-full bg-[rgba(30,0,0)]">
                <section className="flex justify-center h-full hidden md:flex">
                    <Image src={personas_ayudando} className="object-cover" alt="personas ayudando" />
                </section>
                <section className="h-full">
                    <form className="flex flex-col items-center h-full w-full p-10 gap-10 text-white">
                        <div className="grid grid-rows-[auto_1fr_1fr] gap-5 min-h-[200px] bg-linear-to-r from-[rgb(90,90,90)] to-[rgb(170,170,170)] w-[80%] sm:w-[60%] md:w-[80%] lg:w-[55%] rounded-xl p-5">
                            <div className="flex justify-between">
                                <Image src={chip} height={10} width={50} className="rounded-md" alt="chip tarjeta"/>
                                <p className="text-xl font-semibold">Tarjeta</p>
                            </div>
                            <div>
                                <p className="text-[0.9rem] font-semibold">Numero de tarjeta:</p>
                                <p>{dataCard.numeroTarjeta}</p>
                            </div>
                            <div className="flex justify-between w-full">
                                <div>
                                    <p className="text-[0.9rem] font-semibold">Vencimiento:</p>
                                    <p>{dataCard.fechaVencimiento}</p>
                                </div>
                                <div>
                                    <p className="text-[0.9rem] font-semibold">CVV:</p>
                                    <p>{dataCard.CVV}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5 w-full">
                            <label className="flex flex-col text-[0.9rem] font-semibold">
                                <div>Numero de tarjeta<span className="text-red-500">*</span></div>
                                <input value={dataCard.numeroTarjeta} onChange={(e) => setDataCard(prev => ({...prev, numeroTarjeta: e.target.value}))} className="border-b-1 focus:outline-none font-normal" />
                            </label>
                            <label className="flex flex-col text-[0.9rem] font-semibold">
                                <div>Nombre y apellido del tarjetahabiente<span className="text-red-500">*</span></div>
                                <input className="border-b-1 focus:outline-none font-normal" />
                            </label>
                            <div className="flex justify-between gap-1">
                                <label className="flex flex-col text-[0.9rem] font-semibold w-[49%]">
                                    <div>Fecha de vencimiento<span className="text-red-500">*</span></div>
                                    <input value={dataCard.fechaVencimiento} onChange={(e) => setDataCard(prev => ({...prev, fechaVencimiento: e.target.value}))} className="border-b-1 focus:outline-none font-normal" />
                                </label>
                                <label className="flex flex-col text-[0.9rem] font-semibold w-[49%]">
                                    <div>CVV<span className="text-red-500">*</span></div>
                                    <input value={dataCard.CVV} onChange={(e) => setDataCard(prev => ({...prev, CVV: e.target.value}))} className="border-b-1 focus:outline-none font-normal" />
                                </label> 
                            </div>
                        </div>
                        <label className="flex flex-col text-[0.9rem] font-semibold w-[100%]">
                            <div>Cantidad a donar<span className="text-red-500">*</span></div>
                            <div className="flex gap-1 w-full">
                                <input className="border-b-1 w-[150px] focus:outline-none font-normal" />
                                <p>$ Pesos MXN</p>
                            </div>
                        </label>

                        <label className="flex gap-2">
                            <input type="checkbox" className="cursor-pointer active:scale-80"/>
                            Acepto terminos y condiciones.                            
                        </label>
                        <div className="flex justify-between w-full">
                            <Link href={'/'} className="flex items-center justify-center py-2 px-8 rounded-[200px] font-semibold cursor-pointer active:scale-90 hover:underline gap-1">
                                <FaArrowLeft />Regresar
                            </Link>
                            <button className="flex items-center justify-center py-2 px-8 rounded-[200px] bg-red-900 hover:bg-[rgb(100,0,0)] font-semibold cursor-pointer active:scale-90 gap-1">
                                Donar<FaArrowRight />
                            </button>
                        </div>
                    </form>
                </section>
            </main>                
        </>
    )
}
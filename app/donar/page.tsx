"use client"

import NavBar from "@/components/navbar";
import personas_ayudando from '@/public/images/personas_ayudando.jpg';
import Image from 'next/image';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import chip from '@/public/images/chip_credit_card.jpg';
import { useEffect, useState } from 'react';
import '@/app/styles.css';
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import DonationCelebration from "@/components/donationCelebration";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function FormPayment ({ setQuantity, quantity, clientSecret }: { setQuantity: any, quantity: number, clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [celebration, setCelebration] = useState<boolean>(false);

    const pay = async () => {
        try {
           if (!stripe || !elements) {
                return;
            } 

            setLoading(true);
            setError("");

            const cardNumber = elements.getElement(CardNumberElement);

            if (!cardNumber) {
                setError("No se encontró el campo de tarjeta.");
                setLoading(false);
                return;
            }

            const result = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardNumber
                    }
                }
            )

            if (result.error) {
                setError(result.error.message || "Error al realizar el pago.")
            }

            if (result.paymentIntent?.status === "succeeded") {
                console.log("Pago realizado correctamente");
                setCelebration(true)
            }

            setLoading(false);

        } catch (error) {
            console.log("Error en pay front")
        }   
    }
    
    return (
        <>
            {celebration ? <DonationCelebration setCelebration={setCelebration} /> : null}
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
                            <p></p>
                        </div>
                        <div className="flex justify-between w-full">
                            <div>
                                <p className="text-[0.9rem] font-semibold">Vencimiento:</p>
                                <p></p>
                            </div>                                
                            <div>
                                <p className="text-[0.9rem] font-semibold">CVV:</p>
                                <p></p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full">
                        <label className="flex flex-col text-[0.9rem] font-semibold">
                            <div>Nombre y apellido del tarjetahabiente<span className="text-red-500">*</span></div>
                            <input className="border-b-1 focus:outline-none font-normal" />
                        </label>
                        <label className="flex flex-col text-[0.9rem] font-semibold border-b-1">
                            <div>Numero de tarjeta<span className="text-red-500">*</span></div>
                            <CardNumberElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#ffffff",                                            
                                        },
                                    },
                                }}
                            />
                        </label>
                        <div className="flex justify-between gap-1">
                            <label className="flex flex-col text-[0.9rem] font-semibold w-[49%] border-b-1">
                                <div>Fecha de vencimiento<span className="text-red-500">*</span></div>
                                <CardExpiryElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                color: "#ffffff",
                                            },
                                        },
                                    }}
                                />                                    
                            </label>
                            <label className="flex flex-col text-[0.9rem] font-semibold w-[49%] border-b-1">
                                <div>CVV<span className="text-red-500">*</span></div>
                                <CardCvcElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                color: "#ffffff",
                                            },
                                        },
                                    }}
                                />                                    
                            </label> 
                        </div>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <label className="flex flex-col text-[0.9rem] font-semibold w-[100%]">
                        <div>Cantidad a donar<span className="text-red-500">*</span></div>
                        <div className="flex gap-1 w-full">
                            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="border-b-1 w-[150px] focus:outline-none font-normal" />
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
                        <button onClick={pay}
                            disabled={!stripe || !elements || loading}
                            className="flex items-center justify-center py-2 px-8 rounded-[200px] bg-red-900 hover:bg-[rgb(100,0,0)] font-semibold cursor-pointer active:scale-90 gap-1">
                            {loading? "Procesando...": `Donar $${quantity} MXN`}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default function Donar () {
    const [quantity, setQuantity] = useState<number>(0);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        const crearPago = async () => {

            setClientSecret(null);

            const token = localStorage.getItem('token')

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/createPayment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        quantity,
                    }),
                }
            );

            const data = await response.json();

            setClientSecret(data.clientSecret);

        };

        crearPago();

    }, [quantity])

    return (
        <>
            <NavBar />
            <main className="grid md:grid-cols-[1fr_1fr] p-2 min-h-dvh max-h-full bg-[rgba(30,0,0)]">
                <Elements stripe={stripePromise}>
                    <FormPayment 
                        setQuantity={setQuantity}
                        quantity={quantity} 
                        clientSecret={clientSecret!} 
                    />
                </Elements>
            </main>                
        </>
    )
}
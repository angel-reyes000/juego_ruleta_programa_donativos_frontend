"use client"

import MiniRoulette from '@/components/miniRoulette';
import NavBar from "@/components/navbar";
import MessageFloating from "@/components/messageFloating";
import { messageFloating } from "@/components/messageFloating";
import personas_ayudando from '@/public/images/personas_ayudando.jpg';
import Image from 'next/image';
import { FaArrowRight, FaArrowLeft, FaPlus, FaTicketAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import chip from '@/public/images/chip_credit_card.jpg';
import { useEffect, useState, useRef } from 'react';
import 'aos/dist/aos.css';
import AOS from 'aos';
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

async function createPayment ({ amount, cardHolder }: { amount: number, cardHolder: string }) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/createPayment`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: amount,
                card_holder: cardHolder,
            })
        })

        const data = await response.json()

        if (response.status !== 200) {
            console.log("Error al registrar pago")
            return { message: data.error as string, donationId: undefined }
        }

        return { message: data.message as string, donationId: data.donation_id as number | undefined }

    } catch (error) {
        console.log("Error in createPayment", error)
    }
}

// Tickets asignados por la donación recién hecha, agrupados por número.
async function getDonationTickets (donationId: number): Promise<Record<number, number>> {
    const token = localStorage.getItem('token');
    const headers = { authorization: `Bearer ${token}` };
    const grouped: Record<number, number> = {};
    try {
        const responseGame = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getCurrentGame`, { headers });
        if (responseGame.status !== 200) return grouped;
        const game = await responseGame.json();

        const responseTickets = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getTickets?game_id=${game.id}`, { headers });
        if (responseTickets.status !== 200) return grouped;
        const tickets: { donation_id?: number, ticket_number?: number }[] = await responseTickets.json();

        tickets
            .filter(t => t.donation_id === donationId && t.ticket_number != null)
            .forEach(t => { grouped[t.ticket_number!] = (grouped[t.ticket_number!] ?? 0) + 1; });
    } catch (error) {
        console.log("Error in getDonationTickets", error)
    }
    return grouped;
}

function FormPayment () {
    const stripe = useStripe();
    const elements = useElements();
    const [amount, setAmount] = useState<number>(0);
    const [cardHolder, setCardHolder] = useState<string>("");
    const [checkBox, setCheckBox] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [celebration, setCelebration] = useState<boolean>(false);
    const [showMessage, setShowMessage] = useState<messageFloating>({
        show: false,
        messages: [],
        type: "info",
    });

    const refModal = useRef<HTMLDialogElement>(null);
    const refTicketsModal = useRef<HTMLDialogElement>(null);
    const [donationTickets, setDonationTickets] = useState<Record<number, number>>({});

    const router = useRouter();

    useEffect(() => {

        AOS.init({
            duration: 1000, 
            delay: 0,
            once: true,
        })

    }, [])

    const pay = async (e: any) => {
        e.preventDefault()

        try {

            const token = localStorage.getItem('token')

            if (amount < 100) {
                setError("La cantidad debe ser mayor de $100MXN.")
                return
            }

            if (!amount || amount > 10000) {
                setShowMessage({show: true, messages: ["Para donar cantidades superiores a $10,000 MXN contactenos."], type: "info"});
                refModal.current?.showModal();
                return
            }

            if (!cardHolder) {
                setError("Campo faltante: Nombre y apellido de tarjetahabiente.")
                return
            }

            if (!checkBox) {
                setError("Debes aceptar terminos y condiciones.")
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/paymentIntent`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        "amount": amount,
                        "card_holder": cardHolder,
                        "check_box": checkBox,
                    }),
                }
            );

            const data = await response.json();

            

            const clientSecret = await data.clientSecret;
            console.log(clientSecret)

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
                clientSecret!,
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

                const payment = await createPayment({ amount, cardHolder });
                setShowMessage({show: true, messages: ["Pago realizado correctamente", payment?.message ?? ""], type: "good"});

                if (payment?.donationId != null) {
                    setDonationTickets(await getDonationTickets(payment.donationId));
                    refTicketsModal.current?.showModal();
                }

                setCelebration(true);
                setAmount(0);
            }

            setLoading(false);

        } catch (error) {
            console.log("Error en pay front", error)
            setLoading(false)
            setError("Error al procesar el pago");
            setShowMessage({show: true, messages: ["Error al procesar el pago"], type: "bad"});
        } finally {
            setTimeout(() => {
                setError("")
                setShowMessage({show: false, messages: [], type: "info"});
            }, 10000)
        }
    }
    
    return (
        <>
            {showMessage ? <MessageFloating show={showMessage.show} messages={showMessage.messages} type={showMessage.type} /> : null}
            {/*celebration ? <DonationCelebration setCelebration={setCelebration} /> : null*/}
            <section className="flex justify-center items-center p-4 h-full hidden md:flex">
                <Image src={personas_ayudando} className="object-cover rounded-2xl border-2 border-casino-gold shadow-[0_0_30px_rgba(255,210,63,0.6)]" alt="personas ayudando" />
            </section>
            <section className="h-full">
                <dialog ref={refModal} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
                    <div className='flex flex-col items-center text-white p-5 gap-5'>
                        <div className='flex justify-end items-center w-full'>
                            <FaPlus onClick={() => refModal.current?.close()} className="rotate-45 text-casino-gold hover:cursor-pointer" size={20}  />
                        </div>
                        <div className='flex justify-center w-full'>
                            <MiniRoulette size={100} className='animation_mini_ruleta' />
                        </div>
                        <p className='font-semibold text-[1.1rem] m-0 p-0'>
                            Para donar cantidades superiores a $10,000 MXN contactenos. 
                        </p>
                        <button onClick={() => router.push('/acercaDe')} className='casino_btn casino_btn_red w-[80%]'>
                            Contactar ahora.
                        </button>
                    </div>
                </dialog>
                <dialog ref={refTicketsModal} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
                    <div className='flex flex-col items-center text-white p-5 gap-4'>
                        <div className='flex justify-end items-center w-full'>
                            <FaPlus onClick={() => refTicketsModal.current?.close()} className="rotate-45 text-casino-gold hover:cursor-pointer" size={20} />
                        </div>
                        <FaTicketAlt size={40} className='text-casino-gold rotate-45' />
                        <h3 className='casino_heading text-lg'>¡Gracias por tu donación!</h3>
                        {(() => {
                            const entries = Object.entries(donationTickets).sort(([a], [b]) => Number(a) - Number(b));
                            const total = entries.reduce((sum, [, count]) => sum + count, 0);
                            if (entries.length === 0) {
                                return <p className='text-white/60 text-sm'>No se encontraron tickets para esta donación.</p>;
                            }
                            return (
                                <>
                                    <p className='font-semibold'>Se te asignaron {total} {total === 1 ? 'ticket' : 'tickets'}:</p>
                                    <div className='w-full' style={{maxHeight: '16rem', overflowY: 'auto'}}>
                                        <table className='casino_table w-full text-sm'>
                                            <thead><tr><th>Número</th><th>Cantidad</th></tr></thead>
                                            <tbody>
                                                {entries.map(([num, count]) => (
                                                    <tr key={num}><td>{num}</td><td>{count}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                        <button type='button' onClick={() => refTicketsModal.current?.close()} className='casino_btn casino_btn_red w-[80%]'>
                            Cerrar
                        </button>
                    </div>
                </dialog>
                <form onSubmit={(e) => pay(e)} className="flex flex-col items-center h-full w-full p-10 gap-10 text-white">
                    <div data-aos="zoom-in" className="casino_credit_card grid grid-rows-[auto_1fr_1fr] gap-5 min-h-[200px] w-[90%] sm:w-[60%] md:w-[80%] lg:w-[55%] p-5">
                        <div className="flex justify-between">
                            <Image src={chip} height={10} width={50} className="rounded-md" alt="chip tarjeta"/>
                            <p className="casino_marquee text-xl">Tarjeta</p>
                        </div>
                        <div>
                            <p className="text-[0.9rem] font-semibold">Numero de tarjeta:</p>
                            <p>**** **** **** ****</p>
                        </div>
                        <div className="flex justify-between w-full">
                            <div>
                                <p className="text-[0.9rem] font-semibold">Vencimiento:</p>
                                <p>xx / xx</p>
                            </div>                                
                            <div>
                                <p className="text-[0.9rem] font-semibold">CVV:</p>
                                <p>***</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5 w-full">
                        <label className="flex flex-col text-[0.9rem] font-semibold">
                            <div>Nombre y apellido del tarjetahabiente<span className="text-red-500">*</span></div>
                            <input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="casino_input font-normal" />
                        </label>
                        <label className="flex flex-col text-[0.9rem] font-semibold casino_underline">
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
                            <label className="flex flex-col text-[0.9rem] font-semibold w-[49%] casino_underline">
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
                            <label className="flex flex-col text-[0.9rem] font-semibold w-[49%] casino_underline">
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
                    <label className="flex flex-col text-[0.9rem] font-semibold w-[100%]">
                        <div>Cantidad a donar<span className="text-red-500">*</span></div>
                        <div className="flex gap-1 w-full">
                            <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="casino_input w-[150px] font-normal" />
                            <p>$ Pesos MXN</p>
                        </div>
                        <p className="text-[0.8rem] text-white/60">Solo se aceptan cantidades en múltiplos de $100 (ej. $100, $200, $300).</p>
                    </label>
                    {error && <p className="casino_error m-0 text-right w-full">{error}</p>}
                    <label className="flex gap-2">
                        <input checked={checkBox} onChange={(e) => setCheckBox(e.target.checked)} type="checkbox" className="cursor-pointer active:scale-80 accent-[#ffd23f] w-5 h-5"/>
                        Acepto terminos y condiciones.                            
                    </label>
                    <div className="flex justify-between w-full">
                        <Link href={'/'} className="casino_btn casino_btn_ghost">
                            <FaArrowLeft />Regresar
                        </Link>
                        <button type="submit"
                            disabled={!stripe || !elements || loading}
                            className="casino_btn casino_btn_red">
                            {loading? "Procesando...": `Donar $${amount} MXN`}
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}

export default function Donar () {
    return (
        <>
            <NavBar />
            <main className="grid md:grid-cols-[1fr_1fr] p-2 min-h-dvh max-h-full">
                <Elements stripe={stripePromise}>
                    <FormPayment />
                </Elements>
            </main>                
        </>
    )
}
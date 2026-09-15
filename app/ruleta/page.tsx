"use client"

import { Wheel } from 'spin-wheel';
import { io } from 'socket.io-client';
import NavBar from "@/components/navbar";
import { useEffect, useState, useRef } from "react";
import { FaArrowAltCircleRight, FaCircle, FaTicketAlt, FaPlus } from "react-icons/fa";
import mini_ruleta from '@/public/images/mini_ruleta.png';
import '@/app/styles.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MessageFloating from '@/components/messageFloating';
import { messageFloating, messageType } from '@/components/messageFloating';

const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_API}`);

const segments = {
    "items": [
        {id: "1", label: "1"},
        {id: "2", label: "2"},
        {id: "3", label: "3"},
        {id: "4", label: "4"},
        {id: "5", label: "5"},
        {id: "6", label: "6"},
        {id: "7", label: "7"},
        {id: "8", label: "8"},
        {id: "9", label: "9"},
        {id: "10", label: "10"},
    ], 
    onRest: (event: any) => {
        console.log(event.currentIndex)
    },
    itemLabelFontSizeMax: 20,
}

interface GameData {
    id: number
    title: string
    start_datetime:string
    end_datetime: string
    max_capacity: number
    description: string
    created_at: string
}

interface RoundData {
    id?: number
    game_id: number
    number: number
    spins: number
    total_current_spins: number
}

interface TicketData {
    id?: number
    user_id?: number
    game_id?: number
    donation_id?: number
}

export default function Ruleta () {
    const [currentGameData, setCurrentGameData] = useState<GameData>();
    const [currentRoundData, setCurrentRoundData] = useState<RoundData>({
        game_id: 0,
        number: 1,
        spins: 0,
        total_current_spins: 0,
    });
    const [currentTickets, setCurrentTickets] = useState<TicketData>();
    const [currentTotalTickets, setCurrentTotalTickets] = useState<number>();

    const [role, setRole] = useState<string>();
    const [showMessageFloating, setShowMessageFloating] = useState<boolean>(false);
    const [messageFloating, setMessageFloating] = useState<messageFloating>({show: false, messages: [], type: 'info'});
    // const [winningNumber, setWinningNumber] = useState<number>();

    // const refWinningNumber = useRef<number | null | undefined>(null);
    const refDivRoulette = useRef<HTMLDivElement>(null);
    const refRoulette = useRef<any>(null);
    const refModal = useRef<HTMLDialogElement>(null);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');

        const roulette = new Wheel(refDivRoulette.current, segments);
                
        refRoulette.current = roulette;

        socket.on("spin", (winning_number) => {
            console.log("Evento spin creado");
            console.log("GIRANDO A TODOS")
            refRoulette.current?.spinToItem(
                winning_number - 1, // numero ganador 
                10000, // tiempo girando
                false, // cae en numero ganador pero si en el centro o no
                20, // numero de vueltas
                1 // direccion
            )
        })

        async function getCurrentGame () {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getCurrentGame`, {
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${token}`,
                        'content-type': 'application/json',
                    },
                })

                if (response.status != 200) {
                    console.log("Error al obtener datos del juego")
                    return
                }

                const dataGame = await response.json();

                console.log(dataGame);
                setCurrentGameData(dataGame);
                getCurrentRoundGame(dataGame.id, false);
                getTickets(dataGame.id);

            } catch (error) {
                refModal.current?.showModal();
                console.log("Error in getCurrentGame frontend: ", error)
            }
        }

        getCurrentGame();

        async function getDataUser () {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getDataUser`, {
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })

                const data = await response.json();

                const role = data.role;

                if (role && role === 'admin') {
                    setRole("admin");
                } 
            } catch (error) {
                console.log("Error in Ruleta/getDataUser: ", error)
            }
        }

        getDataUser();

        return () => {
            roulette.remove();
            socket.off("spin");
        }

    }, [])

    async function getTickets (game_id: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getTickets?game_id=${game_id}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`,
                },
            })

            const dataTickets = await response.json()

            if (response.status != 200) {
                console.log("Error al obtener tickets.")
                return
            }

            const total_tickets = dataTickets.length;
            setCurrentTickets(dataTickets);
            setCurrentTotalTickets(total_tickets);

        } catch (error) {
            console.log("Error in getTickets: ", error)
        }
    }

    async function postSpin (round_id: number, total_current_spins: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/postSpin`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    round_id: round_id,
                    total_current_spins: total_current_spins,
                })
            })

            const dataSpin = await response.json();

            if (response.status != 200) {
                setShowMessageFloating(true);
                setMessageFloating({show: true, messages: dataSpin.error, type: 'bad'});
                return;
            }

            console.log("DATOS DE GIRO: ", dataSpin)

            const winning_number = dataSpin.winning_number

            socket.emit("spin", winning_number);

        } catch (error) {
            setShowMessageFloating(true);
            setMessageFloating({show: true, messages: ["Error al realizar el giro, intentalo de nuevo."], type: 'bad'});
            console.log("Error in postSpin: ", error)
        } finally {
            setTimeout(() => setShowMessageFloating(false), 10000)
        }
    }

    async function getCurrentRoundGame (game_id: number, makePostSpin: boolean) {

        const token = localStorage.getItem('token');

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getCurrentRoundGame?game_id=${game_id}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                }
            })

            if (response.status != 200) {
                console.log("Error al obtener ronda actual")
                return
            }

            const dataRound = await response.json();

            console.log(dataRound)
            setCurrentRoundData((prev: any) => ({...prev, spins: dataRound.spins, number: dataRound.number, total_current_spins: dataRound.total_current_spins}));

            if(makePostSpin) {
                await postSpin(dataRound.id, dataRound.total_current_spins);
                await getCurrentRoundGame(game_id, false);
            }

        } catch (error) {
            console.log("Error in getCurrentRoundGame frontend: ", error)
        }
    }

    return (
        <>
            <NavBar />
            <dialog ref={refModal} className='backdrop:bg-black/80 bg-[rgba(0,0,0,0)] border-1 border-red-700 m-auto rounded-md text-center w-[70%] sm;w-[50%] md:w-[40%] lg:w-[30%]'>
                <div className='flex flex-col bg-[rgba(50,0,0,0.9)] p-5 gap-5'>
                    <div className='flex justify-start items-center w-full'>
                        <p onClick={() => router.back()} className='text-white cursor-pointer active:scale-90 hover:underline hover:text-blue-400'>{'< '}regresar</p>
                    </div>
                    <div className='flex justify-center w-full'>
                        <Image src={mini_ruleta} width={100} height={100} className='animation_mini_ruleta' alt='mini ruleta' />
                    </div>
                    <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
                        No hay juegos activos, regresa mas tarde!.
                    </p>
                </div>
            </dialog>
            <div className=" flex flex-col bg-[rgba(30,0,0)] h-auto min-h-dvh py-5 px-10 gap-5">
                {showMessageFloating ? <MessageFloating show={messageFloating?.show} messages={messageFloating?.messages} type={messageFloating?.type} /> : null}
                <div className="flex flex-col md:flex-col justify-between items-center text-white gap-10">
                    <div className='flex justify-between w-full'>
                        <h1 className="text-3xl font-bold w-full md:w-[70%] lg:w-[50%]">{currentGameData?.title}</h1>
                        <div className='flex flex-col text-end gap-1'>
                            <p className='text-[0.9rem]'>Fecha de finalizacion del juego: <span className='font-semibold'>{`${currentGameData?.end_datetime.split("T")[0]} - ${currentGameData?.end_datetime.split("T")[1].slice(0, 5)}hrs`}</span></p>
                            <p className="flex justify-end items-center font-bold text-2xl gap-1">Tus tickets: {currentTotalTickets}<FaTicketAlt className="inline rotate-125"/></p>
                        </div>                        
                    </div>
                    <div className="flex flex-row justify-around items-center w-full gap-5">
                        <p>{`Ronda: ${currentRoundData?.number}/5`}</p>
                        <p>{`Giros ${currentRoundData?.total_current_spins}/${currentRoundData?.spins}`}</p>
                        <p>Jugadores: 3758 / 5000</p>
                    </div>
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-10">
                    <div className='flex flex-col justify-center items-center gap-5'>
                        <div className='w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px]' ref={refDivRoulette} />
                        {role === 'admin' ? (
                            <button onClick={ () => getCurrentRoundGame(currentGameData!.id, true)} 
                                className={'w-[50%] rounded-xl text-xl font-semibold text-black bg-linear-to-r from-yellow-500 to-yellow-200 py-3 px-2 cursor-pointer active:scale-95' + (currentRoundData?.total_current_spins >= 10 ? ' hidden ' : ' block ')}>
                                    Girar
                            </button>  
                        ) : null}    
                        {currentRoundData?.total_current_spins >= 10 ? (
                            <p className='text-xl text-red-600 font-bold'>Juego finalizado.</p>
                        ) : null}                                            
                    </div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <div className="flex flex-col bg-[rgba(100,0,0,0.5)] w-full sm:w-[80%] lg:w-[100%] max-h-[300px] border-2 border-red-500 h-auto px-5 py-5 rounded-lg text-white gap-3">
                            <h1 className="font-semibold text-xl">Progreso del sorteo</h1>
                            <div className="flex flex-col gap-5 overflow-y-scroll px-3">
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Ronda 1</p>
                                    <p className="flex items-center gap-2">5000 <FaArrowAltCircleRight /> 2500</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Ronda 2</p>
                                    <p className="flex items-center gap-2">2500 <FaArrowAltCircleRight /> 1000</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Ronda 3</p>
                                    <p className="flex items-center gap-2">1000 <FaArrowAltCircleRight /> 100</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Ronda 4</p>
                                    <p className="flex items-center gap-2">100 <FaArrowAltCircleRight /> 10</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Ronda 5</p>
                                    <p className="flex items-center gap-2">10 <FaArrowAltCircleRight /> 10</p>
                                </div> 
                            </div>
                        </div>
                        <div className="flex flex-col bg-[rgba(100,0,0,0.5)] w-full sm:w-[80%] lg:w-[100%] max-h-[300px] border-2 border-red-500 h-auto px-5 py-5 rounded-lg text-white gap-3">
                            <h1 className="font-semibold text-xl">Ultimos resultados</h1>
                            <div className="flex flex-col gap-5 overflow-y-scroll px-3">
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 5</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 6</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 4</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 3</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 3</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 1</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 2</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 9</p>
                                </div>
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 1</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 7</p>
                                </div> 
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 1</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 7</p>
                                </div> 
                                <div className="flex justify-between text-lg border-b-1 gap-2">
                                    <p>Giro 1</p>
                                    <p className="flex items-center gap-2">Numero <FaArrowAltCircleRight /> 7</p>
                                </div> 
                            </div>                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
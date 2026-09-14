"use client"

import { Wheel } from 'spin-wheel';
import { io } from 'socket.io-client';
import NavBar from "@/components/navbar";
import { useEffect, useState, useRef } from "react";
import { FaArrowAltCircleRight, FaCircle, FaTicketAlt } from "react-icons/fa";

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
    id: number
    game_id: number
    number: number
    spins: number
}

export default function Ruleta () {
    const [currentGameData, setCurrentGameData] = useState<GameData>();
    const [currentRoundData, setCurrentRoundData] = useState<RoundData>();
    // const [winningNumber, setWinningNumber] = useState<number>();

    // const refWinningNumber = useRef<number | null | undefined>(null);
    const refDivRoulette = useRef<HTMLDivElement>(null);
    const refRoulette = useRef<any>(null);

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
                getCurrentRoundGame(dataGame.id, false)

            } catch (error) {
                console.log("Error in getCurrentGame frontend: ", error)
            }
        }

        getCurrentGame();

        return () => {
            roulette.remove();
            socket.off("spin");
        }

    }, [])

    async function postSpin (round_id: number) {

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
                })
            })

            if (response.status != 200) {
                console.log("Error al registrar el giro. Giro invalido.");
                return
            }

            const dataSpin = await response.json();

            console.log("DATOS DE GIRO: ", dataSpin)

            const winning_number = dataSpin.winning_number

            socket.emit("spin", winning_number);

        } catch (error) {
            console.log("Error in postSpin: ", error)
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
            setCurrentRoundData(dataRound);

            if(makePostSpin) {
                postSpin(dataRound.id)
            }

        } catch (error) {
            console.log("Error in getCurrentRoundGame frontend: ", error)
        }
    }

    return (
        <>
            <NavBar />
            <div className=" flex flex-col bg-[rgba(30,0,0)] h-auto min-h-dvh py-5 px-10 gap-5">
                <div className="flex flex-col md:flex-row justify-between items-center text-white gap-10">
                    <h1 className="text-3xl font-bold w-full md:w-[70%] lg:w-[50%]">Juego de ruleta para donaciones mayores a 100 pesos (Titulo de ruleta)</h1>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-5">
                        <p className="font-bold text-2xl">Tus tickets: 1 <FaTicketAlt className="inline rotate-125"/></p>
                        <div className="flex gap-10">
                            <p>Jugadores: 3758 / 5000</p>
                            <p className="flex items-center gap-2"><FaCircle className="text-red-500" />Juego inactivo</p>
                        </div>                    
                    </div>
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-10">
                    <div className='flex flex-col justify-center items-center gap-5'>
                        <div className='w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px]' ref={refDivRoulette} />
                        <button onClick={ () => {
                            getCurrentRoundGame(currentGameData!.id, true)
                        }} 
                        className='w-[50%] rounded-xl text-xl font-semibold text-black bg-linear-to-r from-yellow-500 to-yellow-200 py-3 px-2 cursor-pointer active:scale-95'>
                            Girar
                        </button>
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
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
import 'aos/dist/aos.css';
import AOS from 'aos';

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

interface Prize {
    name: string
    type: string
    value: number
    round: number
    roulette_number: number
}

interface RoundsData {
    id: number
    game_id: number
    number: number
    spins: number
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

interface WinningTickets {
    id?: number
	winning_number: number
	game_id: number 
	round_number: number
	spin_number: number
	prize_name: number
	created_at?: string
}

interface RouletteData {
    items: Array<{ id: number; label: string }>
    onRest: (event: any) => void
    itemLabelFontSizeMax: number
}

const initialRouletteData: RouletteData = {
    items: Array.from({ length: 10 }, (_, index) => ({
        id: index + 1,
        label: `${index + 1}`,
    })),
    onRest: (event: any) => {
        console.log(event.currentIndex);
    },
    itemLabelFontSizeMax: 20,
};

let IndexWinningTicket = 0;

export default function Ruleta () {
    const [currentGameData, setCurrentGameData] = useState<GameData>();
    const [rounds, setRounds] = useState<RoundsData[]>();
    const [currentRoundData, setCurrentRoundData] = useState<RoundData>({
        game_id: 0,
        number: 1,
        spins: 0,
        total_current_spins: 0,
    });
    const [stateWinningTickets, setStateWinningTickets] = useState<WinningTickets[]>([]);
    const [currentTickets, setCurrentTickets] = useState<TicketData>();
    const [currentTotalTickets, setCurrentTotalTickets] = useState<number>();
    const [currentUsersWithDonation, setCurrentUsersWithDonation] = useState<number>();
    const [winningNumber, setWinningNumber] = useState<number>();
    const [rouletteData, setRouletteData] = useState<RouletteData>(initialRouletteData);
    const [role, setRole] = useState<string>();
    const [showMessageFloating, setShowMessageFloating] = useState<boolean>(false);
    const [messageFloating, setMessageFloating] = useState<messageFloating>({show: false, messages: [], type: 'info'});
    // Número ganador que se muestra en la animación estilo casino al terminar el giro.
    const [winnerCelebration, setWinnerCelebration] = useState<{ number: number, prize: string | null } | null>(null);

    const refDivRoulette = useRef<HTMLDivElement>(null);
    const refRoulette = useRef<any>(null);
    const refModal = useRef<HTMLDialogElement>(null);
    // Guarda el game_id vigente para poder re-sincronizar premios al reconectar el socket
    const refCurrentGameId = useRef<number | undefined>(undefined);
    // Identifica la carga de premios más reciente para ignorar respuestas atrasadas.
    const refPrizeRequestId = useRef(0);
    // Invalida cargas REST que hayan empezado antes de recibir un resultado por socket.
    const refWinningTicketsVersion = useRef(0);
    // true mientras la ruleta está animando un giro
    const refIsSpinning = useRef<boolean>(false);
    // Siempre apunta a los premios más recientes conocidos.
    const refCurrentRouletteData = useRef<RouletteData>(initialRouletteData);
    // Ganador del giro en curso; se muestra cuando la ruleta se detiene (onRest).
    const refPendingWinner = useRef<{ number: number, prize: string | null } | null>(null);
    const refCelebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const router = useRouter();

    function createRoulette (dataRoulette: RouletteData | undefined) {
        if (!refDivRoulette.current || !dataRoulette?.items?.length) {
            return;
        }

        const originalOnRest = dataRoulette.onRest;

        // Envolvemos onRest para saber cuándo termina realmente la animación:
        // ahí liberamos el flag de "girando" y resincronizamos con los premios
        // más recientes conocidos (por si la ronda cambió mientras se giraba,
        // incluso si ese cambio llegó a pisar la ruleta antes de que empezara
        // a girar visualmente).
        const dataRouletteWithRestHook: RouletteData = {
            ...dataRoulette,
            onRest: (event: any) => {
                refIsSpinning.current = false;
                originalOnRest?.(event);

                if (refPendingWinner.current) {
                    setWinnerCelebration(refPendingWinner.current);
                    refPendingWinner.current = null;

                    if (refCelebrationTimeout.current) {
                        clearTimeout(refCelebrationTimeout.current);
                    }
                    refCelebrationTimeout.current = setTimeout(() => setWinnerCelebration(null), 8000);
                }
            },
        };

        refRoulette.current?.remove();
        refRoulette.current = new Wheel(refDivRoulette.current, dataRouletteWithRestHook);
    }

    useEffect(() => {
        refCurrentRouletteData.current = rouletteData;

        if (refIsSpinning.current) {
            // Cambiar los segmentos conserva la rotación actual y no reinicia el giro.
            if (refRoulette.current) {
                refRoulette.current.items = rouletteData.items;
            }
            return;
        }

        createRoulette(rouletteData);
    }, [rouletteData]);

    async function loadRoundPrizes (gameId: number, roundNumber: number) {
        const requestId = ++refPrizeRequestId.current;
        const result = await getPrizes(gameId, roundNumber);

        if (!result) {
            console.log("Error al cargar ruleta datos.")
            return
        }

        const { dataRoulette, dataPrizes } = result;

        if (requestId !== refPrizeRequestId.current || !dataRoulette) {
            return;
        }

        refCurrentRouletteData.current = dataRoulette;

        if (refIsSpinning.current) {
            if (refRoulette.current) {
                refRoulette.current.items = dataRoulette.items;
            }
        } else {
            setRouletteData(dataRoulette);
        }
    }

    // Respaldo: si la ronda cambia en vivo (p.ej. por el evento "updateRoundSpins"),
    // vuelve a traer los premios de la nueva ronda.
    useEffect(() => {
        if (!currentRoundData.game_id || !currentRoundData.number) {
            return;
        }

        async function loadCurrentRoundPrizes () {
            await loadRoundPrizes(currentRoundData.game_id, currentRoundData.number);
        }

        loadCurrentRoundPrizes();
    }, [currentRoundData.game_id, currentRoundData.number]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        socket.on("spin", (winning_number, dataRoulette) => {
            console.log("Evento spin creado");
            console.log("GIRANDO A TODOS")

            if (refRoulette.current) {
                refRoulette.current.items = dataRoulette.items;
            } else {
                createRoulette(dataRoulette);
            }

            const winningItemIndex = dataRoulette.items.findIndex(
                (item: { id: number }) => Number(item.id) === Number(winning_number)
            );

            if (winningItemIndex < 0) {
                console.error("El número ganador no existe en los segmentos de la ruleta", {
                    winning_number,
                    items: dataRoulette.items,
                });
                return;
            }

            const winningLabel: string = dataRoulette.items[winningItemIndex].label ?? "";
            const prizeMatch = winningLabel.match(/^\d+\.\s*(.+)$/);
            refPendingWinner.current = {
                number: Number(winning_number),
                prize: prizeMatch ? prizeMatch[1] : null,
            };

            refIsSpinning.current = true;
            refRoulette.current?.spinToItem(
                winningItemIndex,
                10000, // tiempo girando
                false, // cae en numero ganador pero si en el centro o no
                20, // numero de vueltas
                1 // direccion
            )
        })

        socket.on("prizesUpdated", (dataRoulette) => {
            setRouletteData(dataRoulette);
        });

        socket.on("updateRoundSpins", (number, spins, total_current_spins, dataRoulette) => {
            console.log("DATA REAL ROUND: ", number, spins, total_current_spins)
            setCurrentRoundData((prev: any) => ({...prev, spins: spins, number: number, total_current_spins: total_current_spins}));            

            if (dataRoulette) {
                refCurrentRouletteData.current = dataRoulette;

                if (refRoulette.current) {
                    refRoulette.current.items = dataRoulette.items;
                } else {
                    setRouletteData(dataRoulette);
                }
            } else if (refCurrentGameId.current) {
                loadRoundPrizes(refCurrentGameId.current, Number(number));
            }
        })

        socket.on("latestResults", (winningNumber, game_id, round_number, spin_number, prize_name) => {
            console.log("PRUEBA latestResults: ", winningNumber, game_id, round_number, spin_number, prize_name)
            refWinningTicketsVersion.current += 1;
            setStateWinningTickets((prev: WinningTickets[]) => [...prev, ({winning_number: winningNumber, game_id: game_id, round_number: round_number, spin_number: spin_number, prize_name: prize_name ?? "Sin premio"})])
        })

        // Si el socket se reconecta (red inestable, cambio de pestaña en móvil, etc.),
        // se vuelve a pedir la ronda y los premios actuales para que este dispositivo
        // quede sincronizado sin necesidad de esperar a que alguien gire la ruleta.
        socket.on("connect", () => {
            if (refCurrentGameId.current) {
                getCurrentRoundGame(refCurrentGameId.current, false, false);
                // Pide los premios actuales por socket (no depende del fetch REST
                // individual de este dispositivo ni de que alguien presione "Girar").
                // Requiere un handler "getCurrentPrizes" en el backend que responda con "prizesUpdated".
                socket.emit("getCurrentPrizes", refCurrentGameId.current);
            }
        });

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
                refCurrentGameId.current = dataGame.id;
                // Pide los premios actuales por socket apenas se carga la página,
                // sin depender del fetch REST individual ni del botón "Girar".
                // Requiere un handler "getCurrentPrizes" en el backend que responda con "prizesUpdated".
                socket.emit("getCurrentPrizes", dataGame.id);
                await getCurrentRoundGame(dataGame.id, false, false);
                getTickets(dataGame.id);
                getRounds(dataGame.id);
                getUsersWithDonation(dataGame.id);
                getWinningTickets(dataGame.id);

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

        AOS.init({
            duration: 1000, 
            delay: 0,
            once: false,
        })

        return () => {
            refRoulette.current?.remove();
            if (refCelebrationTimeout.current) {
                clearTimeout(refCelebrationTimeout.current);
            }
            socket.off("spin");
            socket.off("prizesUpdated");
            socket.off("updateRoundSpins");
            socket.off("latestResults");
            socket.off("connect");
        }

    }, []);

    async function getWinningTickets (game_id: number) {
        try {
            const requestVersion = refWinningTicketsVersion.current;

            const token = localStorage.getItem('token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getWinningTickets?game_id=${game_id}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
            })

            const data = await response.json();

            if (response.status != 200) {
                console.log("Error in getWinningTickets frontend.")
                return;
            }

            console.log("WINNING TICKETSSSSS: ", data);
            if (requestVersion !== refWinningTicketsVersion.current) {
                return;
            }
            setStateWinningTickets(data);

        } catch (error) {
            console.log("Error in getWinningTickets: ", error)
        }
    }

    async function postWinningTickets (winning_number: number, game_id: number, dataRound: RoundData, dataSpin: any, dataPrizes: any) {
        try {

            const token = localStorage.getItem('token');

            console.log("DATAROUNDD WINNINGS: ", dataRound)
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/postWinningTickets`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    winning_number: winning_number,
                    game_id: game_id, 
                    dataRound: dataRound, 
                    dataSpin: dataSpin, 
                    dataPrizes: dataPrizes,
                })
            })

            const data = await response.json();

            if (response.status != 200) {
                console.log("Error in postWinningTickets fontend: ", data);
            }
            //console.log("POST WINNING: ", data)
            socket.emit("latestResults", data.winning_number, data.game_id, data.round_number, data.spin_number, data.prize_name)
            //console.log("POST WINNING:", data)

        } catch (error) {
            console.log("Error in postWinningTickets: ", error);
        }
    }

    async function getUsersWithDonation (game_id: number) {

        const token = localStorage.getItem('token');

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getUsersWithDonation?game_id=${game_id}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
            })

            if (response.status != 200) {
                console.log("Error al obtener donantes participantes.");
            }

            const data = await response.json();
            //console.log("JUGADORES ACTUALES: ", data);

            setCurrentUsersWithDonation(data);

        } catch (error) {
            console.log("Error in getUsersWithDonation frontend: ", error)
        }
    }

    async function getRounds (game_id: number) {

        const token = localStorage.getItem('token');

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getRounds?game_id=${game_id}`, {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token}`,
                    'content-type': 'application/json',
                }
            })

            if (response.status != 200) {
                console.log("Error al obtener rondas.")
                return
            }

            const data = await response.json();
            console.log("rounds: ", data)

            setRounds(data);

        } catch (error) {
            console.log("Error in getRounds: ", error)
        }
    }

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

    async function deleteTicket (game_id?: number, winning_number?: number) {

        const token = localStorage.getItem('token');

        console.log("OAKOAKKOAAKA: ", game_id, winning_number)

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/deleteTicket`, {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    game_id: game_id,
                    winning_number: winning_number,
                })
            })

            const data = await response.json();

            if (response.status != 200) {
                console.log("Error en response deleteTicket.")
                return
            }

            console.log("numeros borrados: ", data);

        } catch (error) {
            console.log("Error in deleteTicket frontend: ", error)
        }
    }

    async function postSpin (dataRound: RoundData) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/postSpin`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    round_id: dataRound.id,
                    total_current_spins: dataRound.total_current_spins,
                })
            })

            const dataSpin = await response.json();

            if (response.status != 200) {
                setShowMessageFloating(true);
                setMessageFloating({show: true, messages: dataSpin.error, type: 'bad'});
                return;
            }

            console.log("DATOS DE GIRO: ", dataSpin)

            //const winning_number = await dataSpin.winning_number

            deleteTicket(currentGameData?.id, dataSpin.winning_number)
            //console.log("ID y numero ganador DE JUEGO: ", currentGameData?.id, winning_number)

            const result = await getPrizes(currentGameData!.id, dataRound.number);

            if (!result) {
                console.log("Error al generar ultimo resultado en tiempo real.")
                return
            }

            const { dataRoulette, dataPrizes } = result;
            console.log("DATATATA round: ", dataRound)
            await postWinningTickets(dataSpin.winning_number, currentGameData!.id, dataRound, dataSpin, dataPrizes)

            socket.emit("spin", dataSpin.winning_number, dataRoulette);

        } catch (error) {
            setShowMessageFloating(true);
            setMessageFloating({show: true, messages: ["Error al realizar el giro, intentalo de nuevo."], type: 'bad'});
            console.log("Error in postSpin: ", error)
        } finally {
            setTimeout(() => setShowMessageFloating(false), 10000)
        }
    }

    async function getCurrentRoundGame (game_id: number, makePostSpin: boolean, updateRoundSpins: boolean) {

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

            console.log("CURRENT DATAROUND: ", dataRound)

            setCurrentRoundData((prev: any) => ({...prev, game_id: game_id, spins: dataRound.spins, number: dataRound.number, total_current_spins: dataRound.total_current_spins}));

            if (updateRoundSpins) {
                const result = await getPrizes(game_id, dataRound.number);

                if (!result) {
                    console.log("Error al transmitir rondas.")
                    return
                }

                const { dataRoulette, dataPrizes } = result

                socket.emit(
                    "updateRoundSpins",
                    dataRound.number,
                    dataRound.spins,
                    dataRound.total_current_spins,
                    dataRoulette
                )
            }

            if(makePostSpin) {
                await postSpin(dataRound);
                await getCurrentRoundGame(game_id, false, true);
            }

        } catch (error) {
            console.log("Error in getCurrentRoundGame frontend: ", error)
        }
    }

    async function getPrizes (game_id: number, currentRound?: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getPrizes?gameId=${game_id}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application/json',
                },
            })

            if (response.status !== 200) {
                console.log("Error in response roulette/getPrizes");
                return
            }

            const responseData = await response.json();
            const dataPrizes: Prize[] = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.prizes)
                    ? responseData.prizes
                    : [];
            console.log("PREMIOS: ", dataPrizes)

            const roundPrizes = currentRound === undefined
                ? dataPrizes
                : dataPrizes.filter((obj: Prize) => Number(obj.round) === Number(currentRound));

            const prizes = Array.from({ length: 10 }, (_, index) => {
                const rouletteNumber = index + 1;
                const prize = roundPrizes.find(
                    (obj: Prize) => Number(obj.roulette_number) === rouletteNumber
                );

                return {
                    id: rouletteNumber,
                    label: prize
                        ? `${rouletteNumber}. ${prize.name}`
                        : `${rouletteNumber}`,
                };
            });

            const dataRoulette: RouletteData = {
                "items": prizes, 
                onRest: (event: any) => {
                    console.log(event.currentIndex)
                },
                itemLabelFontSizeMax: 20,
            }

            return { dataRoulette, dataPrizes }

        } catch (error) {
            console.log("Error in ruleta/getPrizes: ", error);
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
            {winnerCelebration ? (
                <div onClick={() => setWinnerCelebration(null)} className='casino_overlay fixed inset-0 z-50 flex flex-col justify-center items-center bg-black/85 cursor-pointer px-4 overflow-hidden'>
                    {Array.from({ length: 24 }, (_, i) => (
                        <span key={i} className='casino_coin' style={{ left: `${(i * 4.3) % 100}%`, animationDelay: `${(i % 8) * 0.25}s`, animationDuration: `${2.5 + (i % 5) * 0.4}s` }} />
                    ))}
                    <div className='casino_frame flex flex-col items-center gap-4 rounded-3xl border-4 border-yellow-400 bg-[rgb(60,0,0)] px-8 py-10 sm:px-16 text-center'>
                        <p className='casino_title text-2xl sm:text-4xl font-extrabold tracking-widest text-yellow-300'>¡NÚMERO GANADOR!</p>
                        <div className='casino_number flex justify-center items-center w-40 h-40 sm:w-56 sm:h-56 rounded-full border-8 border-yellow-300 bg-linear-to-b from-red-600 to-red-900 text-7xl sm:text-9xl font-black text-white'>
                            {winnerCelebration.number}
                        </div>
                        {winnerCelebration.prize ? (
                            <p className='text-xl sm:text-3xl font-bold text-yellow-200'>Premio: {winnerCelebration.prize}</p>
                        ) : null}
                        <p className='text-sm text-white/60'>Toca para cerrar</p>
                    </div>
                </div>
            ) : null}
            <div className=" flex flex-col bg-[rgb(30,0,0)] h-auto min-h-dvh py-5 px-10 gap-20">
                {showMessageFloating ? <MessageFloating show={messageFloating?.show} messages={messageFloating?.messages} type={messageFloating?.type} /> : null}
                <div className="flex flex-col md:flex-col justify-between items-center text-white gap-10">
                    <div className='flex justify-between w-full'>
                        <h1 data-aos='zoom-in' className="text-4xl font-bold w-full md:w-[70%] lg:w-[50%]">{currentGameData?.title}</h1>
                        <div className='flex flex-col text-end gap-1'>
                            <p className='text-[0.9rem]'>Fecha de finalizacion del juego: <span className='font-semibold'>{`${currentGameData?.end_datetime.split("T")[0]} - ${currentGameData?.end_datetime.split("T")[1].slice(0, 5)}hrs`}</span></p>
                            <p className="flex justify-end items-center font-bold text-2xl gap-1">Tus tickets: {currentTotalTickets}<FaTicketAlt className="inline rotate-125"/></p>
                        </div>                        
                    </div>
                    <div className="flex flex-row justify-around items-center w-full gap-5">
                        <p className='text-lg font-semibold'>{`Ronda: ${currentRoundData?.number}/5`}</p>
                        <p className='text-lg font-semibold'>{`Giro ${currentRoundData?.total_current_spins}/${currentRoundData?.spins}`}</p>
                        <p className='text-lg font-semibold'>{`Donadores: ${currentUsersWithDonation ?? 0} / ${currentGameData?.max_capacity ?? 0}`}</p>
                    </div>
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-10">
                    <div className='flex flex-col justify-center items-center gap-5'>
                        <div data-aos='zoom-in' className='w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] pointer-events-none' ref={refDivRoulette} />
                        {role === 'admin' ? (
                            <button onClick={ () => getCurrentRoundGame(currentGameData!.id, true, false)} 
                                className={'w-[50%] rounded-xl text-xl font-bold text-black bg-linear-to-r from-[rgb(249,255,86)] to-[rgb(252,255,168)] shadow-[0px_0px_20px_yellow] py-3 px-2 cursor-pointer active:scale-95' + (currentRoundData?.total_current_spins >= 10 ? ' hidden ' : ' block ')}>
                                    Girar
                            </button>  
                        ) : null}    
                        {currentRoundData?.total_current_spins >= 10 ? (
                            <p className='text-xl text-red-600 font-bold'>Juego finalizado.</p>
                        ) : null}                                            
                    </div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <div data-aos='flip-right' className="flex flex-col bg-[rgba(100,0,0,0.5)] shadow-[0px_0px_30px_red] w-full sm:w-[80%] lg:w-[100%] max-h-[300px] min-h-[300px] border-2 border-red-500 h-auto px-5 py-5 rounded-lg text-white gap-3">
                            <h1 className="font-bold text-xl">Progreso del sorteo</h1>
                            <div className="flex flex-col gap-5 overflow-y-scroll px-3">
                                {rounds?.map((round: RoundsData) => (
                                    <div key={round.id} className={"flex justify-between pb-1 text-lg border-b-3 font-semibold gap-2" + (currentRoundData.number === round.number ? '  ' : ' opacity-50 ')}>
                                        <div className='flex items-center gap-1'>
                                            <p className='px-4 py-1 rounded-4xl bg-yellow-500 text-2xl text-center'>{round.number}</p>
                                            <p>Ronda</p>
                                        </div>
                                        {round.number === 1 ? <p className='flex items-center gap-2'>5000<FaArrowAltCircleRight />2500</p> : null}
                                        {round.number === 2 ? <p className='flex items-center gap-2'>2500<FaArrowAltCircleRight />1000</p> : null}
                                        {round.number === 3 ? <p className='flex items-center gap-2'>1000<FaArrowAltCircleRight />100</p> : null}
                                        {round.number === 4 ? <p className='flex items-center gap-2'>100<FaArrowAltCircleRight />10</p> : null}
                                        {round.number === 5 ? <p className='flex items-center gap-2'>10<FaArrowAltCircleRight />10</p> : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div data-aos='flip-left' className="flex flex-col bg-[rgba(100,0,0,0.5)] shadow-[0px_0px_30px_red] w-full sm:w-[80%] lg:w-[100%] max-h-[300px] min-h-[300px] border-2 border-red-500 h-auto px-5 py-5 rounded-lg text-white gap-3">
                            <h1 className="font-bold text-xl">Ultimos resultados</h1>
                            <div className="flex flex-col gap-5 overflow-y-auto px-3">
                                {stateWinningTickets?.sort((a, b) => b.spin_number - a.spin_number).sort((a, b) => b.round_number - a.round_number).map((obj: WinningTickets, index: number) => (
                                   <div key={IndexWinningTicket++} className="flex justify-between text-lg text-center border-b-1 gap-2">
                                        <p>Ronda {obj.round_number}</p>
                                        <p>Giro {obj.spin_number}</p>                                        
                                        <p className="flex items-center gap-2">Numero {obj.winning_number} <FaArrowAltCircleRight />{obj.prize_name ?? "Sin premio."}</p>
                                    </div> 
                                ))}
                            </div>                            
                        </div>
                    </div>
                </div>
                <div className='flex flex-col text-white gap-10'>
                    <h2 className='text-4xl font-bold'>¿Como funciona?</h2>
                    <div className='flex flex-col md:flex-row text-center'>
                        <div data-aos='fade-right' className='flex flex-col border-b-2 md:border-r-3 md:border-b-0 md:border-b-0 px-6 py-4 md:py-2 gap-2'>
                            <h3 className='text-2xl font-semibold'>Ronda 1</h3> 
                            <p>La ruleta gira 5 veces y los numeros seleccionados pasan a la ronda 2.</p>
                            <p>(5,000 donadores para 2,500 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='flex flex-col border-b-2 md:border-r-3 md:border-b-0 px-6 py-2 gap-2'>
                            <h3 className='text-2xl font-semibold'>Ronda 2</h3> 
                            <p>La ruleta gira 4 veces, los números seleccionados pasan a la Ronda 3.</p>
                            <p>(2,500 donadores para 1,000 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='flex flex-col border-b-2 md:border-r-3 md:border-b-0 px-6 py-2 gap-2'>
                            <h3 className='text-2xl font-semibold'>Ronda 3</h3> 
                            <p>La ruleta gira 1 sola vez, el número ganador pasa a la ronda 4</p>
                            <p>(1,000 donadores para 100 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='flex flex-col border-b-2 md:border-r-3 md:border-b-0 px-6 py-2 gap-2'>
                            <h3 className='text-2xl font-semibold'>Ronda 4</h3> 
                            <p>La ruleta gira 1 solamente una vez, el número ganador pasa a la Ronda 5 y gana premio.</p>
                            <p>(100 donadores para 10 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='flex flex-col border-b-2 md:border-r-3 md:border-b-0 px-6 py-2 gap-2'>
                            <h3 className='text-2xl font-semibold'>Ronda 5</h3> 
                            <p>La ruleta gira 10 veces, otorgando premio en las 10 ocasiones.</p>
                            <p>(10 donadores para 10 donadores)</p>
                        </div> 
                    </div>                    
                </div>
            </div>
        </>
    )
}

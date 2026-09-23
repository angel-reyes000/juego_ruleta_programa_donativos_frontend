"use client"

import MiniRoulette from '@/components/miniRoulette';
import { Wheel } from 'spin-wheel';
import { io } from 'socket.io-client';
import NavBar from "@/components/navbar";
import { useEffect, useState, useRef } from "react";
import { FaArrowAltCircleRight, FaCircle, FaTicketAlt, FaPlus } from "react-icons/fa";
import '@/app/styles.css';
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
    itemLabelFontSizeMax: 32,
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
    status?: 'active' | 'eliminated'
    user_id?: number
    game_id?: number
    donation_id?: number
    ticket_number?: number
}

interface WinnerInfo {
    user_id: number
    display_name: string
}

interface Celebration {
    number: number
    prize: string | null
    winners: WinnerInfo[]
    iAmWinner: boolean
}

interface WinningTickets {
    id?: number
	winning_number: number
	game_id: number 
	round_number: number
	spin_number: number
	prize_name: string | null
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
    itemLabelFontSizeMax: 32,
};

let IndexWinningTicket = 0;

// Aspecto casino de la ruleta: casillas rojo/negro, texto y bordes dorados.
const casinoWheelStyle = {
    itemBackgroundColors: ['#d50032', '#15000c'],
    itemLabelColors: ['#ffd23f'],
    itemLabelStrokeColor: 'rgba(0,0,0,0.6)',
    itemLabelStrokeWidth: 2,
    lineColor: '#ffd23f',
    lineWidth: 2,
    borderColor: '#ffd23f',
    borderWidth: 6,
};

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
    const [currentTotalTickets, setCurrentTotalTickets] = useState<number>();
    const [currentUsersWithDonation, setCurrentUsersWithDonation] = useState<number>();
    const [winningNumber, setWinningNumber] = useState<number>();
    const [rouletteData, setRouletteData] = useState<RouletteData>(initialRouletteData);
    const [role, setRole] = useState<string>();
    const [showMessageFloating, setShowMessageFloating] = useState<boolean>(false);
    const [messageFloating, setMessageFloating] = useState<messageFloating>({show: false, messages: [], type: 'info'});
    // Número ganador que se muestra en la animación estilo casino al terminar el giro.
    const [winnerCelebration, setWinnerCelebration] = useState<Celebration | null>(null);
    const [spinBusy, setSpinBusy] = useState<boolean>(false);
    const [currentTickets, setCurrentTicketsList] = useState<TicketData[]>([]);
    const [showTicketPanel, setShowTicketPanel] = useState<boolean>(false);

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
    const refPendingWinner = useRef<Celebration | null>(null);
    const refUserId = useRef<number | undefined>(undefined);
    const refCelebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const router = useRouter();

    // El juego termina cuando la ronda 5 completa todos sus giros.
    const finished = currentRoundData.number === 5 && currentRoundData.spins > 0 && currentRoundData.total_current_spins >= currentRoundData.spins;
    const eliminatedTickets = currentTickets.filter((ticket) => ticket.status === 'eliminated').length;

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
                    // Las eliminaciones de fin de ronda se muestran hasta que la ruleta se detiene.
                    if (refCurrentGameId.current) {
                        getTickets(refCurrentGameId.current);
                    }
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
        refRoulette.current = new Wheel(refDivRoulette.current, { ...casinoWheelStyle, ...dataRouletteWithRestHook });
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

        socket.on("spin", (winning_number, dataRoulette, winners) => {
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
                winners: Array.isArray(winners) ? winners : [],
                iAmWinner: Array.isArray(winners) && winners.some((winner: WinnerInfo) => winner.user_id === refUserId.current),
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
                refUserId.current = data.id;

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

            const activeTickets = dataTickets.filter((ticket: TicketData) => ticket.status !== 'eliminated');
            setCurrentTicketsList(dataTickets);
            setCurrentTotalTickets(activeTickets.length);

        } catch (error) {
            console.log("Error in getTickets: ", error)
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
                setMessageFloating({show: true, messages: Array.isArray(dataSpin.error) ? dataSpin.error : [dataSpin.error ?? "Error al realizar el giro, intentalo de nuevo."], type: 'bad'});
                return;
            }

            console.log("DATOS DE GIRO: ", dataSpin)

            // El servidor ya registro el giro, elimino a quienes no avanzan y guardo el resultado.
            const result = await getPrizes(currentGameData!.id, dataRound.number);

            if (!result) {
                console.log("Error al generar ultimo resultado en tiempo real.")
                return
            }

            const { dataRoulette } = result;

            socket.emit("spin", dataSpin.winning_number, dataRoulette, dataSpin.winners);

            // El resultado se publica cuando termina la animacion para no adelantar el numero ganador.
            setTimeout(() => {
                socket.emit("latestResults", dataSpin.winning_number, dataSpin.game_id, dataSpin.round_number, dataSpin.spin_number, dataSpin.prize_name)

                // Ronda 5: si solo quedaba un numero, el servidor ya le asigno el premio automaticamente.
                // Se encadena su animacion sin requerir otro clic del admin.
                const autoAssigned = dataSpin.auto_assigned;

                if (autoAssigned) {
                    socket.emit("spin", autoAssigned.winning_number, dataRoulette, autoAssigned.winners);

                    setTimeout(() => {
                        socket.emit("latestResults", autoAssigned.winning_number, dataSpin.game_id, autoAssigned.round_number, autoAssigned.spin_number, autoAssigned.prize_name)
                    }, 10500)
                }
            }, 10500)

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
                itemLabelFontSizeMax: 32,
            }

            return { dataRoulette, dataPrizes }

        } catch (error) {
            console.log("Error in ruleta/getPrizes: ", error);
        }
    }

    return (
        <>
            <NavBar />
            <dialog ref={refModal} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
                <div className='flex flex-col p-5 gap-5'>
                    <div className='flex justify-start items-center w-full'>
                        <p onClick={() => router.back()} className='casino_link cursor-pointer active:scale-90'>{'< '}regresar</p>
                    </div>
                    <div className='flex justify-center w-full'>
                        <MiniRoulette size={100} className='animation_mini_ruleta' />
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
                        <p className='casino_title casino_marquee text-2xl sm:text-4xl tracking-widest text-yellow-300'>¡NÚMERO GANADOR!</p>
                        <div className='casino_number flex justify-center items-center w-40 h-40 sm:w-56 sm:h-56 rounded-full border-8 border-yellow-300 bg-linear-to-b from-red-600 to-red-900 casino_marquee text-7xl sm:text-9xl text-white'>
                            {winnerCelebration.number}
                        </div>
                        {winnerCelebration.winners.length > 0 ? (
                            <div className='flex flex-col items-center gap-1 max-h-40 overflow-y-auto'>
                                {winnerCelebration.iAmWinner ? (
                                    <p className='casino_title text-2xl sm:text-3xl font-extrabold text-green-300'>¡ERES GANADOR!</p>
                                ) : null}
                                <p className='text-lg sm:text-xl text-white'>Ganador{winnerCelebration.winners.length > 1 ? 'es' : ''}: {winnerCelebration.winners.map((winner) => winner.display_name).join(', ')}</p>
                            </div>
                        ) : null}
                        {winnerCelebration.prize ? (
                            <p className='text-xl sm:text-3xl font-bold text-yellow-200'>Premio: {winnerCelebration.prize}</p>
                        ) : null}
                        <p className='text-sm text-white/60'>Toca para cerrar</p>
                    </div>
                </div>
            ) : null}
            <div className="flex flex-col h-auto min-h-dvh py-5 px-4 sm:px-10 gap-16">
                {showMessageFloating ? <MessageFloating show={messageFloating?.show} messages={messageFloating?.messages} type={messageFloating?.type} /> : null}
                <div className="flex flex-col md:flex-col justify-between items-center text-white gap-10">
                    <div className='flex flex-col sm:flex-row justify-between w-full gap-4'>
                        <h1 data-aos='zoom-in' className="casino_heading text-3xl sm:text-5xl w-full md:w-[70%] lg:w-[50%]">{currentGameData?.title}</h1>
                        <div className='flex flex-col text-start sm:text-end gap-1'>
                            <p className='text-[0.9rem]'>Fecha de finalizacion del juego: <span className='font-semibold'>{`${currentGameData?.end_datetime.split("T")[0]} - ${currentGameData?.end_datetime.split("T")[1].slice(0, 5)}hrs`}</span></p>
                            <p className="flex justify-end items-center font-bold text-2xl gap-1">Tus tickets: {currentTotalTickets}<FaTicketAlt className="inline rotate-125"/></p>
                            {eliminatedTickets > 0 ? <p className='text-sm text-red-400'>{`Eliminados: ${eliminatedTickets}`}</p> : null}
                            {currentTickets.length > 0 && currentTotalTickets === 0 ? <p className='text-sm text-red-400'>Ya no tienes tickets en juego.</p> : null}
                        </div>                        
                    </div>
                    <div className="flex flex-row flex-wrap justify-center sm:justify-around items-center w-full gap-3 sm:gap-5">
                        <p className='casino_chip text-sm sm:text-lg'>{`Ronda: ${currentRoundData?.number}/5`}</p>
                        <p className='casino_chip text-sm sm:text-lg'>{`Giro ${currentRoundData?.total_current_spins}/${currentRoundData?.number === 5 ? 10 : currentRoundData?.spins}`}</p>
                        <p className='casino_chip text-sm sm:text-lg'>{`Donadores: ${currentUsersWithDonation ?? 0} / ${currentGameData?.max_capacity ?? 0}`}</p>
                    </div>
                </div>
                <div className='absolute top-[400px] sm:top-[300px] lg:top-[260px] z-10'>
                    <button
                        onClick={() => setShowTicketPanel(prev => !prev)}
                        className='casino_btn p-2 sm:p-3 rounded-full'
                        title='Mis tickets'
                    >
                        <FaTicketAlt size={28} className='rotate-45 sm:hidden'/>
                        <FaTicketAlt size={40} className='rotate-45 hidden sm:block'/>
                    </button>
                    {showTicketPanel && (
                        <div className='absolute top-full left-0 mt-2 casino_card p-3 sm:p-4 w-60 flex flex-col gap-2' style={{maxHeight: '16rem', overflowY: 'auto'}}>
                            <h3 className='casino_heading text-sm sm:text-base'>Mis tickets activos</h3>
                            {(() => {
                                const grouped = currentTickets
                                    .filter(t => t.status !== 'eliminated' && t.ticket_number != null)
                                    .reduce((acc, t) => {
                                        const n = t.ticket_number!;
                                        acc[n] = (acc[n] ?? 0) + 1;
                                        return acc;
                                    }, {} as Record<number, number>);
                                const entries = Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
                                if (entries.length === 0) {
                                    return <p className='text-white/60 text-xs sm:text-sm'>Sin tickets activos.</p>;
                                }
                                return (
                                    <table className='casino_table w-full text-xs sm:text-sm'>
                                        <thead><tr><th>Número</th><th>Cantidad</th></tr></thead>
                                        <tbody>
                                            {entries.map(([num, count]) => (
                                                <tr key={num}><td>{num}</td><td>{count}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            })()}
                        </div>
                    )}
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-10">
                    <div className='flex flex-col justify-center items-center gap-5'>
                        <div data-aos='zoom-in' className='casino_wheel_wrap'>
                            <div className='casino_wheel_pointer' />
                            <div className='casino_wheel_frame'>
                                <div className='w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] md:w-[520px] md:h-[520px] pointer-events-none' ref={refDivRoulette} />
                            </div>
                        </div>
                        {role === 'admin' ? (
                            <button disabled={spinBusy || finished} onClick={ async () => {
                                if (spinBusy || refIsSpinning.current) {
                                    return;
                                }
                                setSpinBusy(true);
                                try {
                                    await getCurrentRoundGame(currentGameData!.id, true, false);
                                } finally {
                                    setSpinBusy(false);
                                }
                            }} 
                                className={'casino_btn casino_btn_pulse w-[70%] sm:w-[50%] text-xl' + (finished ? ' casino_hidden ' : '') + (spinBusy ? ' opacity-60 cursor-not-allowed ' : '')}>
                                    Girar
                            </button>  
                        ) : null}    
                        {finished ? (
                            <p className='casino_marquee casino_neon_text text-2xl'>Juego finalizado.</p>
                        ) : null}                                            
                    </div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <div data-aos='flip-right' className="flex flex-col casino_card w-full sm:w-[80%] lg:w-[100%] max-h-[300px] min-h-[300px] h-auto px-5 py-5 text-white gap-3">
                            <h1 className="casino_heading text-2xl">Progreso del sorteo</h1>
                            <div className="flex flex-col gap-5 overflow-y-scroll casino_scroll px-3">
                                {rounds?.map((round: RoundsData) => (
                                    <div key={round.id} className={"flex justify-between pb-1 text-lg border-b-2 border-casino-gold/40 font-semibold gap-2" + (currentRoundData.number === round.number ? '  ' : ' opacity-50 ')}>
                                        <div className='flex items-center gap-1'>
                                            <p className={'casino_round_dot' + (currentRoundData.number === round.number ? ' casino_round_active' : '')}>{round.number}</p>
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
                        <div data-aos='flip-left' className="flex flex-col casino_card w-full sm:w-[80%] lg:w-[100%] max-h-[300px] min-h-[300px] h-auto px-5 py-5 text-white gap-3">
                            <h1 className="casino_heading text-2xl">Ultimos resultados</h1>
                            <div className="flex flex-col gap-5 overflow-y-auto casino_scroll px-3">
                                {stateWinningTickets?.sort((a, b) => b.spin_number - a.spin_number).sort((a, b) => b.round_number - a.round_number).map((obj: WinningTickets, index: number) => (
                                   <div key={IndexWinningTicket++} className="flex flex-wrap justify-between text-lg text-center border-b border-casino-gold/30 gap-2">
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
                    <h2 className='casino_heading text-3xl sm:text-5xl'>¿Como funciona?</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center'>
                        <div data-aos='fade-right' className='casino_card flex flex-col px-5 py-4 gap-2'>
                            <h3 className='casino_heading text-2xl'>Ronda 1</h3> 
                            <p>La ruleta gira 5 veces y los numeros seleccionados pasan a la ronda 2.</p>
                            <p>(5,000 donadores para 2,500 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='casino_card flex flex-col px-5 py-4 gap-2'>
                            <h3 className='casino_heading text-2xl'>Ronda 2</h3> 
                            <p>La ruleta gira 4 veces, los números seleccionados pasan a la Ronda 3.</p>
                            <p>(2,500 donadores para 1,000 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='casino_card flex flex-col px-5 py-4 gap-2'>
                            <h3 className='casino_heading text-2xl'>Ronda 3</h3> 
                            <p>La ruleta gira 1 sola vez, el número ganador pasa a la ronda 4</p>
                            <p>(1,000 donadores para 100 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='casino_card flex flex-col px-5 py-4 gap-2'>
                            <h3 className='casino_heading text-2xl'>Ronda 4</h3> 
                            <p>La ruleta gira 1 solamente una vez, el número ganador pasa a la Ronda 5 y gana premio.</p>
                            <p>(100 donadores para 10 donadores)</p>
                        </div> 
                        <div data-aos='fade-right' className='casino_card flex flex-col px-5 py-4 gap-2'>
                            <h3 className='casino_heading text-2xl'>Ronda 5</h3> 
                            <p>La ruleta gira 10 veces, otorgando premio en las 10 ocasiones.</p>
                            <p>(10 donadores para 10 donadores)</p>
                        </div> 
                    </div>                    
                </div>
            </div>
        </>
    )
}

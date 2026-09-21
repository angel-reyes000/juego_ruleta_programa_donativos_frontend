"use client"

import MiniRoulette from '@/components/miniRoulette';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaSearch, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import '@/app/styles.css';

interface Prize {
    id?: number
    name: string
    type: string
    value: number
    round: number
    roulette_number: number
}

interface Winner {
    round_number: number
    spin_number: number
    winning_number: number
    prize_name: string | null
    user_id: number
    name: string
    last_name: string
    email: string
    phone_number: string
    tickets: number
}

interface Game {
    id?: number
    title: string
    start_datetime: string
    end_datetime: string
    max_capacity: number
    description: string
    prize_list: Prize[]
}

let temporalPrizeId = 1;

function formatDateTimeLocal (value: string) {
    const date = new Date(value);

    const pad = (number: number) => String(number).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Configuracion () {
    const [gameList, setGameList] = useState<Game[]>();
    const [prizeList, setPrizeList] = useState<Prize[]>();
    const [game, setGame] = useState<Game>({
        title: "",
        start_datetime: "",
        end_datetime: "",
        max_capacity: 5000,
        description: "",
        prize_list: prizeList!,
    });
    const [prize, setPrize] = useState<Prize>({
        name: "",
        type: "Dinero en efectivo",
        value: 0,
        round: 1,
        roulette_number: 0
    })
    const [winnerList, setWinnerList] = useState<Winner[]>([]);
    const [gameId, setGameId] = useState(0);
    const [inputSearch, setInputSearch] = useState<string>("");
    const [errorGame, setErrorGame] = useState<string>("");
    const [errorPrize, setErrorPrize] = useState<string>("");

    const router = useRouter();
    const refModalWarning = useRef<any>(null);
    const refModalAdd = useRef<any>(null);
    const refModalEdit = useRef<any>(null);

    useEffect(() => {
        refModalAdd.current.close()
        refModalAdd.current.style.display = 'none';

        refModalEdit.current.close()
        refModalEdit.current.style.display = 'none';

        const token = localStorage?.getItem('token');

        async function getGames () {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getGames`, {
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                })

                if (response.status != 200) {
                    refModalWarning.current?.showModal();
                }

                const data = await response.json();
                console.log(data)

                setGameList(data)

            } catch (error) {
                console.log("Error in getGames frontend.");
            }
        }

        getGames()

    }, [])

    async function postGame () {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/postGames`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: game.title,
                    start_datetime: game.start_datetime,
                    end_datetime: game.end_datetime,
                    max_capacity: game.max_capacity,
                    description: game.description,
                    prize_list: game.prize_list,
                })
            })

            const data = await response.json();

            if (response.status !== 200) {
                setErrorGame(data.error)
                return 
            }

            setGameList((prev: any) => [...prev, data])

            refModalAdd.current.style.display = 'none';
            refModalAdd.current.close()

        } catch (error) {
            console.log("Error in postGame frontend.")
        } finally {
            setTimeout(() => {
                setErrorGame("")
                setErrorPrize("");
            }, 5000);
        }
    }

    async function updateGame () {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/updateGame`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: game.title,
                    start_datetime: game.start_datetime,
                    end_datetime: game.end_datetime,
                    max_capacity: game.max_capacity,
                    description: game.description,
                    prize_list: game.prize_list,
                    gameId: gameId,
                })
            })

            const data = await response.json();

            if (response.status !== 200) {
                setErrorGame(data.error)
                return 
            }

            setGameList(prev => prev?.map(obj => obj.id === data.id ? {
                    id: data.id,
                    title: data.title,
                    start_datetime: data.start_datetime,
                    end_datetime: data.end_datetime,
                    max_capacity: data.max_capacity,
                    description: data.description,
                    prize_list: data.prize_list
                } : obj))

            refModalEdit.current.style.display = 'none';
            refModalEdit.current.close();

        } catch (error) {
            console.log("Error in updateGame frontend.")
        } finally {
            setTimeout(() => setErrorGame(""), 5000);
        }
    }

    async function getPrizes (gameId: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getPrizes?gameId=${gameId}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            const data = await response.json();

            if (response.status !== 200) {
                setErrorPrize(data.error)
                return 
            }

            setPrizeList(data)

        } catch (error) {
            console.log("Error in getPrizes frontend.")
        } finally {
            setTimeout(() => setErrorPrize(""), 5000);
        }
    }

    async function getGameWinners (gameId: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/getGameWinners?game_id=${gameId}`, {
                method: 'GET',
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            const data = await response.json();

            if (response.status !== 200) {
                setWinnerList([]);
                return
            }

            setWinnerList(data)

        } catch (error) {
            console.log("Error in getGameWinners frontend.")
        }
    }

    async function postPrize () {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/postPrize`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: prize.name,
                    type: prize.type,
                    value: prize.value,
                    round: prize.round,
                    roulette_number: prize.roulette_number,
                    game_id: gameId, 
                })
            })

            const data = await response.json();

            console.log(data)
            console.log(prize)
            console.log(gameId)

            if (response.status !== 200) {
                setErrorPrize(data.error)
                return 
            }
            console.log(prizeList)
            setPrizeList((prev: any) => [...prev, {
                    id: data.id, 
                    name: data.name, 
                    type: data.type, 
                    value: data.value, 
                    round: data.round, 
                    roulette_number: data.roulette_number, 
                    game_id: gameId,
                }
            ]);

        } catch (error) {
            console.log("Error in postPrizes frontend.")
        } finally {
            setTimeout(() => setErrorPrize(""), 5000);
        }
    }

    function postPrizes () {
        try {

            if (prize.name.length > 100 || prize.round > 5 || prize.round < 1 || prize.roulette_number > 10 || prize.roulette_number < 1) {
                setErrorPrize("Campos invalido")
                return
            }

            if (!prize.name || !prize.type || !prize.value || !prize.round || !prize.roulette_number) {
                setErrorPrize("Campos faltantes")
                return
            }

            setGame(prev => ({...prev, prize_list: [...prev.prize_list, {id: temporalPrizeId++, name: prize.name, type: prize.type, value: prize.value, round: prize.round, roulette_number: prize.roulette_number}]}))

        } catch (error) {
            console.log("Error in postPrizes: ", error)
        } finally {
            setTimeout(() => setErrorPrize(""), 5000);
        }
    }

    async function deletePrize (prizeId: number | undefined, gameId: number) {

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/deletePrize`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    prize_id: prizeId,
                    game_id: gameId,
                })
            })

            const data = await response.json();

            if (response.status !== 200) {
                setErrorPrize(data.error)
                return 
            }

            setPrizeList((prev: any) => prev?.filter((obj: Prize) => obj.id !== prizeId))

        } catch (error) {
            console.log("Error in deletePrizes frontend.")
        } finally {
            setTimeout(() => setErrorPrize(""), 5000);
        }
    }

    return (
        <>
            {/*-----------------------------------------MODAL WARNING---------------------------------------------------*/}
            <dialog ref={refModalWarning} className='casino_modal m-auto text-center w-[90%] sm:w-[60%] md:w-[45%] lg:w-[30%]'>
                <div className='flex flex-col p-5 gap-5'>
                    <div className='flex justify-start items-center w-full'>
                        <p onClick={() => router.push('/')} className='casino_link cursor-pointer active:scale-90'>{'< '}regresar</p>
                    </div>
                    <div className='flex justify-center w-full'>
                        <MiniRoulette size={100} className='animation_mini_ruleta' />
                    </div>
                    <p className='font-semibold text-white text-[1.1rem] m-0 p-0'>
                        Tu sesion a expirado, inicia sesion para poder continuar!.
                    </p>
                    <div className='flex justify-center items-center w-full'>
                        <button onClick={() => router.push('/login')} className='casino_btn casino_btn_red w-[80%]'>
                            Iniciar sesion
                        </button>
                    </div>
                </div>
            </dialog>
            {/*-----------------------------------------MODAL TO ADD GAMES---------------------------------------------------*/}
            <dialog ref={refModalAdd} className='casino_modal casino_scroll flex flex-col m-auto w-[95%] md:w-[70%] lg:w-[60%] h-[90%] max-h-[90%] p-5 gap-3'>
                <div className='flex justify-between items-center font-bold text-2xl'>
                    <h1 className='casino_heading'>Crear nuevo juego</h1>
                    <button onClick={() => {
                                refModalAdd.current.style.display = 'none';
                                refModalAdd.current.close()
                            }} className='casino_icon_btn'>
                            <FaPlus className='rotate-45' />
                    </button>
                </div>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Titulo:
                        <input value={game.title ?? ""} onChange={(e) => setGame(prev => ({...prev, title: e.target.value}))} maxLength={100} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Fecha y hora de inicio:
                        <input value={game.start_datetime ?? ""} onChange={(e) => setGame(prev => ({...prev, start_datetime: e.target.value}))} type='datetime-local' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Fecha y hora de finalizaicion:
                        <input value={game.end_datetime ?? ""} onChange={(e) => setGame(prev => ({...prev, end_datetime: e.target.value}))} type='datetime-local' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Capacidad:
                        <input value={game.max_capacity ?? ""} onChange={(e) => setGame(prev => ({...prev, max_capacity: Number(e.target.value)}))} type='number' min={1} max={5000} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        descripcion:
                        <input value={game.description ?? ""} onChange={(e) => setGame(prev => ({...prev, description: e.target.value}))} className='casino_input font-medium'></input>
                    </label>
                </div>
                <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                <h1 className='casino_heading text-2xl'>Premios</h1>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Nombre:
                        <input value={prize.name} onChange={(e) => setPrize(prev => ({...prev, name: e.target.value}))} maxLength={100} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Tipo:
                        <select value={prize.type} onChange={(e) => setPrize(prev => ({...prev, type: e.target.value}))} className='casino_input font-medium'>
                            <option>Dinero en efectivo</option>
                            <option>Producto</option>
                            <option>Experiencia (viaje, cena, concierto, etc.)</option>
                            <option>Vale / Tarjeta de regalo</option>
                        </select>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Valor$:
                        <input value={prize.value} onChange={(e) => setPrize(prev => ({...prev, value: Number(e.target.value)}))} type='number' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Ronda:
                        <input value={prize.round} onChange={(e) => setPrize(prev => ({...prev, round: Number(e.target.value)}))} type='number' min={1} max={5} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Numero en ruleta:
                        <input value={prize.roulette_number ?? ''} onChange={(e) => setPrize(prev => ({...prev, roulette_number: Number(e.target.value)}))} type='number' min={1} max={10} className='casino_input font-medium'></input>
                    </label>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorPrize}</p>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                    <div className='flex items-end font-semibold'>
                        <button onClick={() => postPrizes()}
                            className='casino_btn'>
                            <FaPlus />Agregar premio
                        </button>
                    </div>
                    <table className='casino_table text-center'>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Valor$</th>
                                <th>Ronda</th>
                                <th>Numero en ruleta</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.prize_list?.map((obj) => (
                                <tr key={obj.id}>
                                    <td>{obj.name}</td>
                                    <td>{obj.type}</td>
                                    <td>{obj.value}</td>
                                    <td>{obj.round}</td>
                                    <td>{obj.roulette_number}</td>
                                    <td className='flex justify-center py-2'>
                                        <button onClick={() => setGame(prev => ({...prev, prize_list: prev.prize_list.filter(prize => prize.id !== obj.id)}))}
                                            className='casino_icon_btn casino_icon_btn_danger'>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorPrize}</p>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                    <div className='flex justify-between w-full gap-2'>
                        <button onClick={() => postGame()}
                            className='casino_btn sm:w-[30%]'>
                            <FaSave />Crear juego
                        </button>
                        <button onClick={() => {
                            refModalAdd.current.style.display = 'none';
                            refModalAdd.current.close()
                        }}
                            className='casino_btn casino_btn_ghost sm:w-[30%]'>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
            {/*-----------------------------------------MODAL TO EDIT GAMES---------------------------------------------------*/}
            <dialog ref={refModalEdit} className='casino_modal casino_scroll flex flex-col m-auto w-[95%] md:w-[70%] lg:w-[60%] h-[90%] max-h-[90%] p-5 gap-3'>
                <div className='flex justify-between items-center font-bold text-2xl'>
                    <h1 className='casino_heading'>Editar juego</h1>
                    <button onClick={() => {
                                refModalEdit.current.style.display = 'none';
                                refModalEdit.current.close()
                            }} className='casino_icon_btn'>
                            <FaPlus className='rotate-45' />
                    </button>
                </div>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Titulo:
                        <input value={game.title} onChange={(e) => setGame(prev => ({...prev, title: e.target.value}))} maxLength={100} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Fecha y hora de inicio:
                        <input value={game.start_datetime ?? ""} onChange={(e) => setGame(prev => ({...prev, start_datetime: e.target.value}))} type='datetime-local' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Fecha y hora de finalizaicion:
                        <input value={game.end_datetime ?? ""} onChange={(e) => setGame(prev => ({...prev, end_datetime: e.target.value}))} type='datetime-local' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Capacidad:
                        <input value={game.max_capacity} onChange={(e) => setGame(prev => ({...prev, max_capacity: Number(e.target.value)}))} type='number' min={1} max={5000} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        descripcion:
                        <input value={game.description} onChange={(e) => setGame(prev => ({...prev, description: e.target.value}))} className='casino_input font-medium'></input>
                    </label>
                </div>
                <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                <h1 className='casino_heading text-2xl'>Premios</h1>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Nombre:
                        <input value={prize.name} onChange={(e) => setPrize(prev => ({...prev, name: e.target.value}))} maxLength={100} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Tipo:
                        <select value={prize.type} onChange={(e) => setPrize(prev => ({...prev, type: e.target.value}))} className='casino_input font-medium'>
                            <option>Dinero en efectivo</option>
                            <option>Producto</option>
                            <option>Experiencia (viaje, cena, concierto, etc.)</option>
                            <option>Vale / Tarjeta de regalo</option>
                        </select>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Valor$:
                        <input value={prize.value} onChange={(e) => setPrize(prev => ({...prev, value: Number(e.target.value)}))} type='number' className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Ronda:
                        <input value={prize.round} onChange={(e) => setPrize(prev => ({...prev, round: Number(e.target.value)}))} type='number' min={1} max={5} className='casino_input font-medium'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-full md:w-[49%]'>
                        Numero en ruleta:
                        <input value={prize.roulette_number} onChange={(e) => setPrize(prev => ({...prev, roulette_number: Number(e.target.value)}))} type='number' min={1} max={10} className='casino_input font-medium'></input>
                    </label>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorPrize}</p>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                    <div className='flex items-end font-semibold'>
                        <button onClick={() => postPrize()}
                            className='casino_btn'>
                            <FaPlus />Agregar premio
                        </button>
                    </div>
                    <table className='casino_table text-center'>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Valor$</th>
                                <th>Ronda</th>
                                <th>Numero en ruleta</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prizeList?.map(obj => (
                                <tr key={obj.id}>
                                    <td>{obj.name}</td>
                                    <td>{obj.type}</td>
                                    <td>{obj.value}</td>
                                    <td>{obj.round}</td>
                                    <td>{obj.roulette_number}</td>
                                    <td className='flex justify-center py-2'>
                                        <button onClick={() => deletePrize(obj?.id, gameId)}
                                            className='casino_icon_btn casino_icon_btn_danger'>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorPrize}</p>
                    <p className='w-full text-right casino_error text-[0.9rem]'>{errorGame}</p>
                    <h1 className='casino_heading w-full text-2xl'>Ganadores</h1>
                    <div className='w-full max-h-72 overflow-auto casino_scroll rounded-2xl'>
                        <table className='casino_table text-center'>
                            <thead className='sticky top-0'>
                                <tr>
                                    <th>Ronda</th>
                                    <th>Giro</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Numero</th>
                                    <th>Correo</th>
                                    <th>Premio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {winnerList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className='py-3 text-white/60'>Aun no hay ganadores.</td>
                                    </tr>
                                ) : winnerList.map((obj, index) => (
                                    <tr key={`${obj.round_number}-${obj.spin_number}-${obj.user_id}-${index}`}>
                                        <td>{obj.round_number}</td>
                                        <td>{obj.spin_number}</td>
                                        <td>{obj.name}</td>
                                        <td>{obj.last_name}</td>
                                        <td>{obj.phone_number}</td>
                                        <td>{obj.email}</td>
                                        <td>{obj.prize_name ?? 'Sin premio'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='flex justify-between w-full gap-2'>
                        <button onClick={() => updateGame()}
                            className='casino_btn sm:w-[30%]'>
                            <FaSave />Guardar
                        </button>
                        <button onClick={() => {
                                refModalEdit.current.style.display = 'none';
                                refModalEdit.current.close()
                            }}
                            className='casino_btn casino_btn_ghost sm:w-[30%]'>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
            {/*-----------------------------------------TABLE OF GAMES---------------------------------------------------*/}
            <div className="flex flex-col h-auto min-h-dvh p-5 sm:p-10 gap-10">
                <div className='flex flex-col text-white gap-2'>
                    <p onClick={() => router.back()} className='casino_link w-fit cursor-pointer'>{'< Regresar'}</p>
                    <h1 className='casino_heading text-3xl sm:text-5xl'>Menu de configuracion</h1>
                </div>
                <div className='flex flex-col gap-3 overflow-auto casino_scroll'>
                    <div className='flex flex-col sm:flex-row justify-between text-white w-full gap-2'>
                        <div className='flex items-center px-3 py-2 border-2 border-casino-gold/60 bg-black/40 rounded-lg gap-2 focus-within:shadow-[0_0_18px_rgba(255,210,63,0.6)]'>
                            <FaSearch />
                            <input value={inputSearch} onChange={((e) => setInputSearch(e.target.value))} className='focus:outline-none'></input>
                        </div>
                        <button onClick={() => {
                                refModalAdd.current?.showModal()
                                refModalAdd.current.style.display = 'flex';
                                setGame({
                                        id: 0,    
                                        title: "", 
                                        start_datetime: "",
                                        end_datetime: "",
                                        max_capacity: 5000,
                                        description: "",
                                        prize_list: [],
                                })
                                setPrize({
                                    name: "",
                                    type: "Dinero en efectivo",
                                    value: 0,
                                    round: 1,
                                    roulette_number: 0,
                                })
                            }}
                            className='casino_btn casino_btn_red'>
                            <FaPlus />Crear nuevo juego
                        </button>
                    </div>
                    <table className='casino_table text-white'>
                        <thead>
                            <tr className='text-center'>
                                <th>Nombre</th>
                                <th>Fecha inicio</th>
                                <th>Fecha finalizacion</th>
                                <th>Descripcion</th>
                            </tr>
                        </thead>
                        {Array.isArray(gameList) ? (
                        <tbody>
                            {gameList?.filter(obj => (
                                obj.title.toLowerCase().includes(inputSearch.toLowerCase()) ||
                                obj.start_datetime.includes(inputSearch) ||
                                obj.end_datetime.includes(inputSearch) ||
                                obj.description.toLowerCase().includes(inputSearch.toLowerCase())
                            )).map((obj: Game) => (
                                <tr key={obj.id} onClick={() => {
                                        setGameId(obj.id!);
                                        setGame({
                                            ...obj,
                                            start_datetime: formatDateTimeLocal(obj.start_datetime),
                                            end_datetime: formatDateTimeLocal(obj.end_datetime),
                                        })
                                        getPrizes(obj.id!);
                                        setWinnerList([]);
                                        getGameWinners(obj.id!);
                                        setPrize({
                                            name: "",
                                            type: "Dinero en efectivo",
                                            value: 0,
                                            round: 1,
                                            roulette_number: 0,
                                        })
                                        refModalEdit.current.showModal()
                                        refModalEdit.current.style.display = 'flex'
                                    }} 
                                    className='text-center cursor-pointer'>
                                    <td className='p-2 max-w-[100px] truncate'>{obj.title}</td>
                                    <td className='p-2'>{`${obj.start_datetime?.split("T")[0]} - ${obj.start_datetime?.split("T")[1].slice(0, 5)}`}</td>
                                    <td className='p-2'>{`${obj.end_datetime?.split("T")[0]} - ${obj.end_datetime?.split("T")[1].slice(0, 5)}`}</td>
                                    <td className='p-2 max-w-[100px] truncate'>{obj.description}</td>
                                </tr>
                            ))}
                        </tbody>
                        ) : null}
                    </table>                    
                </div>
            </div>
        </>
    )
}
"use client"

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaSearch, FaPlus, FaTrash, FaSave } from 'react-icons/fa';

interface Prize {
    id: number
    name: string
    type: string
    value: number
}

interface Game {
    title: string
    start_date: string
    end_date: string
    max_capacity: number
    description: string
    prize_list: Prize[]
}

const game_list_fake: any = [];

export default function Configuracion () {
    const [gameList, setGameList] = useState(game_list_fake);
    const [game, setGame] = useState<Game>({
        title: "",
        start_date: "",
        end_date: "",
        max_capacity: 5000,
        description: "",
        prize_list: [],
    });
    const [prize, setPrize] = useState<Prize>({
        id: 0,
        name: "",
        type: "Dinero en efectivo",
        value: 0,
    })
    const [error, setError] = useState<string>("");

    const router = useRouter();
    const refModalAdd = useRef<any>(null);
    const refModalEdit = useRef<any>(null);

    useEffect(() => {
        refModalAdd.current.close()
        refModalAdd.current.style.display = 'none';

        refModalEdit.current.close()
        refModalEdit.current.style.display = 'none';
    }, [])

    return (
        <>
            {/*-----------------------------------------MODAL TO ADD GAMES---------------------------------------------------*/}
            <dialog ref={refModalAdd} className='flex flex-col m-auto w-[60%] h-[90%] max-h-[90%] p-5 rounded-md gap-3'>
                <div className='flex justify-between items-center font-bold text-2xl'>
                    <h1>Crear nuevo juego</h1>
                    <button onClick={() => {
                                refModalAdd.current.style.display = 'none';
                                refModalAdd.current.close()
                            }} className='cursor-pointer active:scale-90'>
                            <FaPlus className='rotate-45' />
                    </button>
                </div>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Titulo:
                        <input value={game.title ?? ""} onChange={(e) => setGame(prev => ({...prev, title: e.target.value}))} maxLength={100} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Fecha de inicio:
                        <input value={game.start_date ?? ""} onChange={(e) => setGame(prev => ({...prev, start_date: e.target.value}))} type='date' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Fecha de finalizaicion:
                        <input value={game.end_date ?? ""} onChange={(e) => setGame(prev => ({...prev, end_date: e.target.value}))} type='date' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Capacidad:
                        <input value={game.max_capacity ?? ""} onChange={(e) => setGame(prev => ({...prev, max_capacity: Number(e.target.value)}))} type='number' min={1} max={5000} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        descripcion:
                        <input value={game.description ?? ""} onChange={(e) => setGame(prev => ({...prev, description: e.target.value}))} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                </div>
                <h1 className='font-bold text-2xl'>Premios</h1>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Nombre:
                        <input value={prize.name} onChange={(e) => setPrize(prev => ({...prev, name: e.target.value}))} maxLength={100} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Tipo:
                        <select value={prize.type} onChange={(e) => setPrize(prev => ({...prev, type: e.target.value}))} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'>
                            <option>Dinero en efectivo</option>
                            <option>Producto</option>
                            <option>Experiencia (viaje, cena, concierto, etc.)</option>
                            <option>Vale / Tarjeta de regalo</option>
                        </select>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Valor$:
                        <input value={prize.value} onChange={(e) => setPrize(prev => ({...prize, value: Number(e.target.value)}))} type='number' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <div className='flex items-end text-white font-semibold'>
                        <button onClick={() => game.prize_list.length >= 10 ? setError("Maximo 10 premios.") : setGame(prev => ({...prev, prize_list: [...prev.prize_list, {id: prize.id++, name: prize.name, type: prize.type, value: prize.value}]}))}
                            className='flex items-center bg-blue-500 px-4 py-2 rounded-lg cursor-pointer active:scale-95 gap-1 hover:bg-blue-800'>
                            <FaPlus />Agregar premio
                        </button>
                    </div>
                    <table className='w-full text-center border-1 rounded-2xl'>
                        <thead>
                            <tr className='border-b-1 bg-blue-500 text-white'>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Valor$</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.prize_list?.map(obj => (
                                <tr key={obj.id} className='border-b-1 hover:bg-blue-200'>
                                    <td>{obj.name}</td>
                                    <td>{obj.type}</td>
                                    <td>{obj.value}</td>
                                    <td className='flex justify-center py-2'>
                                        <button onClick={() => setGame(prev => ({...prev, prize_list: prev.prize_list.filter(prize => prize.id !== obj.id)}))}
                                            className='cursor-pointer bg-red-500 p-2 rounded-sm active:scale-90'>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex justify-between w-full'>
                        <button onClick={() => {
                                setGameList((prev: any) => [...prev, game])
                                refModalAdd.current.style.display = 'none';
                                refModalAdd.current.close()
                            }}
                            className='flex justify-center items-center cursor-pointer bg-blue-500 text-white p-2 rounded-md active:scale-95 w-[20%] font-semibold gap-1 hover:bg-blue-800'>
                            <FaSave />Crear juego
                        </button>
                        <button onClick={() => {
                                refModalAdd.current.style.display = 'none';
                                refModalAdd.current.close()
                            }}
                            className='cursor-pointer border-2 border-gray-400 p-2 rounded-md active:scale-95 w-[20%] font-semibold hover:bg-gray-300'>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
            {/*-----------------------------------------MODAL TO EDIT GAMES---------------------------------------------------*/}
            <dialog ref={refModalEdit} className='flex flex-col m-auto w-[60%] h-[90%] max-h-[90%] p-5 rounded-md gap-3'>
                <div className='flex justify-between items-center font-bold text-2xl'>
                    <h1>Editar juego</h1>
                    <button onClick={() => {
                                refModalEdit.current.style.display = 'none';
                                refModalEdit.current.close()
                            }} className='cursor-pointer active:scale-90'>
                            <FaPlus className='rotate-45' />
                    </button>
                </div>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Titulo:
                        <input value={game.title} onChange={(e) => setGame(prev => ({...prev, title: e.target.value}))} maxLength={100} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Fecha de inicio:
                        <input value={game.start_date ?? ""} onChange={(e) => setGame(prev => ({...prev, start_date: e.target.value}))} type='date' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Fecha de finalizaicion:
                        <input value={game.end_date} onChange={(e) => setGame(prev => ({...prev, end_date: e.target.value}))} type='date' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Capacidad:
                        <input value={game.max_capacity} onChange={(e) => setGame(prev => ({...prev, max_capacity: Number(e.target.value)}))} type='number' min={1} max={5000} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        descripcion:
                        <input value={game.description} onChange={(e) => setGame(prev => ({...prev, description: e.target.value}))} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                </div>
                <h1 className='font-bold text-2xl'>Premios</h1>
                <div className='flex flex-wrap justify-between gap-2'>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Nombre:
                        <input value={prize.name} onChange={(e) => setPrize(prev => ({...prev, name: e.target.value}))} maxLength={100} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Tipo:
                        <select value={prize.type} onChange={(e) => setPrize(prev => ({...prev, type: e.target.value}))} className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'>
                            <option>Dinero en efectivo</option>
                            <option>Producto</option>
                            <option>Experiencia (viaje, cena, concierto, etc.)</option>
                            <option>Vale / Tarjeta de regalo</option>
                        </select>
                    </label>
                    <label className='flex flex-col font-semibold w-[49%]'>
                        Valor$:
                        <input value={prize.value} onChange={(e) => setPrize(prev => ({...prize, value: Number(e.target.value)}))} type='number' className='px-2 py-1 font-medium focus:outline-none rounded-md border-2 border-gray-400 focus:border-gray-800'></input>
                    </label>
                    <div className='flex items-end text-white font-semibold'>
                        <button onClick={() => game.prize_list.length >= 10 ? setError("Maximo 10 premios.") : setGame(prev => ({...prev, prize_list: [...prev.prize_list, {id: prize.id++, name: prize.name, type: prize.type, value: prize.value}]}))}
                            className='flex items-center bg-blue-500 px-4 py-2 rounded-lg cursor-pointer active:scale-95 gap-1 hover:bg-blue-800'>
                            <FaPlus />Agregar premio
                        </button>
                    </div>
                    <table className='w-full text-center border-1 rounded-2xl'>
                        <thead>
                            <tr className='border-b-1 bg-blue-500 text-white'>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Valor$</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {game.prize_list?.map(obj => (
                                <tr key={obj.id} className='border-b-1 hover:bg-blue-200'>
                                    <td>{obj.name}</td>
                                    <td>{obj.type}</td>
                                    <td>{obj.value}</td>
                                    <td className='flex justify-center py-2'>
                                        <button onClick={() => setGame(prev => ({...prev, prize_list: prev.prize_list.filter(prize => prize.id !== obj.id)}))}
                                            className='cursor-pointer bg-red-500 p-2 rounded-sm active:scale-90'>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex justify-between w-full'>
                        <button onClick={() => {
                            //seguir
                                refModalEdit.current.style.display = 'none';
                                refModalEdit.current.close()
                            }}
                            className='flex justify-center items-center cursor-pointer bg-blue-500 text-white p-2 rounded-md active:scale-95 w-[20%] font-semibold gap-1 hover:bg-blue-800'>
                            <FaSave />Guardar
                        </button>
                        <button onClick={() => {
                                refModalEdit.current.style.display = 'none';
                                refModalEdit.current.close()
                            }}
                            className='cursor-pointer border-2 border-gray-400 p-2 rounded-md active:scale-95 w-[20%] font-semibold hover:bg-gray-300'>
                            Cancelar
                        </button>
                    </div>
                </div>
            </dialog>
            {/*-----------------------------------------TABLE OF GAMES---------------------------------------------------*/}
            <div className="flex flex-col h-dvh p-10 bg-[rgb(30,0,0)]">
                <div className='flex flex-col text-white gap-2'>
                    <p onClick={() => router.back()} className='cursor-pointer hover:text-blue-400 hover:underline'>{'< Regresar'}</p>
                    <h1 className='text-4xl'>Menu de configuracion</h1>
                </div>
                <div className='flex justify-between text-white w-full'>
                    <div className='flex items-center px-2 border-3 border-gray-400 rounded-lg gap-2'>
                        <FaSearch />
                        <input className='focus:outline-none'></input>
                    </div>
                    <button onClick={() => {
                            refModalAdd.current?.showModal()
                            refModalAdd.current.style.display = 'flex';
                            setGame({title: "", start_date: "",
                                    end_date: "",
                                    max_capacity: 5000,
                                    description: "",
                                    prize_list: [],
                            })
                        }}
                        className='flex items-center px-3 py-2 text-md font-semibold rounded-lg cursor-pointer active:scale-95 bg-red-700 gap-1'>
                        <FaPlus />Crear nuevo juego
                    </button>
                </div>
                <div>
                    <table className='border-1 border-white text-white w-full'>
                        <thead className='bg-red-800'>
                            <tr className='border-1 text-center'>
                                <th className='border-1'>Nombre</th>
                                <th className='border-1'>Fecha inicio</th>
                                <th className='border-1'>Fecha finalizacion</th>
                                <th className='border-1'>Descripcion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gameList?.map((obj: any) => (
                                <tr onClick={() => {
                                        gameList.map((prev: Game) => prev.description == obj.description ? setGame(obj) : obj)
                                        console.log(game)
                                        refModalEdit.current.showModal()
                                        refModalEdit.current.style.display = 'flex'
                                    }} 
                                    className='border-1 text-center hover:bg-gray-800 cursor-pointer'>
                                    <td className='border-1 max-w-[20px] truncate'>{obj.title}</td>
                                    <td className='border-1'>{obj.start_date}</td>
                                    <td className='border-1'>{obj.end_date}</td>
                                    <td className='border-1'>{obj.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                    
                </div>
            </div>
        </>
    )
}
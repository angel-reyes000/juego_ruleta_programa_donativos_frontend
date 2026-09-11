import NavBar from "@/components/navbar";
import Roulette from '@/components/ruleta';
import { FaArrowAltCircleRight, FaCircle } from "react-icons/fa";

export default function Ruleta () {
    return (
        <>
            <NavBar />
            <div className=" flex flex-col bg-[rgba(30,0,0)] h-auto min-h-dvh py-5 px-10 gap-10">
                <div className="flex justify-between items-center text-white">
                    <h1 className="text-3xl font-bold w-[70%] lg:w-[50%]">Juego de ruleta para donaciones mayores a 100 pesos (Titulo de ruleta)</h1>
                    <div>
                        <p className="flex items-center gap-2"><FaCircle className="text-red-500" />Juego inactivo</p>
                        <p>Jugadores: 3758 / 5000</p>
                    </div>
                    
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-10">
                    <Roulette />
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
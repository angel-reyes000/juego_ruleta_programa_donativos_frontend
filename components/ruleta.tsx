"use client"

import { Wheel } from 'spin-wheel';
import { useEffect, useRef } from 'react';

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

export default function Roulette () {
    const refDiv = useRef<HTMLDivElement>(null);
    const refRoulette = useRef(null);

    useEffect(() => {

        const roulette = new Wheel(refDiv.current, segments);
        
        refRoulette.current = roulette;

        return () => roulette.remove();

    }, [])

    return (
            <div className='flex flex-col justify-center items-center gap-5'>
                <div className='w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px]' ref={refDiv} />
                <button onClick={ () => refRoulette.current?.spinToItem(
                    7, // numero ganador 
                    10000, // tiempo girando
                    false, // cae en numero ganador pero si en el centro o no
                    20, // numero de vueltas
                    1 // direccion
                    )} 
                    className='w-[50%] rounded-xl text-xl font-semibold text-black bg-linear-to-r from-yellow-500 to-yellow-200 py-3 px-2 cursor-pointer active:scale-95'>
                    Girar
                </button>
            </div>
        
    )
}
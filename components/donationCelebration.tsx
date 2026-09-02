import Link from "next/link";

export default function DonationCelebration ({ setCelebration }: { setCelebration: (value: boolean) => void}) {
    return (
        <>
            <div className="absolute flex flex-col p-10 gap-5 justify-start items-center w-full h-dvh bg-[radial-gradient(circle,rgb(120,0,0),rgb(30,0,0))] z-5">
                <div className="w-full">
                    <p onClick={() => setCelebration(false)} className="text-white hover:underline hover:text-blue-400 w-fit cursor-pointer">{'< '}Regresar</p>
                </div>
                <div className="flex flex-col mt-10 text-center gap-5">
                    <p className="text-[9rem]">🎉🥳🎉</p>
                    <h1 className="text-white text-6xl m-0">¡Gracias por tu donación!</h1>
                    <p className="text-lg text-white">Tu donación ha sido recibida correctamente. Gracias por contribuir y ser parte de esta iniciativa.</p>
                </div>                
            </div>
        </>
    )
}
import Link from "next/link";

export default function DonationCelebration ({ setCelebration }: { setCelebration: (value: boolean) => void}) {
    return (
        <>
            <div className="casino_overlay absolute flex flex-col p-10 gap-5 justify-start items-center w-full h-dvh bg-[radial-gradient(circle,rgb(150,0,40),rgb(20,0,10))] z-5 overflow-hidden">
                {Array.from({ length: 20 }, (_, i) => (
                    <span key={i} className='casino_coin' style={{ left: `${(i * 5.3) % 100}%`, animationDelay: `${(i % 8) * 0.3}s`, animationDuration: `${2.5 + (i % 5) * 0.4}s` }} />
                ))}
                <div className="w-full">
                    <p onClick={() => setCelebration(false)} className="casino_link w-fit cursor-pointer">{'< '}Regresar</p>
                </div>
                <div className="flex flex-col mt-10 text-center gap-5">
                    <p className="text-[6rem] sm:text-[9rem] casino_float">🎉🥳🎉</p>
                    <h1 className="casino_heading text-4xl sm:text-6xl m-0">¡Gracias por tu donación!</h1>
                    <p className="text-lg text-white">Tu donación ha sido recibida correctamente. Gracias por contribuir y ser parte de esta iniciativa.</p>
                </div>
            </div>
        </>
    )
}

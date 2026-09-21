import { useEffect } from "react";
import { FaCheck, FaInfo, FaExclamationTriangle } from "react-icons/fa";
import '@/app/styles.css';

export type messageType = 'good' | 'bad' | 'info';

export interface messageFloating {
    show: boolean,
    messages: Array<string>,
    type: messageType
}

export default function MessageFloating ({show, messages, type}: messageFloating) {
    
    let backgroundColor;
    if (type === 'good') {
        backgroundColor = ' casino_toast_good '
    } else if (type === 'bad') {
        backgroundColor = ' casino_toast_bad '
    } else {
        backgroundColor = ' casino_toast_info '
    }   

    return (
        <>
            <div className={"casino_toast fixed w-auto z-20 top-24 right-3 sm:right-5 text-white max-w-[calc(100%-1.5rem)] sm:max-w-[400px] px-5 py-3 messageFloating" + (show ? '' : ' hidden ') + backgroundColor}>
                <div className="flex items-center gap-5">
                    <div className="flex items-center justify-center rounded-full bg-black/70 p-2 shrink-0">
                        {type === 'good' ? <FaCheck size={20} /> : null}
                        {type === 'bad' ? <FaExclamationTriangle size={20} /> : null}
                        {type === 'info' ? <FaInfo size={20} /> : null}
                    </div>                    
                    <ul className="list-disc">
                        {messages?.map((message: string, index: number) => (
                            <li key={index} className={"font-semibold"}>{message}</li>
                        ))}
                    </ul>                                                                
                </div>                
            </div>
        </>
    )
}
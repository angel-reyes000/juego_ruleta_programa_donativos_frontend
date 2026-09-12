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
        backgroundColor = ' bg-green-500 '
    } else if (type === 'bad') {
        backgroundColor = ' bg-red-500 '
    } else {
        backgroundColor = ' bg-gray-500 '
    }   

    return (
        <>
            <div className={"fixed w-auto z-20 right-5 text-white rounded-3xl max-w-[400px] border-2 border-white px-5 py-2 messageFloating" + (show ? '' : ' hidden ') + backgroundColor}>
                <div className="flex items-center gap-5">
                    <div className="flex items-center justify-center rounded-3xl bg-black p-2">
                        {type === 'good' ? <FaCheck size={20} /> : null}
                        {type === 'bad' ? <FaExclamationTriangle size={20} /> : null}
                        {type === 'info' ? <FaInfo size={20} /> : null}
                    </div>                    
                    <ul className="list-disc">
                        {messages?.map((message: string) => (
                            <li className={"font-semibold"}>{message}</li>
                        ))}
                    </ul>                                                                
                </div>                
            </div>
        </>
    )
}
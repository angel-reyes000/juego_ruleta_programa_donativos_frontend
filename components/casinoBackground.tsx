// Capa decorativa fija: símbolos de cartas que flotan detrás de todo el contenido.
// Es un componente de servidor sin estado; las animaciones viven en app/styles.css.
const suits = [
    { symbol: '♠', left: 4, delay: 0, duration: 22, size: 2.2, tone: 'white' },
    { symbol: '♥', left: 12, delay: 6, duration: 26, size: 3, tone: 'red' },
    { symbol: '♦', left: 22, delay: 12, duration: 24, size: 2, tone: 'red' },
    { symbol: '♣', left: 31, delay: 3, duration: 28, size: 2.6, tone: 'white' },
    { symbol: '♥', left: 42, delay: 15, duration: 23, size: 2.2, tone: 'red' },
    { symbol: '♠', left: 52, delay: 8, duration: 27, size: 3.2, tone: 'white' },
    { symbol: '♦', left: 61, delay: 1, duration: 25, size: 2.4, tone: 'gold' },
    { symbol: '♣', left: 70, delay: 10, duration: 29, size: 2, tone: 'white' },
    { symbol: '♥', left: 79, delay: 4, duration: 22, size: 2.8, tone: 'red' },
    { symbol: '♠', left: 88, delay: 14, duration: 26, size: 2.2, tone: 'gold' },
    { symbol: '♦', left: 95, delay: 7, duration: 24, size: 3, tone: 'red' },
];

export default function CasinoBackground () {
    return (
        <div aria-hidden="true" className="casino_suits">
            {suits.map((suit, index) => (
                <span
                    key={index}
                    className={`casino_suit casino_suit_${suit.tone}`}
                    style={{
                        left: `${suit.left}%`,
                        fontSize: `${suit.size}rem`,
                        animationDelay: `-${suit.delay}s`,
                        animationDuration: `${suit.duration}s`,
                    }}
                >
                    {suit.symbol}
                </span>
            ))}
        </div>
    )
}

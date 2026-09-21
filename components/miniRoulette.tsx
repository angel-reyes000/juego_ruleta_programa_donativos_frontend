// Mini ruleta decorativa: réplica en SVG de la ruleta del juego (casillas rojo/negro,
// líneas y números dorados, aro de luces). Sin estado, sirve en componentes de servidor y cliente.
const CENTER = 100;
const RADIUS = 92;
const SLICES = 10;
const STEP = 360 / SLICES;

function point (angle: number, radius: number) {
    const radians = (angle * Math.PI) / 180;
    return `${(CENTER + radius * Math.cos(radians)).toFixed(2)} ${(CENTER + radius * Math.sin(radians)).toFixed(2)}`;
}

// La casilla 1 empieza arriba, igual que en la ruleta del juego.
const slices = Array.from({ length: SLICES }, (_, index) => {
    const start = index * STEP - 90;
    const end = start + STEP;

    return {
        number: index + 1,
        path: `M ${CENTER} ${CENTER} L ${point(start, RADIUS)} A ${RADIUS} ${RADIUS} 0 0 1 ${point(end, RADIUS)} Z`,
        labelAngle: start + STEP / 2,
        fill: index % 2 === 0 ? '#d50032' : '#15000c',
    };
});

export default function MiniRoulette ({ size, className = '' }: { size?: number, className?: string }) {
    return (
        <span
            role="img"
            aria-label="ruleta"
            className={`casino_mini_wheel ${className}`}
            style={size ? { width: size, height: size } : { width: '100%' }}
        >
            <svg viewBox="0 0 200 200" aria-hidden="true">
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#15000c" />
                {slices.map((slice) => (
                    <path key={slice.number} d={slice.path} fill={slice.fill} stroke="#ffd23f" strokeWidth="1.5" />
                ))}
                {slices.map((slice) => (
                    <text
                        key={slice.number}
                        x="176"
                        y="100"
                        transform={`rotate(${slice.labelAngle} ${CENTER} ${CENTER})`}
                        textAnchor="end"
                        dominantBaseline="central"
                        fontSize="17"
                        fontWeight="700"
                        fontFamily="sans-serif"
                        fill="#ffd23f"
                        stroke="rgba(0,0,0,0.6)"
                        strokeWidth="0.8"
                    >
                        {slice.number}
                    </text>
                ))}
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#ffd23f" strokeWidth="4" />
                <circle cx={CENTER} cy={CENTER} r="12" fill="#ffd23f" stroke="#b45f06" strokeWidth="2" />
                <circle cx={CENTER} cy={CENTER} r="4.5" fill="#d50032" />
            </svg>
        </span>
    )
}

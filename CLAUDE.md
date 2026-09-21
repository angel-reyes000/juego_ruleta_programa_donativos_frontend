# Guia del proyecto para agentes de IA

Este archivo es el mapa operativo del repositorio. Leerlo antes de modificar codigo. Las reglas especificas de Next.js estan en [AGENTS.md](AGENTS.md) y deben respetarse junto con esta guia.

## Identidad del proyecto

- Proyecto frontend Next.js con App Router, React, TypeScript y Tailwind CSS v4.
- Aplicacion en espanol para un programa de donativos con autenticacion, pagos con Stripe, juegos de cinco rondas y ruleta sincronizada por Socket.IO.
- El backend es un servicio externo. Este repositorio no contiene controladores, modelos ni servidor Socket.IO.
- La API se obtiene de `NEXT_PUBLIC_BACKEND_API` en `.env`.
- La llave publica de Stripe se obtiene de `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en `.env`.
- Nunca copiar valores de `.env` a este archivo ni a logs, commits o respuestas.

## Reglas antes de editar

1. Leer [AGENTS.md](AGENTS.md), este archivo y el archivo objetivo.
2. No editar `node_modules/`, `.next/`, `package-lock.json` manualmente, `next-env.d.ts` ni `tsconfig.tsbuildinfo` salvo que la tarea lo exija.
3. Mantener los nombres de endpoints y las formas de payload existentes, a menos que tambien se actualice el contrato del backend.
4. Usar `@/` para imports desde la raiz cuando ya sea el patron del archivo.
5. Los componentes que usan `localStorage`, hooks, Stripe, AOS, Socket.IO o eventos del navegador deben seguir siendo client components con `"use client"`.
6. Usar `Authorization: Bearer <token>` en endpoints protegidos.
7. Validar despues de editar con `npm run lint` y, cuando sea posible, `npm run build`.
8. No inventar respuestas del backend. Si falta el backend, documentar la suposicion y revisar el payload real en Network o en el servidor.

## Estructura completa

```text
/
|-- AGENTS.md                  Reglas generadas de Next.js para agentes.
|-- CLAUDE.md                  Esta guia operativa.
|-- README.md                  README inicial de create-next-app; esta desactualizado respecto a la funcionalidad.
|-- package.json               Scripts y dependencias.
|-- package-lock.json          Lockfile npm generado.
|-- tsconfig.json              TypeScript estricto, alias @/* y plugin de Next.
|-- next.config.ts             Configuracion de Next.js.
|-- postcss.config.mjs         Plugin de Tailwind CSS v4 para PostCSS.
|-- eslint.config.mjs         ESLint de Next Core Web Vitals y TypeScript.
|-- next-env.d.ts              Referencias automaticas de Next; no editar.
|-- .gitignore                 Ignora dependencias, builds, env y logs.
|-- .env                       Variables locales: backend y Stripe; no documentar valores.
|-- app/
|   |-- layout.tsx             Layout raiz, metadata y fuentes Geist.
|   |-- page.tsx               Inicio, sesion/token y llamada a iniciar donacion.
|   |-- globals.css            Importa Tailwind CSS.
|   |-- styles.css             Animaciones CSS compartidas.
|   |-- login/page.tsx         Login y almacenamiento del JWT.
|   |-- signup/page.tsx        Registro de usuario.
|   |-- donar/page.tsx         Formulario de pago Stripe.
|   |-- ruleta/page.tsx        Juego, rondas, tickets, ruleta y Socket.IO.
|   |-- configuracion/page.tsx Administracion de juegos y premios.
|   |-- acercaDe/page.tsx      Perfil/contacto/cierre de sesion.
|   |-- types/spin-wheel.d.ts  Declaracion minima del modulo spin-wheel.
|-- components/
|   |-- navbar.tsx             Navegacion, rol admin y modal de sesion expirada.
|   |-- messageFloating.tsx    Alertas flotantes tipo good/bad/info.
|   |-- donationCelebration.tsx Pantalla de celebracion; actualmente no se usa.
|-- public/
|   |-- images/                Imagenes locales usadas por las paginas.
|   |-- *.svg                  Assets iniciales de create-next-app no usados como logica.
```

## Archivos de configuracion

### `package.json`

Scripts disponibles:

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run start`: sirve el build.
- `npm run lint`: ESLint.

Dependencias funcionales principales: `next@16.3.3`, `react@19.2.8`, `react-icons`, `aos`, `spin-wheel`, `socket.io-client`, `@stripe/react-stripe-js`, `@stripe/stripe-js` y `stripe`. Tailwind v4 se integra mediante `@tailwindcss/postcss`.

### `tsconfig.json`

TypeScript estricto, sin emision, `moduleResolution: bundler`, JSX `react-jsx`, y alias `@/*` hacia la raiz. Excluye `node_modules` e incluye `.next` para tipos generados.

### `next.config.ts`

Define `allowedDevOrigins: ['192.168.10.1']`. Si se cambia el host de desarrollo, actualizar esta lista.

### `eslint.config.mjs`

Usa las reglas `eslint-config-next/core-web-vitals` y `eslint-config-next/typescript`; ignora `.next`, `out`, `build` y `next-env.d.ts`.

### `postcss.config.mjs` y `app/globals.css`

PostCSS carga `@tailwindcss/postcss`; `globals.css` importa `tailwindcss`.

## Rutas y archivos de UI

### `app/layout.tsx`

Layout servidor. Carga `Geist` y `Geist_Mono`, importa `globals.css`, establece `lang="en"`, metadata generada de create-next-app y renderiza `children` dentro de un `body` flex.

### `app/page.tsx` (`/`)

Client component de inicio. Consulta `/api/getDataUser` con el token para saber si hay sesion, muestra login/logout, muestra la imagen de fondo `fondo_incio.jpg`, presenta la descripcion del programa y dirige a `/donar` si hay token. Usa modal HTML para login o cierre de sesion y AOS para animaciones.

### `app/login/page.tsx` (`/login`)

Client component. Estado controlado `email/password`; POST a `/api/loginUser`; guarda `data.token` en `localStorage` bajo la clave `token` y redirige a `/`. En error muestra `data.error`. El boton actualmente dice `Registrarse`, aunque ejecuta login: conservar o corregir solo si la tarea lo solicita.

### `app/signup/page.tsx` (`/signup`)

Client component. Formulario controlado con `name`, `last_name`, `phone_number`, `email`, `password` y `confirm_password`. Valida coincidencia de contrasenas y POST a `/api/users`; espera HTTP 201 y luego dirige a `/login`.

### `app/donar/page.tsx` (`/donar`)

Client component. Envuelve `FormPayment` en `Elements` de Stripe. `stripePromise` usa `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Valida monto entre 100 y 10000 MXN, titular, terminos y condiciones; solicita `/api/paymentIntent`, confirma con `stripe.confirmCardPayment`, luego llama `/api/createPayment`. Usa `CardNumberElement`, `CardExpiryElement`, `CardCvcElement`, AOS y `MessageFloating`. `DonationCelebration` esta importado pero comentado.

### `app/acercaDe/page.tsx` (`/acercaDe`)

Aunque el nombre sugiere pagina informativa, actualmente es la vista `MiCuenta`. Consulta `/api/getDataUser`, muestra contacto, perfil, fecha de creacion y version `1.0.0`; cerrar sesion elimina `token` y navega a `/`.

### `app/configuracion/page.tsx` (`/configuracion`)

Panel admin. Carga juegos con `/api/getGames`, crea con `/api/postGames`, edita con `/api/updateGame`, carga premios con `/api/getPrizes`, crea premio persistente con `/api/postPrize` y elimina con `/api/deletePrize`. Permite agregar premios temporalmente a `game.prize_list` antes de crear el juego. Maneja modales HTML para crear/editar y filtra juegos por texto. `formatDateTimeLocal` convierte fechas de API a `datetime-local`.

Tipos principales: `Game` contiene `prize_list`; `Prize` contiene `name`, `type`, `value`, `round` y `roulette_number`. Rondas validas 1-5 y numeros de ruleta 1-10.

### `app/ruleta/page.tsx` (`/ruleta`)

Es la superficie mas compleja y debe leerse completa antes de tocarla.

Responsabilidades:

- Crea una instancia `Wheel` en `refDivRoulette` y la elimina al desmontar.
- Conecta un socket global con `io(NEXT_PUBLIC_BACKEND_API)`.
- Consulta el juego activo, la ronda, tickets, donadores, rondas y resultados ganadores.
- Admin puede presionar `Girar`; usuarios normales solo observan.
- Obtiene premios y transforma cada numero 1-10 a `{ id, label }` para la ruleta.
- Escucha `spin`, `prizesUpdated`, `updateRoundSpins`, `latestResults` y `connect`.
- Usa refs para conservar `game_id`, solicitudes de premios, estado de animacion y ruleta actual.
- Muestra progreso de cinco rondas, ultimos resultados y explicacion de reglas.

Tipos locales: `GameData`, `Prize`, `RoundsData`, `RoundData`, `TicketData`, `WinningTickets` y `RouletteData`.

Funciones y flujo actual:

1. `getCurrentGame` llama `/api/getCurrentGame`, guarda el juego y lanza las cargas iniciales.
2. `getCurrentRoundGame(game_id, makePostSpin, updateRoundSpins)` llama `/api/getCurrentRoundGame`. Si `makePostSpin` es verdadero llama `postSpin` y luego vuelve a sincronizar.
3. `postSpin(dataRound)` llama `/api/postSpin` con `round_id` y `dataRound.total_current_spins`, elimina el ticket ganador con `/api/deleteTicket`, obtiene premios, llama `postWinningTickets` y emite `spin`.
4. `postWinningTickets` llama `/api/postWinningTickets` y despues emite `latestResults` con la respuesta recibida.
5. El listener `latestResults` agrega el resultado a `stateWinningTickets`.
6. `getWinningTickets` reemplaza el estado con la respuesta de `/api/getWinningTickets`, protegido por `refWinningTicketsVersion` contra respuestas REST antiguas.

Contrato de socket observado:

- `spin(winning_number, dataRoulette)`: todos animan la ruleta.
- `prizesUpdated(dataRoulette)`: sincroniza segmentos.
- `updateRoundSpins(number, spins, total_current_spins, dataRoulette)`: sincroniza contador y segmentos.
- `latestResults(winningNumber, game_id, round_number, spin_number, prize_name)`: agrega ultimo resultado.
- `getCurrentPrizes(game_id)`: solicitado al conectar; requiere handler en backend que responda `prizesUpdated`.

Advertencias al modificar la ruleta:

- No confundir `spins` (limite de giros de la ronda) con `total_current_spins` (contador actual).
- Verificar con el backend si `postSpin` espera el contador anterior o el siguiente; el archivo actual envia el valor recibido en `dataRound`.
- Evitar dos solicitudes `postSpin` concurrentes: el boton no tiene actualmente un bloqueo de frontend.
- `socket.emit("latestResults", ...)` desde el cliente duplica la responsabilidad del servidor; cualquier cambio debe coordinarse con el backend.
- `stateWinningTickets.sort(...)` muta el array de estado durante el render y las keys usan un contador global `IndexWinningTicket`; es una zona de riesgo para resultados obsoletos o remounts incorrectos.
- Hay imports y constantes sin uso (`FaCircle`, `FaPlus`, `messageType`, `segments`, `winningNumber`, `currentTickets`, entre otros). No limpiar automaticamente si la tarea no lo requiere.
- `WinningTickets.prize_name` esta tipado como `number` aunque el socket usa el fallback string `"Sin premio"`; corregir el contrato si se trabaja en esa zona.

## Componentes compartidos

### `components/navbar.tsx`

Client component. Define enlaces `/donar`, `/ruleta` y `/acercaDe`; consulta `/api/getDataUser`; si el rol es `admin` muestra boton a `/configuracion`; maneja menu movil, logo, ruta activa y modal de sesion expirada.

### `components/messageFloating.tsx`

Exporta `messageType = 'good' | 'bad' | 'info'` e interfaz `messageFloating { show, messages, type }`. Renderiza alertas con iconos de `react-icons/fa` y clases de color segun tipo.

### `components/donationCelebration.tsx`

Pantalla visual de agradecimiento con callback `setCelebration`. Usa emoji, fondo radial y enlace visual de regreso. Actualmente la importacion/uso en donacion esta comentada.

## Estilos y recursos

### `app/styles.css`

Contiene las animaciones `animation_mini_ruleta`, `main_background` y `messageFloating`, con keyframes para rotacion, fondo y entrada lateral.

### `app/globals.css`

Solo importa Tailwind v4.

### `public/images/`

- `fondo_incio.jpg`: fondo de la pagina inicial.
- `fondo_signup.jpg`: fondo de login y registro.
- `5_y_Gana-removebg-preview.png`: logo.
- `mini_ruleta.png`: ruleta pequena usada en modales y formularios.
- `chip_credit_card.jpg`: chip decorativo de tarjeta.
- `personas_ayudando.jpg`: imagen de apoyo en donaciones.

Las imagenes son binarios: no copiar su contenido a este archivo; referenciarlas por ruta y conservar sus nombres.

Los SVG `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg` y `public/window.svg` son assets iniciales y no forman parte del flujo principal actual.

## Backend y endpoints consumidos

Todos los endpoints se construyen con `${NEXT_PUBLIC_BACKEND_API}/api/...`. El token, cuando aplica, va en `authorization: Bearer ${token}`.

| Pagina/funcion | Metodo | Endpoint |
|---|---:|---|
| Inicio, Navbar, Cuenta | GET | `/getDataUser` |
| Login | POST | `/loginUser` |
| Registro | POST | `/users` |
| Donacion | POST | `/paymentIntent` |
| Donacion | POST | `/createPayment` |
| Configuracion | GET | `/getGames` |
| Configuracion | POST | `/postGames` |
| Configuracion | PUT | `/updateGame` |
| Configuracion | GET | `/getPrizes?gameId=...` |
| Configuracion | POST | `/postPrize` |
| Configuracion | DELETE | `/deletePrize` |
| Ruleta | GET | `/getCurrentGame` |
| Ruleta | GET | `/getCurrentRoundGame?game_id=...` |
| Ruleta | GET | `/getTickets?game_id=...` |
| Ruleta | GET | `/getRounds?game_id=...` |
| Ruleta | GET | `/getUsersWithDonation?game_id=...` |
| Ruleta | GET | `/getWinningTickets?game_id=...` |
| Ruleta | POST | `/postSpin` |
| Ruleta | DELETE | `/deleteTicket` |
| Ruleta | GET | `/getPrizes?gameId=...` |
| Ruleta | POST | `/postWinningTickets` |

Antes de cambiar un payload, confirmar las propiedades usadas por el backend. En el frontend aparecen `game_id`, `round_id`, `total_current_spins`, `winning_number`, `dataRound`, `dataSpin`, `dataPrizes`, `prize_name`, `round_number` y `spin_number`.

## Seguridad y estado

- El JWT se guarda en `localStorage` como `token`; no hay middleware de Next ni proteccion server-side en este repositorio.
- Las paginas hacen fetch en el navegador y por eso las variables publicas de entorno deben tener prefijo `NEXT_PUBLIC_`.
- La llave publicable de Stripe puede exponerse al cliente; nunca poner una llave secreta en `.env` publico ni en codigo del frontend.
- El rol admin lo decide la respuesta del backend `getDataUser`; el frontend solo oculta/muestra controles y no debe considerarse autorizacion real.
- No registrar tokens, datos de tarjeta, secretos ni respuestas sensibles con `console.log`.

## Problemas conocidos que una IA debe confirmar antes de corregir

- README y metadata aun son los valores iniciales de create-next-app.
- `layout.tsx` declara `lang="en"`, pero la UI esta en espanol.
- Hay varios `any`, imports no usados y mensajes con faltas ortograficas; no hacer una limpieza amplia junto con un cambio funcional.
- Algunas referencias a clases Tailwind tienen posibles typos (`sm;w`, `border-b-3`, etc.); comprobar si son intencionales antes de modificar estilos.
- Varias llamadas `fetch` no comprueban errores de red o JSON invalido de forma uniforme.
- La aplicacion depende de que el backend este disponible; el frontend por si solo no puede probar autenticacion, pagos ni sincronizacion multiusuario.

## Comandos de trabajo

```powershell
npm install
npm run dev
npm run lint
npm run build
```

Desarrollo: `http://localhost:3000`. Si se prueba desde otra maquina, revisar `allowedDevOrigins` en `next.config.ts` y la URL de `NEXT_PUBLIC_BACKEND_API`.

## Criterio de validacion

Para un cambio de UI: ejecutar lint y revisar la ruta en desktop y movil.

Para un cambio de API: comprobar metodo, endpoint, headers, payload, status esperado y forma de respuesta; revisar Network del navegador.

Para un cambio de ruleta/socket: probar dos clientes conectados, un giro por ronda, cambio de ronda, reconexion y orden de `postSpin`, `postWinningTickets`, `spin`, `updateRoundSpins` y `latestResults`.

Para un cambio de autenticacion/pago: probar expiracion del token, errores del backend, cancelacion de Stripe y no exponer credenciales.

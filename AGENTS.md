<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas del repositorio

Antes de modificar codigo, lee [CLAUDE.md](CLAUDE.md). Ese archivo contiene el inventario del proyecto, el proposito de cada carpeta y archivo, los contratos del backend, los eventos Socket.IO, las variables de entorno y las advertencias conocidas.

### Contexto rapido

- Es un frontend Next.js App Router con React, TypeScript, Tailwind CSS v4, Stripe, AOS, `spin-wheel` y Socket.IO.
- La interfaz esta en espanol y el backend es externo; no hay controladores ni modelos backend en este repositorio.
- Las rutas principales son `/`, `/login`, `/signup`, `/donar`, `/ruleta`, `/configuracion` y `/acercaDe`.
- El JWT se guarda en `localStorage` bajo la clave `token`.
- Las variables locales son `NEXT_PUBLIC_BACKEND_API` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; nunca expongas sus valores en documentacion, codigo o logs.

### Reglas de edicion

1. Lee `CLAUDE.md`, el archivo objetivo y los tipos/llamadas cercanos antes de editar.
2. Conserva los contratos de endpoints y Socket.IO salvo que la tarea incluya cambiar el backend.
3. No edites manualmente `node_modules`, `.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo` ni `package-lock.json`.
4. Usa `@/*` para imports desde la raiz cuando sea consistente con el archivo.
5. Mantén `"use client"` en componentes que usen hooks, `localStorage`, Stripe, AOS, Socket.IO o APIs del navegador.
6. No confíes en el rol renderizado por el frontend como autorización; la autorización real pertenece al backend.
7. No registres tokens, datos de tarjeta, secretos ni valores de `.env`.
8. Haz cambios pequeños y enfocados; no mezcles limpiezas generales con arreglos funcionales.
9. Después de editar ejecuta `npm run lint`; si el cambio afecta compilación, ejecuta también `npm run build`.

### Zonas sensibles

- `app/ruleta/page.tsx`: sincroniza ronda, contador de giros, tickets, premios y resultados mediante REST y Socket.IO. Distingue `spins` del límite de la ronda y `total_current_spins` del contador actual. Prueba dos clientes conectados, reconexión y orden de eventos después de cualquier cambio.
- `app/donar/page.tsx`: usa Stripe Elements y `paymentIntent`; no manipules datos de tarjeta directamente.
- `app/configuracion/page.tsx`: administra juegos y premios; valida rangos de ronda 1-5 y números de ruleta 1-10.
- `components/navbar.tsx`: controla navegación, sesión expirada y acceso visual de admin.

### Comandos

```powershell
npm install
npm run dev
npm run lint
npm run build
```

El servidor local usa normalmente `http://localhost:3000`. Si el cambio depende de API, Stripe o sockets, confirma que `.env` tenga valores locales válidos sin copiarlos al repositorio.

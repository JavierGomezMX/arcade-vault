# SPEC 01 — MVP cosmético de Arcade Vault

> **Status:** Approved
> **Depends on:** Ninguna (primer spec del proyecto)
> **Date:** 2026-07-21
> **Objective:** Construir el MVP visual de Arcade Vault en Next.js 16 (App Router) portando fielmente el diseño de los 5 templates estáticos en `references/templates/` (biblioteca, detalle, reproductor, salón de la fama, nav) como páginas reales, sin lógica de negocio ni persistencia.

---

## Scope

**Dentro:**

- Páginas App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/juegos/[id]/jugar` (reproductor, snapshot congelado), `/salon` (salón de la fama).
- Componente `Nav` (logo, links, contador de créditos, hamburguesa móvil funcional) — sin botón de login.
- Módulo de datos estáticos (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) portado de `data.jsx` a TS, usado solo para renderizar contenido.
- Estilos portados de `styles.css` a `globals.css` (variables CSS, clases, animaciones neón/CRT).
- Fuentes (Press Start 2P, Courier Prime, JetBrains Mono) vía `next/font/google`, reemplazando Geist en `layout.tsx`.
- Interacciones puramente presentacionales conservadas: toggle de menú móvil, tilt de tarjetas al hover, navegación entre rutas (clicks en cards/botones que cambian de página).

**Out of scope (for future specs):**

- Autenticación (login/registro) — pantalla `auth.jsx` no se implementa.
- Cualquier lógica de juego real (game loop, colisiones, teclado/táctil).
- Persistencia (localStorage, DB, sesión de usuario).
- Filtrado/búsqueda funcional en biblioteca (search box y chips se renderizan pero no filtran).
- Guardado de puntuación, pausa/fin de partida funcionales en el reproductor.
- Internacionalización (todo el copy queda en español, tal como los templates).

---

## Data model

Módulo estático `src/data/games.ts` (puerto directo de `data.jsx`, tipado):

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;   // clase CSS de fondo, ej. "cover-bricks"
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;   // ej. "12.4K"
}

export const GAMES: Game[];
export const CATS: readonly ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"];
export const PLAYERS: readonly string[];

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/2026"
}

export function seededScores(seed: number, count?: number): ScoreRow[];
```

No hay persistencia ni mutación — `seededScores` es función pura, llamada en tiempo de render (server o client) para generar filas de leaderboard deterministas, igual que en el template original.

---

## Implementation plan

1. **Fuentes y layout base.** Configurar `next/font/google` (Press Start 2P, Courier Prime, JetBrains Mono) en `src/app/layout.tsx`, reemplazando Geist/Geist_Mono. Sistema queda compilando con las fuentes nuevas expuestas como CSS vars.
2. **Estilos globales.** Portar `styles.css` a `src/app/globals.css` (variables de color/neón, clases `.av-*`, `.card`, `.btn`, animaciones CRT/flicker/pulse). Verificar que Tailwind v4 y el CSS portado conviven sin colisión de clases.
3. **Módulo de datos.** Crear `src/data/games.ts` con `GAMES`, `CATS`, `PLAYERS`, `seededScores` tipados, portados de `data.jsx`.
4. **Componente Nav.** Crear `src/components/nav.tsx` (client component) con logo, links (Biblioteca, Salón de la Fama), contador de créditos, hamburguesa + panel móvil funcional (useState), sin botón de login. Montado en `layout.tsx`.
5. **Página biblioteca (`/`).** Crear `src/app/page.tsx` + `src/components/game-card.tsx` (client, con tilt on hover). Grid de juegos desde `GAMES`, hero, search box y chips renderizados pero inertes (sin filtrado). Cards navegan a `/juegos/[id]` con `Link`.
6. **Página detalle (`/juegos/[id]`).** Crear `src/app/juegos/[id]/page.tsx`: portada, info, tags, stat strip, leaderboard (`seededScores`), botones "JUGAR AHORA" (link a `/juegos/[id]/jugar`) y "VOLVER AL VAULT".
7. **Página reproductor (`/juegos/[id]/jugar`).** Crear `src/app/juegos/[id]/jugar/page.tsx`: HUD con valores fijos (puntuación 0, 3 vidas, nivel 01), arena CRT estática, botones PAUSA/FIN/SALIR presentes pero inertes, sin modal de fin de juego funcional.
8. **Página salón (`/salon`).** Crear `src/app/salon/page.tsx` (client, por el `useState` de tabs por juego): tabs por juego, podio top 3, tabla completa vía `seededScores`, sin fila "tu mejor marca" (depende de usuario, que no existe en este MVP).
9. **Footer.** Añadir footer fijo (copyright/versión) en `layout.tsx`, igual que `app.jsx`.
10. **Limpieza.** Eliminar boilerplate de `create-next-app` no usado (logo de Vercel, etc.) de `page.tsx`/`globals.css` originales.

Cada paso deja el sistema compilando y navegable.

---

## Acceptance criteria

- [ ] `npm run dev` levanta sin errores; `npm run build` compila sin errores de tipo/lint.
- [ ] `/` muestra hero, search box, chips de categoría y grid de las 8 cards de `GAMES`, con estilos neón/CRT del template.
- [ ] Click en una card (o botón "JUGAR") navega a `/juegos/[id]` correspondiente.
- [ ] `/juegos/[id]` muestra portada, tags, descripción larga, stat strip y leaderboard de 10 filas para cada uno de los 8 juegos.
- [ ] Botón "JUGAR AHORA" en detalle navega a `/juegos/[id]/jugar`; botón "VOLVER AL VAULT" navega a `/`.
- [ ] `/juegos/[id]/jugar` muestra HUD (puntuación 0, 3 vidas, nivel 01), arena CRT, y botones PAUSA/FIN/SALIR presentes sin acción funcional (SALIR sí navega de vuelta a `/juegos/[id]`).
- [ ] `/salon` muestra tabs por los 8 juegos, podio top 3 y tabla de 12 filas que cambia al hacer click en cada tab.
- [ ] Nav visible en todas las páginas: logo (link a `/`), links Biblioteca/Salón de la Fama con estado activo correcto, contador de créditos, sin botón de login.
- [ ] Hamburguesa en viewport móvil abre/cierra el panel lateral.
- [ ] Hover sobre una card en biblioteca produce efecto tilt.
- [ ] Ninguna ruta usa `localStorage`, `auth`, guardado de puntuación, ni filtrado real de búsqueda/categoría.
- [ ] No existe ruta `/auth`.

---

## Decisions

- **Sí:** routing real (App Router) en vez del hash-router del template. Motivo: convención Next 16, evita complicar SSR/enlaces sin aportar valor al MVP.
- **No:** portar el hash-router de `app.jsx`. Iría contra la convención del framework.
- **Sí:** "sin comportamiento" se interpreta como estático/inerte para lógica de dominio (datos, auth, persistencia, simulación de juego), pero se conservan interacciones puramente presentacionales sin estado de dominio (hamburguesa, tilt).
- **Sí:** auth omitida por completo, sin ruta ni botón. Motivo: no dejar UI/rutas muertas sin propósito en el MVP.
- **No:** dejar botón/página de auth inerte como placeholder.
- **Sí:** pantalla de reproductor se mantiene como snapshot congelado (sin `useEffect`/`setInterval`), para completar el recorrido visual del producto.
- **No:** excluir la pantalla de reproductor del MVP.
- **Sí:** datos mock como módulo TS estático (`src/data/games.ts`), reutilizado entre biblioteca/detalle/salón.
- **No:** hardcodear datos por página.
- **Sí:** portar `styles.css` casi literal a `globals.css`. Motivo: prioriza fidelidad visual al template y velocidad de entrega sobre alineamiento total con convención Tailwind del proyecto.
- **No:** traducir todo el diseño a utilidades Tailwind v4 en este spec.
- **Sí:** fuentes vía `next/font/google`, siguiendo convención ya establecida en `layout.tsx` (Geist).
- **No:** `<link>` de Google Fonts como en el HTML original.
- **Sí:** rutas en español (`/juegos/[id]`, `/salon`), consistente con el copy de la UI.

---

## Risks

| Risk                                                              | Mitigation                                                                                                    |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Colisión Tailwind v4 / CSS portado (`@theme`, variables, clases) | El template ya usa namespacing propio (`av-*`, `.card`, `.btn`) que evita choque directo con utilidades Tailwind |
| Next 16 / React 19.2 con APIs distintas a las conocidas            | Revisar `node_modules/next/dist/docs/01-app` antes de escribir rutas/páginas, por `CLAUDE.md`                   |
| `next/font/google` sin soporte pleno para Press Start 2P           | Verificar disponibilidad del font/subset en el paquete `next/font/google` actual antes de usarlo                |

---

## What is **not** in this spec

- Autenticación (login/registro/social login).
- Lógica de juego real, teclado/táctil, colisiones.
- Persistencia (localStorage, DB, sesión).
- Búsqueda/filtrado funcional.
- Guardado de puntuación y modal de fin de juego funcional.
- Internacionalización.

Cada uno de estos, si se implementa, va en su propio spec.

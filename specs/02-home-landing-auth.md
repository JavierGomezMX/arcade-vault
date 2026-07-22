# SPEC 02 — Home (landing) + Auth

> **Status:** Approved
> **Depends on:** SPEC 01 (MVP cosmético)
> **Date:** 2026-07-21
> **Objective:** Portar la Home landing de `references/templates/homeabout/home.jsx` como nueva portada ("/") de Arcade Vault, moviendo la biblioteca a "/biblioteca" y creando la ruta "/auth" (portada de `auth.jsx`) para que los CTAs de Home tengan destino real, sin implementar la página "Acerca de".

---

## Scope

**Dentro:**

- `/` (nueva ruta): Home landing portada de `home.jsx` — hero, sección "por qué Arcade Vault", preview de juegos, stats, actividad en vivo, precios, CTA final.
- `/biblioteca` (ruta movida): contenido actual de `/` (biblioteca, spec 01) sin cambios de comportamiento, solo cambia el path.
- `/auth`: portada de `auth.jsx` — tabs Iniciar Sesión/Crear Cuenta, formulario controlado, botón invitado, botones sociales (inertes, solo visuales), sin backend ni sesión persistente.
- `Nav` actualizado: links Inicio (`/`), Biblioteca (`/biblioteca`), Salón de la Fama (`/salon`), Acerca de (visible, sin `href`/deshabilitado), botón "Iniciar Sesión" (`/auth`).
- Estilos: portar bloque `HOME PAGE` y bloque `auth` de `styles.css` a `globals.css` (bloque `ABOUT PAGE` queda fuera).
- Stats de Home usan `GAMES.length` real; actividad en vivo usa `seededScores()` con seed fijo (mismo patrón que salón/detalle).
- Todos los enlaces internos existentes que apuntaban a `/` (cards, botones "volver", etc.) se actualizan a `/biblioteca` donde correspondía a la biblioteca.

**Out of scope (para specs futuros):**

- Página "Acerca de" (`about.jsx`) — ni ruta, ni estilos, ni link funcional en nav.
- Sesión de usuario real, persistencia de login, backend de auth.
- Validación de formulario más allá de la del template (campos requeridos básicos).
- Recuperar contraseña, login social funcional (Google/GitHub son botones inertes).
- Cualquier lógica de negocio nueva (puntos, créditos reales, etc.).

---

## Data model

No introduce estructuras de datos nuevas. Reutiliza `GAMES`, `seededScores()` de `src/data/games.ts` (spec 01).

Estado local (no persistido, solo `useState` dentro de cada componente):

```ts
// src/app/auth/page.tsx (o AuthForm)
type AuthTab = "in" | "up";
// tab, user, pass, email — inputs controlados, sin guardar en ningún store
```

---

## Implementation plan

1. **Mover biblioteca a `/biblioteca`.** Crear `src/app/biblioteca/page.tsx` con el contenido actual de `src/app/page.tsx`, borrar `src/app/page.tsx` viejo (temporalmente sin `/`, se restaura en el paso 3). Actualizar `Link href="/"` → `/biblioteca` en `juegos/[id]/page.tsx` (botón "VOLVER AL VAULT") y `salon/page.tsx` (botón "VOLVER A LA BIBLIOTECA"). Sistema compila; `/biblioteca` funciona, `/` da 404 momentáneo.
2. **Estilos Home + Auth.** Portar bloque `HOME PAGE` (silhouettes, hero, features, mini-rail, stats, activity, pricing, final CTA) y bloque `auth` de `references/templates/homeabout/styles.css` a `src/app/globals.css`.
3. **Página Home en `/`.** Crear `src/app/page.tsx` con el contenido de `home.jsx` portado a TSX: hero con silhouettes SVG, sección "por qué", preview `GAMES.slice(0,6)` (reusa `GameCard`/mini-card propio), stats (`GAMES.length`), actividad en vivo (`seededScores(seed)`), pricing, CTA final. CTAs: "EXPLORAR JUEGOS"/"VER TODOS LOS JUEGOS"/CTA final → `/biblioteca`; "CREAR CUENTA" y "EMPEZAR GRATIS" → `/auth`. Sistema compila; `/` navegable de punta a punta.
4. **Página Auth en `/auth`.** Crear `src/app/auth/page.tsx` (client) portando `auth.jsx`: tabs Iniciar Sesión/Crear Cuenta, inputs controlados, submit navega a `/biblioteca`, botón "JUGAR COMO INVITADO" navega a `/biblioteca`, botones sociales inertes.
5. **Nav actualizado.** En `src/components/nav.tsx`: agregar link "Inicio" (`/`, activo solo en `pathname === "/"`), ajustar `isBiblioteca` a `pathname.startsWith("/biblioteca") || pathname.startsWith("/juegos")`, agregar "Acerca de" sin `href` (span deshabilitado, mismo estilo visual apagado), agregar botón "Iniciar Sesión" → `/auth` (reemplaza el hueco donde estaba en el template original). Aplicar mismo set de links en el panel móvil.
6. **Verificación final.** `npm run build` sin errores; recorrer manualmente `/` → `/biblioteca` → `/juegos/[id]` → `/auth` → `/salon` confirmando que ningún link interno quedó apuntando a una ruta vieja.

---

## Acceptance criteria

- [ ] `npm run dev` levanta sin errores; `npm run build` compila sin errores de tipo/lint.
- [ ] `/` muestra la Home: hero con silhouettes, sección "por qué Arcade Vault" (4 features), preview de 6 juegos, stats, actividad en vivo, precios, CTA final.
- [ ] `/biblioteca` muestra exactamente lo que antes mostraba `/` (hero, search inerte, chips inertes, grid de 8 cards).
- [ ] Botón "EXPLORAR JUEGOS" y CTA final de Home navegan a `/biblioteca`.
- [ ] Botones "CREAR CUENTA" (hero) y "EMPEZAR GRATIS" (precios) navegan a `/auth`.
- [ ] Stats de Home muestran `8+` (derivado de `GAMES.length`), no un número hardcodeado.
- [ ] Sección actividad en vivo usa filas generadas por `seededScores()`, no hardcodeadas.
- [ ] `/auth` muestra tabs Iniciar Sesión/Crear Cuenta funcionales (cambian el formulario visible); enviar el formulario navega a `/biblioteca`; "JUGAR COMO INVITADO" navega a `/biblioteca`.
- [ ] Botones sociales (Google/GitHub) en `/auth` presentes pero sin acción.
- [ ] Nav en todas las páginas: Inicio, Biblioteca, Salón de la Fama, Acerca de (sin link, visualmente apagado), botón "Iniciar Sesión" → `/auth`; estado activo correcto en cada ruta.
- [ ] Ningún `Link`/`href` interno del proyecto apunta a `/` esperando la biblioteca (todos actualizados a `/biblioteca`).
- [ ] No existe ruta `/about` ni `/acerca-de`.
- [ ] Hamburguesa móvil abre/cierra panel con los mismos links que el nav de escritorio.

---

## Decisiones tomadas y descartadas

- **Sí:** Home pasa a ser `/`, biblioteca se mueve a `/biblioteca`. Motivo: fidelidad al template original, donde Home es la portada real del sitio.
- **No:** Home en `/inicio` dejando `/` como biblioteca. Se descartó por decisión explícita del usuario.
- **Sí:** crear ruta `/auth` real en este spec, aunque spec 01 la había excluido. Motivo: decisión explícita del usuario para que los CTAs de Home ("CREAR CUENTA", "EMPEZAR GRATIS") tengan destino real en vez de quedar inertes.
- **No:** dejar "CREAR CUENTA"/"EMPEZAR GRATIS" inertes como se planteó inicialmente. Descartado tras la aclaración del usuario.
- **Sí:** `/auth` es formulario funcional sin backend — inputs controlados, submit navega a `/biblioteca`, sin sesión persistida ni store de usuario. Motivo: no hay backend ni modelo de usuario en el proyecto; ir más allá sería inventar alcance no pedido.
- **No:** guardar el nombre de usuario introducido en `/auth` en ningún lado (ni Nav ni contexto), porque no hay dónde mostrarlo todavía (spec 01 no definió estado de sesión).
- **Sí:** reincorporar botón "Iniciar Sesión" en Nav apuntando a `/auth`. Motivo: consistente con que la ruta ahora existe; dejarlo fuera crearía una ruta sin entrada visible.
- **Sí:** "Acerca de" se muestra en Nav sin `href` (deshabilitado) en vez de omitirse. Motivo: decisión explícita del usuario, mantiene fidelidad visual al template mientras la página real queda para spec futuro.
- **No:** implementar `about.jsx` ni sus estilos en este spec.
- **Sí:** stats de Home usan `GAMES.length` real (`8+`) en vez del `12+` hardcodeado del template. Motivo: evitar un número que no coincide con el catálogo real del proyecto.
- **Sí:** actividad en vivo usa `seededScores()` en vez de las filas hardcodeadas del template. Motivo: consistencia con el patrón de datos ya establecido en spec 01 (detalle, salón).
- **No:** copiar literal las filas hardcodeadas de "últimas puntuaciones"/"top jugadores" del template.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Mover `/` rompe enlaces/bookmarks externos a la biblioteca (antes en `/`) | Aceptado: proyecto sin usuarios reales aún (MVP), sin necesidad de redirect de compatibilidad |
| Confusión entre "Iniciar Sesión" en Nav sin sesión real detrás (no hay estado logueado visible tras `/auth`) | Documentado en Decisiones: alcance de `/auth` es solo formulario, sin persistencia; próximo spec de sesión resolverá el resto |
| Colisión de nombres de clases CSS entre bloques `home-*`/`auth-*` recién portados y los ya existentes en `globals.css` | Namespacing propio del template (`home-*`, `av-auth-wrap`, `auth-*`) ya evita colisión, mismo patrón que spec 01 |
| `seededScores()` con seed fijo en Home podría coincidir visualmente con el mismo seed usado en salón/detalle si se reutiliza sin cuidado | Elegir un seed distinto y documentado en el código para la sección de Home |

---

## What is **not** in this spec

- Página "Acerca de" (`about.jsx`), ruta o estilos.
- Sesión de usuario real, persistencia de login, backend de auth.
- Validación avanzada de formulario, recuperar contraseña, login social funcional.
- Nueva lógica de negocio (puntos, créditos reales).

Cada uno de estos, si se implementa, va en su propio spec.

# SPEC 03 — Instalación Supabase + Auth funcional

> **Estado:** Approved
> **Depende de:** SPEC 02 (Home + Auth UI)
> **Fecha:** 2026-07-23
> **Objetivo:** Conectar Supabase (proyecto nuevo, cliente browser/server/middleware) a la página `/auth` existente para que signup/login/logout funcionen de verdad con sesión persistida, reflejando el estado de sesión en el Nav.

---

## Scope

**Dentro:**

- Crear proyecto Supabase nuevo (supabase.com), obtener `URL` + `anon key`.
- Confirmación de email desactivada en config del proyecto (Auth → Settings) para MVP.
- Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` (+ entradas en `.env.local.example`).
- Clientes Supabase siguiendo patrón oficial `@supabase/ssr` para Next.js 16 App Router:
  - `src/lib/supabase/client.ts` — browser client (componentes cliente).
  - `src/lib/supabase/server.ts` — server client (Server Components/Actions, usa `cookies()`).
  - `src/lib/supabase/middleware.ts` + `middleware.ts` (raíz) — refresco de sesión en cada request.
- `/auth` (`src/app/auth/page.tsx` o componente extraído): tab "Crear Cuenta" llama `supabase.auth.signUp`; tab "Iniciar Sesión" llama `supabase.auth.signInWithPassword`. Ambos, en éxito, navegan a `/biblioteca`. En error, muestran `error.message` de Supabase en el formulario.
- Logout: acción para `supabase.auth.signOut()`, disponible desde el Nav.
- Nav (`src/components/nav.tsx`): detecta sesión activa (server-side, vía el server client); si hay sesión muestra email del usuario + botón "Cerrar sesión"; si no hay sesión, muestra "Iniciar Sesión" → `/auth` (comportamiento actual).

**Fuera de alcance (para specs futuros):**

- Tabla `profiles` propia (username, avatar, stats) — se usa solo `auth.users`.
- Mensajes de error custom/traducidos — se muestra el mensaje de Supabase tal cual.
- Protección de rutas (`/biblioteca`, `/juegos/[id]`, `/salon` quedan públicas, sin requerir sesión).
- Login social funcional (Google/GitHub) — botones siguen inertes.
- Sesión anónima para "JUGAR COMO INVITADO" — sigue navegando a `/biblioteca` sin sesión, como hoy.
- Recuperar contraseña.
- Cualquier lógica de negocio nueva (puntos, créditos reales).

---

## Data model

No introduce tablas nuevas en Supabase (se usa `auth.users`, gestionada por el propio servicio de Auth). No requiere migraciones SQL.

Variables de entorno nuevas (`.env.local`, `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Sin estado local nuevo relevante: el estado de sesión vive en las cookies que gestiona `@supabase/ssr` (no en `useState`/store propio).

---

## Implementation plan

1. **Proyecto Supabase.** Crear proyecto en supabase.com. En Auth → Settings, desactivar "Confirm email". Copiar `URL` y `anon key`.
2. **Env vars.** Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` a `.env.local` y a `.env.local.example` (con placeholders). Sistema sigue compilando, sin uso todavía.
3. **Clientes Supabase.** Crear `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server, usa `cookies()` de `next/headers`), `src/lib/supabase/middleware.ts` (helper de refresco de sesión) y `middleware.ts` en la raíz del proyecto que lo invoca. `npm run build` sin errores; sin cambio de comportamiento visible aún.
4. **Signup/login en `/auth`.** Conectar tab "Crear Cuenta" a `supabase.auth.signUp({ email, password })` y tab "Iniciar Sesión" a `supabase.auth.signInWithPassword({ email, password })`, ambos desde el browser client. Éxito → `router.push("/biblioteca")`. Error → mostrar `error.message` en el formulario (reemplaza el submit inerte actual). Sistema navegable: signup y login reales funcionan.
5. **Logout.** Agregar acción (Server Action o handler client con browser client) que llama `supabase.auth.signOut()` y redirige a `/`.
6. **Nav con estado de sesión.** `src/components/nav.tsx` pasa a Server Component (o recibe la sesión desde su padre/layout vía server client): si hay sesión, muestra email del usuario + botón "Cerrar sesión" (dispara logout del paso 5); si no hay sesión, muestra "Iniciar Sesión" → `/auth` (igual que hoy). Aplicar mismo estado en panel móvil.
7. **Verificación final.** `npm run build` sin errores; recorrer manualmente: signup con email nuevo → sesión activa → Nav muestra email → logout → Nav vuelve a "Iniciar Sesión" → login con esa cuenta → sesión activa de nuevo. Probar también error de login (password incorrecto) y error de signup (email ya registrado) muestran mensaje de Supabase.

---

## Acceptance criteria

- [ ] `npm run dev` levanta sin errores; `npm run build` compila sin errores de tipo/lint.
- [ ] Proyecto Supabase creado, con "Confirm email" desactivado.
- [ ] `.env.local` y `.env.local.example` contienen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts` existen y siguen el patrón oficial `@supabase/ssr`; `middleware.ts` en la raíz refresca sesión en cada request.
- [ ] Tab "Crear Cuenta" en `/auth` crea usuario real en Supabase y navega a `/biblioteca` en éxito, logueado.
- [ ] Tab "Iniciar Sesión" en `/auth` loguea con credenciales existentes y navega a `/biblioteca` en éxito.
- [ ] Errores de signup (email ya registrado) y login (password incorrecto) muestran el `error.message` de Supabase en el formulario, sin romper la página.
- [ ] Con sesión activa, Nav (desktop y móvil) muestra el email del usuario y botón "Cerrar sesión" en vez de "Iniciar Sesión".
- [ ] "Cerrar sesión" termina la sesión, redirige a `/`, y Nav vuelve a mostrar "Iniciar Sesión".
- [ ] "JUGAR COMO INVITADO" sigue navegando a `/biblioteca` sin crear sesión.
- [ ] Botones sociales (Google/GitHub) en `/auth` siguen presentes sin acción.
- [ ] `/biblioteca`, `/juegos/[id]`, `/salon` siguen accesibles sin sesión (no protegidas).
- [ ] No existe tabla `profiles` ni migración SQL nueva.

---

## Decisiones tomadas y descartadas

- **Sí:** desactivar confirmación de email para MVP. Motivo: decisión explícita del usuario, evita agregar estado UX de "revisá tu email" en este spec; documentado como algo a revisar antes de producción real.
- **No:** mantener confirmación de email activa en este spec.
- **Sí:** usar solo `auth.users` de Supabase, sin tabla `profiles`. Motivo: decisión explícita del usuario, no hay feature todavía (username, stats) que la necesite.
- **No:** crear tabla `profiles` con trigger de creación en signup en este spec.
- **Sí:** Nav refleja estado de sesión (email + logout). Motivo: decisión explícita del usuario para que el login se sienta real, no solo un formulario que redirige.
- **No:** dejar Nav mostrando "Iniciar Sesión" siempre, ignorando la sesión real.
- **Sí:** mensajes de error tal cual los devuelve Supabase (`error.message`), sin mapeo a español. Motivo: decisión explícita del usuario, menos alcance en este spec.
- **No:** mapear cada código de error de Supabase a mensaje custom en español.
- **Sí:** todas las rutas existentes quedan públicas, sin requerir sesión. Motivo: decisión explícita del usuario, no hay todavía funcionalidad (progreso, puntos) que justifique proteger rutas.
- **No:** proteger `/biblioteca`, `/juegos/[id]` o `/salon` con middleware de auth en este spec.
- **Sí:** "JUGAR COMO INVITADO" sigue sin sesión (comportamiento actual). Motivo: decisión explícita del usuario, sesión anónima de Supabase agrega complejidad no pedida.
- **No:** implementar sesión anónima de Supabase para el botón invitado.
- **Sí:** usar los tres clientes del patrón oficial `@supabase/ssr` (browser/server/middleware). Motivo: es el patrón recomendado por Supabase para Next.js App Router con cookies, necesario para que el Nav (Server Component) pueda leer la sesión.

---

## Riesgos

| Riesgo                                                                                              | Mitigación                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `anon key` expuesta en cliente (es pública por diseño, pero mal uso podría exponer datos)           | Sin tabla `profiles` ni RLS custom en este spec; `auth.users` no es accesible vía API pública, riesgo bajo                                                                                           |
| Confirmación de email desactivada permite signups con emails falsos/no verificados                  | Aceptado para MVP; documentado en Decisiones como algo a revertir antes de producción real                                                                                                           |
| Nav como Server Component puede requerir refactor de estructura actual (si hoy es Client Component) | Verificar en implementación; si Nav necesita interactividad cliente (menú móvil), extraer solo el estado de sesión a un Server Component padre o usar `supabase.auth.getUser()` en un wrapper server |
| Middleware mal configurado corta requests o rompe rutas estáticas                                   | Seguir patrón oficial `@supabase/ssr` al pie de la letra, excluir assets estáticos en el `matcher`                                                                                                   |

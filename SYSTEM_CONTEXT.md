# SYSTEM_CONTEXT.md

## 🧠 Propósito de este Archivo
Este archivo es la **Memoria Central y Contexto del Sistema** para cualquier Inteligencia Artificial o desarrollador. Describe **CÓMO** y **POR QUÉ** funciona el sistema CEUTA.
**Regla:** Si modificas la lógica central, arquitectura o flujos, DEBES actualizar este archivo.

---

## 🏗 Arquitectura y Tech Stack

**Core:**
*   **Framework:** Next.js 16 (App Router).
*   **Lenguaje:** TypeScript.
*   **Estilos:** TailwindCSS (v4) + Shadcn/UI.
*   **Base de Datos & Auth:** Supabase (PostgreSQL) — plan gratuito.
*   **Storage:** Cloudinary (comprobantes e imágenes).
*   **Emails:** Resend HTTP (primario). SMTP/Nodemailer solo como fallback. Templates en DB.
*   **Cron:** Vercel Cron diario (Hobby: máximo 1 corrida/día). GitHub Actions horario **desactivado**.
*   **Deploy:** Vercel (Hobby).
*   **Pagos:** Mercado Pago (preference API) + dLocal (Argentina) + transferencia con comprobante.

**Diagrama de Arquitectura:**
```mermaid
graph TB
    User[Usuario] --> Next[Next.js en Vercel]
    User --> Cloud[Cloudinary]
    Next --> DB[(Supabase)]
    Next --> Resend[Resend HTTP]
    VercelCron[Vercel Cron diario] --> Next
    DB --> Auth[Supabase Auth Admins]
```

---

## 💾 Base de Datos (14 Tablas)

El modelo de datos es relacional y centralizado en Supabase.

| Tabla | Descripción Crítica | Detalles Importantes |
|-------|---------------------|----------------------|
| `cursos` | Catálogo educativo | Precios, fechas, descuentos por cupo, galería, video_url, sync web vieja (`url_web_vieja`). |
| `inscriptos` | Usuarios (Leads/Alumnos) | Centraliza todo. `access_token` (magic link), `estado`, `comprobante_url`, `monto_pago` (precio congelado). |
| `docentes` | Equipo docente | FK desde `cursos.docente_id`. |
| `programa_clases` | Temario de cada curso | FK a `cursos`. |
| `faqs_cursos` | Preguntas frecuentes | `curso_id` NULL = global. |
| `descuentos` | Códigos promocionales | Validación en backend. |
| `email_templates` | Plantillas HTML/Texto | DEFINEN el contenido. No hardcodear textos de secuencia. |
| `scheduled_emails` | Cola de envío | 24h, 72h, 7d. `pending` → `sent` / `cancelled` / `failed`. |
| `email_logs` | Historial de envíos | Auditoría. FK a `inscriptos`. |
| `testimonios` | Testimonios de alumnos | Landing. |
| `configuracion` | Config del sistema | Pares clave/valor (email contacto, datos bancarios). |
| `analytics_events` | Tracking de visitas | session_id, page_path, UTMs. |
| `embeddings_cursos` | Embeddings vectoriales | Búsqueda semántica. |
| `historial_chats` | Historial de chats | Bot WhatsApp. |

**Nota:** Los comprobantes de pago se guardan como URL en `inscriptos.comprobante_url` (no hay tabla de comprobantes).

---

## 🔄 Flujos Críticos de Negocio

### 1. Inscripción (Wizard de 3 Pasos + Perfil Post-Pago)
El componente `EnrollmentModal.tsx` es el corazón de la conversión.
1.  **Paso 1 (Contacto):** Nombre/Email/Tel. Crea registro (`estado: 'contacto'`). Genera `access_token`. Envía email `confirmacion` y programa la secuencia.
2.  **Paso 2 (Pago):** Tipo (Total/Cuota o Seña) y método (Transferencia / MercadoPago / dLocal / Efectivo). Código de descuento opcional.
3.  **Paso 3 (Confirmación):** Instrucciones + subida de comprobante.
4.  **Post-Upload (Perfil):** `CompleteProfileForm` (Cédula, Edad, Departamento, Dirección, Cómo se enteró).

#### 1.b. Puntos de entrada al wizard (`CourseEnrollProvider`) — 02/09/2026

Todo lo que puede abrir el wizard en `/cursos/[slug]` cuelga de **un único provider**
(`components/cursos/CourseEnrollContext.tsx`). El contexto y los tipos viven aparte,
en `courseEnrollStore.ts`, para que el provider pueda importar la barra y el modal
sin ciclo de imports.

Puntos de entrada, todos contra **la misma instancia de `EnrollmentModal`**:

| Punto | Componente | Dónde aparece |
|---|---|---|
| CTA de la sidebar | `EnrollButton` | Pantalla ~1,1 (mobile) / sidebar sticky (desktop) |
| Barra fija al pie | `CourseStickyCta` | Desde que el CTA de la sidebar sale de pantalla |
| Cierre tras el programa | `InlineEnrollCta` | Después de `ProgramaSection` |
| Cierre tras testimonios | `InlineEnrollCta` | Después de los testimonios |
| Cierre tras FAQ | `InlineEnrollCta` | Después de `FAQSection` |

**Reglas que no hay que romper:**

1.  **Un solo modal y un solo precio.** Antes el estado del modal vivía en
    `EnrollButton` y la modalidad (híbrido / 100% online) en `CourseSidebarClient`.
    Con varios CTA en la página eso daba dos instancias y dos precios distintos:
    la barra podía decir $5.000 y la sidebar $2.500 según qué modalidad estuviera
    elegida. El precio se calcula **una sola vez** en el provider con
    `calcularDescuento`, el mismo helper que usa `PriceDisplay`.
2.  **La barra se muestra por `getBoundingClientRect`, no por `IntersectionObserver`.**
    IO se entrega desde el pipeline de render: en pestañas de fondo o webviews que
    no componen frames puede no dispararse nunca y la barra quedaría escondida para
    siempre.
3.  **La barra publica su alto en `--ceuta-cta-h`.** Los elementos flotantes
    (`WhatsAppButton`, `InscripcionBanner`) llevan la clase `.ceuta-floating-offset`
    (definida en `globals.css`) y se corren hacia arriba con `translateY`. Si se
    agrega otro elemento fijo al pie, tiene que llevar esa clase.
4.  **La barra va en `z-40`, debajo del overlay del `Dialog` (`z-50`), y además se
    oculta con el modal abierto.**
5.  **Nada de urgencia inventada.** La única cuenta regresiva de la barra sale de
    `fecha_inicio` ("Empieza en N días", solo si faltan 21 días o menos). Las fechas
    se arman con los componentes Y-M-D en hora local, igual que `formatearFechaLarga`:
    `new Date('2026-09-10')` es medianoche UTC y en UTC-3 descuenta un día.

⚠️ **Ojo con `descuento_cupos_usados`:** `calcularDescuento` exige
`cuposTotales > 0` **y** `cuposDisponibles > 0` para aplicar el descuento. Si el
contador de cupos usados alcanza al total, **el descuento se apaga solo** y el
precio salta al de lista en toda la página.

#### 1.c. Orden de la ficha de curso — 03/09/2026

**La promesa va antes que el precio.** El orden en celular es:

    hero + título → hook → "¿Para quién es?" → precio + CTA → todo lo demás

Medido en la ficha de hongos (375×812): hook en la pantalla 0,46; "para quién"
en 0,64; precio en 0,93; CTA de la sidebar en 1,48.

*   **El precio no se esconde**, pasa de la primera pantalla al arranque de la
    segunda. Antes la tarjeta caía justo debajo del título, así que a alguien que
    venía de un anuncio se le cotizaba antes de contarle qué se llevaba, y el
    `transformacion_hook` —el mejor texto del sitio— quedaba a ~1.000px, debajo
    del precio y del botón.
*   **"¿Qué vas a lograr?" queda DEBAJO del precio a propósito.** Es el detalle
    que justifica el número una vez que la persona ya decidió que le interesa, y
    ocupa demasiado alto como para meterlo antes (empujaría el precio a la
    tercera pantalla).
*   **La grilla usa `lg:col-start` / `lg:row-start`, no `order-*`.** El DOM ya
    está en el orden de celular; en `lg` la colocación explícita deja el
    escritorio igual que antes: intro y resto apilados en las dos columnas de la
    izquierda, y la tarjeta de precio en la columna 3 **abarcando las dos filas**,
    que es lo que la mantiene sticky a lo largo de toda la página. Si se toca
    esta grilla, verificar que el `row-span-2` siga ahí.
*   **Los enums nunca se imprimen crudos.** `categoria`, `modalidad` y `nivel`
    pasan por `lib/utils/courseLabels.ts`. Antes lo primero que se leía en toda
    ficha era "ninguno hibrido todos_los_niveles". Las etiquetas además venden:
    `basico` es "Desde cero", no "Básico". `categoria: 'ninguno'` (7 de 9 cursos)
    no renderiza nada. El mismo mapa se usa en las `keywords` del `<head>`.
*   **La foto de arriba no se estira.** En una pantalla grande, a todo el ancho y con
    alto fijo, quedaba en una franja de 8 a 1: borrosa y con las cabezas cortadas.
    Desde `2xl` tiene 1440px de ancho máximo, sobre la misma foto difuminada. En
    celular no cambió nada.

### 2. Portal de Usuario ("Mi Inscripción")
*   **Acceso:** Magic Link (`/mi-inscripcion/[token]`).
*   **Seguridad:** El `token` (32 chars hex) es la llave. No regenerar salvo pedido explícito.
*   **UX:** Cookie `ceuta_inscripciones` solo para el banner "Retomar inscripción".

### 3. Pagos y Verificación
*   **Transferencia:** Usuario paga → sube foto → admin verifica.
*   **Mercado Pago:** Preference API (`/api/mercadopago/preference`).
*   **dLocal:** Cursos Argentina (`/api/dlocal/*`).
*   **Estados reales de `inscriptos.estado`:**
    *   `contacto`: Solo paso 1.
    *   `pago_pendiente`: Eligió método, no subió comprobante.
    *   `pago_a_verificar`: Subió comprobante.
    *   `verificado`: Admin aprobó.
    *   `rechazado`: Admin rechazó.
    *   `cancelado`: Baja.
    *   Legacy (no usar en código nuevo): `pagado`, `confirmado`, `primer_contacto`, `segundo_contacto`.

### 4. Sistema de Emails
*   **Motor:** `emailService.ts` → intenta Resend; si Resend rechaza (modo prueba / sin dominio), cae a Gmail SMTP. GitHub Actions **no** envía mails a alumnos.
*   **De:** `EMAIL_FROM`. Sin dominio verificado en Resend, solo se puede mandar al mail de la cuenta Resend, desde `onboarding@resend.dev`.
*   **Secuencia:**
    1.  `confirmacion` (inmediato, 0h) en `/api/inscripcion/preinscripcion`.
    2.  `recordatorio_24h` (24h).
    3.  `urgencia_72h` (72h).
    4.  `ultima_oportunidad_7d` (7 días).
    5.  `recordatorio_14d` (14 días) — **desactivado hasta aprobar el texto**.
    6.  `ultimo_contacto_30d` (30 días) — **desactivado hasta aprobar el texto**.
        Es el último de la secuencia y el mail lo dice. **No hay día 60 a
        propósito** (dicho por Franco: "el de sesenta es un montón").
*   **⚠️ La inscripción cierra ~14 días DESPUÉS de que el curso empieza**
    (dicho por Franco, 2026-09-03). Los recordatorios se agendan por días desde
    el alta, sin mirar el calendario del curso, así que hace falta una compuerta:
    `inscripcionCerrada()` en el cron cancela cualquier recordatorio cuya fecha
    de envío caiga después de `fecha_inicio + 14 días`. Aplica a **toda** la
    secuencia, no solo a los dos nuevos. Sin esto, quien se pre-inscribe dos días
    antes del comienzo recibe el mail de 30 días cuando el curso arrancó hace un
    mes y ya no se puede anotar. Si el curso tiene `fecha_a_confirmar`, no se
    puede afirmar que cerró y el envío pasa.
*   **La regla de las 2 semanas NO se le escribe al cliente.** Es aproximada y de
    uso interno: ponerle fecha exacta en un mail la convierte en una promesa
    pública que CEUTA después tiene que honrar.
*   **Contradicción de tono pendiente:** `ultima_oportunidad_7d` dice "tu reserva
    expira hoy" y "liberaremos tu cupo". Si después llegan el de 14 y el de 30,
    esa amenaza queda desmentida. Hay un `UPDATE` sugerido, comentado, al pie de
    la migración `20260903120000`. No se aplicó solo: es texto que hoy le llega
    a clientes reales.
*   **Aperturas y clics:** `/api/webhooks/resend` marca `abierto_at` y
    `clicked_at` en `email_logs`, casando por `provider_message_id` (el id que
    devuelve Resend, que ahora se guarda al enviar). La firma de Svix se valida
    contra el **cuerpo crudo**, nunca contra el JSON reparseado. Requiere
    `RESEND_WEBHOOK_SECRET` y **el dominio verificado**: mientras se mande desde
    `onboarding@resend.dev` no llega ningún evento aunque el código esté
    desplegado. El tracking de **clics** reescribe los enlaces del mail para que
    pasen por un redirect de Resend — el enlace único deja de verse como una URL
    de CEUTA. Se puede activar solo aperturas; el handler funciona igual.
*   **Stop de recordatorios:** se cancelan al subir comprobante (`pago_a_verificar`) y en `verificado` / `rechazado` / `cancelado`. El cron también saltea esos estados.
*   **Cron:** Vercel llama `GET /api/cron/send-scheduled-emails` una vez por día (`0 12 * * *`) con `Authorization: Bearer CRON_SECRET`. En Hobby no hay cron horario. Un atraso de hasta ~24h en recordatorios es esperado y aceptable.
*   **GitHub Actions:** el workflow horario se desactivó. Nunca tuvo secretos `APP_URL`/`CRON_SECRET`, falló **2.264 veces** y GitHub maileaba cada fallo al dueño del repo. No reactivar el `schedule:` sin esos secretos.
*   **Vercel + SMTP:** no es el camino. Las funciones serverless cortan conexiones SMTP; Gmail además bloquea IPs de datacenter. Por eso Resend (HTTP) es el primario. Nunca disparar `sendEmail` en fire-and-forget: hay que `await` antes de responder.
*   **Prueba:** `/admin/email-templates` → "Enviar correo de prueba" (`POST /api/admin/email-test`).
*   **Guía operativa:** `como implementar/CONFIGURAR_EMAIL.md`.

### 5. Sincronización con Web Vieja ("Modo Hacker")
*   **Servicio:** `syncViejaWeb.ts` hace POST al formulario PHP de ceuta.org.uy en cada preinscripción.
*   **Config:** `cursos.url_web_vieja`. Si está vacío, no sincroniza.

**El punto delicado es qué curso se manda.** El curso viaja como `id_curso`, y ese id
no está en Supabase: vive escondido dentro del string `url_web_vieja` escrito a mano.
Orden de resolución, sin defaults:

1.  El `id_curso` que **declara el formulario de la propia página** (`idCursoDeclaradoEnHtml`).
    Es la fuente autoritativa: es el valor que mandaría un humano llenando ese form.
2.  Si la página no responde, el único segmento numérico del path (`extraerIdCursoViejo`).
3.  Si no hay ninguno de los dos, **no se sincroniza** y se loguea.

**NUNCA poner un id por defecto.** Hasta el 09/09/2026 el código hacía
`match(/\/calendario\/(\d+)\//)` con fallback `'200'`. Solar Fotovoltaica es el único
curso cuya URL lleva un segmento extra (`/cursos/calendario/anteriores/49/…`), no
matcheaba, y caía al default. **200 es Jardines ecológicos.** Cuatro personas que se
anotaron a Solar quedaron archivadas como Jardines en el panel viejo, y el bot de
WhatsApp — que lee ese panel — les escribió nombrando el curso equivocado. Una ya
había pagado. Un id inventado no falla: corrompe callado y alguien más abajo lo lee
como cierto. Que falte el registro se nota; que esté mal, no.

*   **Auditoría:** `node scripts/auditar-cursos-web-vieja.js` (o `npm run audit:web-vieja`)
    compara, para cada curso, el id del path contra el que declara la página. Solo lectura,
    sale con código 1 si algo mapea mal. **Correlo al agregar un curso o cambiar su
    `url_web_vieja`.**
*   **Regresión cubierta:** `web/src/__tests__/sync-vieja-web.test.ts`.

### 6. Sistema de Precios, Cuotas y Descuentos
*   **Motor:** `discountUtils.ts` (`calcularDescuento`, `formatearPrecio`, `calcularPrecioCuota`).
*   **Componente UI:** `PriceDisplay.tsx` unifica la visualización (cuotas, tachado, ahorro, cupos y fecha límite) de forma reactiva y determinista.
*   **Base de datos:** Columnas en `cursos` (`precio`, `cantidad_cuotas`, `descuento_porcentaje`, `descuento_cupos_totales`, `descuento_cupos_usados`, `descuento_etiqueta`, `descuento_fecha_fin`, etc.).
*   **Guía operativa maestra para promociones:** `docs/SISTEMA_PRECIOS_Y_DESCUENTOS.md`.
*   **Códigos de descuento (tabla `descuentos`):** el modal manda el código y el `curso_id` a `/api/validate-discount`, que llama a `validate_discount_code(p_code, p_curso_id)`. La función **siempre devuelve una fila**: si sirve lo dice `valid`. Hasta el 03/11/2026 la ruta llamaba con `p_codigo` y ningún código funcionó nunca.
    *   Al inscribirse, `/api/inscripcion` vuelve a validar y guarda el precio en `precio_pagado`; sin eso, Mi inscripción muestra el precio de lista.
    *   Un enlace con `?codigo=MONTE20` deja el código aplicado en el paso de pago.
    *   Un curso que se vende solo con código lleva `descuento_fecha_fin` y `descuento_porcentaje` vacío: la ficha muestra el vencimiento y el modal abre la caja del código.
    *   `fecha_fin` se compara contra la fecha en UTC: para cortar a las 23:59 de Uruguay, cargar el día siguiente (el código sigue valiendo hasta las 21:00 de ese día).

---

## 🛡️ Invariantes y Reglas de Oro (DO NOT BREAK)

1.  **Templates en DB:** NUNCA hardcodear el cuerpo de la secuencia de emails en TypeScript. Usar `processTemplate` con `email_templates`. Excepción: mails de sistema one-off (`comprobante_recibido`, test admin) pueden usar `generateEmailHtml`.
2.  **Validación de Precio:** El frontend es solo visual. El precio final SIEMPRE se recalcula/valida en backend.
3.  **Magic Links:** El `access_token` en `inscriptos` es sagrado. No regenerar a menos que se pida explícitamente.
4.  **Admin Client:** `createAdminClient()` (service role) SOLO en `/api/*` o Server Actions protegidas. NUNCA al cliente.
5.  **Storage:** Comprobantes → Cloudinary `ceuta/comprobantes`.
6.  **Imágenes de cursos:** Portadas/heroes → `ceuta/cursos/portadas` y `ceuta/cursos/heroes`. Galerías = array de URLs en `cursos.galeria`.
7.  **Email en Vercel:** `await` el envío. No fire-and-forget. Preferir Resend sobre SMTP.
8.  **Stop de nurturing:** si el estado deja de ser lead de pago pendiente, cancelar `scheduled_emails` pendientes.

---

## 📂 Mapa del Proyecto

```
/src
  /app
    /api                 -> Backend (Inscripción, Admin, Cron)
      /cron/send-scheduled-emails
      /admin/email-test  -> GET estado del proveedor, POST prueba
    /admin               -> Panel de Control (Protected)
    /mi-inscripcion      -> Portal Usuario (Magic Link)
    /cursos/[slug]       -> Página pública de cada curso
  /components
    /cursos/EnrollmentModal.tsx  -> 🔴 Wizard 3 pasos (instancia ÚNICA, la monta el provider)
    /cursos/CourseEnrollContext.tsx -> 🔴 Provider: modal único + precio único + barra fija
    /cursos/courseEnrollStore.ts -> Contexto y tipos (aparte, para cortar el ciclo de imports)
    /cursos/CourseStickyCta.tsx  -> Barra de inscripción fija al pie
    /cursos/InlineEnrollCta.tsx  -> CTA repetido dentro del contenido
    /cursos/CompleteProfileForm.tsx
  /lib
    /services/emailService.ts    -> Envíos (Resend / SMTP)
    /services/emailTransport.ts  -> Resolución del proveedor
    /services/syncViejaWeb.ts
    /utils/templateProcessor.ts
    /utils/tokens.ts
/supabase
  /migrations
```

---

## 🚦 Estado Actual (Agosto 2026)
*   Deploy en **Vercel Hobby**. Supabase y Resend también en plan gratuito.
*   Email: código listo para Resend. **Requiere** `RESEND_API_KEY` (+ dominio verificado para mandar a alumnos) en Vercel. Ver `como implementar/CONFIGURAR_EMAIL.md`.
*   Cron de recordatorios: **Vercel diario**. GitHub Actions horario desactivado (era la fuente de miles de mails de error).
*   Subida de archivos: **Cloudinary**.
*   Pagos: Mercado Pago + dLocal (AR) + transferencia.
*   Sincronización con web vieja (ceuta.org.uy) implementada.

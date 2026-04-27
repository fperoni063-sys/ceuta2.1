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
*   **Base de Datos & Auth:** Supabase (PostgreSQL).
*   **Storage:** Cloudinary (para comprobantes e imágenes).
*   **Emails:** Nodemailer (SMTP Gmail) + Cron Jobs (GitHub Actions).
*   **Deploy:** Vercel.

**Diagrama de Arquitectura:**
```mermaid
graph TB
    User[👤 Usuario] --> Next[⚡ Next.js Server]
    User --> Cloud[☁️ Cloudinary]
    Next --> DB[(🔥 Supabase)]
    Next --> SMTP[📧 Nodemailer]
    Cron[⏰ GitHub Actions] --> Next
    User -.-> Cookie[🍪 Cookie Local]
    DB --> Auth[🔐 Supabase Auth (Admins)]
```

---

## 💾 Base de Datos (14 Tablas)

El modelo de datos es relacional y centralizado en Supabase.

| Tabla | Descripción Crítica | Detalles Importantes |
|-------|---------------------|----------------------|
| `cursos` | Catálogo educativo | Precios, fechas, descuentos por cupo, galería de imágenes, video_url, sincronización con web vieja (url_web_vieja). |
| `inscriptos` | Usuarios (Leads/Alumnos) | Centraliza todo. Campos clave: `access_token` (magic link login), `estado`, `comprobante_url`, `monto_pago` (precio congelado al inscribirse). |
| `docentes` | Equipo docente | Información pública de profesores. FK desde `cursos.docente_id`. |
| `programa_clases` | Temario de cada curso | Clases numeradas con tipo (teórico/práctico) y flags de presencial/virtual. FK a `cursos`. |
| `faqs_cursos` | Preguntas frecuentes | FAQ por curso o globales (curso_id NULL = aparece en todos). FK a `cursos`. |
| `descuentos` | Códigos promocionales | Validación manual por código. Relación N:N conceptual con cursos. |
| `email_templates` | Plantillas HTML/Texto | DEFINEN el contenido de los correos. No hardcodear textos, usar esto. |
| `scheduled_emails` | Cola de envío | Emails programados (24h, 72h, 7d). Estado `pending` -> `sent`/`cancelled`. |
| `email_logs` | Historial de envíos | Auditoría de comunicaciones. FK a `inscriptos`. |
| `testimonios` | Testimonios de alumnos | Nombre, texto, foto. Se muestran en landing. |
| `configuracion` | Config del sistema | Pares clave/valor (email contacto, datos bancarios, etc.). |
| `analytics_events` | Tracking de visitas | Eventos con session_id, page_path, UTMs, referrer. |
| `embeddings_cursos` | Embeddings vectoriales | Para búsqueda semántica / IA. FK a `cursos`. |
| `historial_chats` | Historial de chats | Mensajes entrantes/salientes por teléfono (para bot WhatsApp). |

**Nota:** Los comprobantes de pago se guardan como URL en la columna `comprobante_url` de la tabla `inscriptos` (no existe una tabla separada de comprobantes).

---

## 🔄 Flujos Críticos de Negocio

### 1. Inscripción (Wizard de 3 Pasos + Perfil Post-Pago)
El componente `EnrollmentModal.tsx` es el corazón de la conversión.
1.  **Paso 1 (Contacto):** Pide Nombre/Email/Tel. Crea registro en DB (`estado: 'pago_pendiente'`). Genera `access_token`.
2.  **Paso 2 (Pago):** Elegir tipo de pago (Total/Cuota o Seña $500). Elegir método (Transferencia/MercadoPago/Efectivo). Código de descuento opcional.
3.  **Paso 3 (Confirmación):** Muestra instrucciones de pago según método elegido. Habilita subida de comprobante.
4.  **Post-Upload (Perfil):** Después de subir el comprobante, se muestra `CompleteProfileForm` pidiendo datos personales (Cédula, Edad, Departamento, Dirección, Cómo se enteró).

### 2. Portal de Usuario ("Mi Inscripción")
*   **Acceso:** Vía Magic Link (`/mi-inscripcion/[token]`).
*   **Seguridad:** El `token` (32 chars hex) es la llave. Expiración configurable (default 8-30 días).
*   **UX:** Uso de cookie `ceuta_inscripciones` solo para mostrar banner "Retomar inscripción".
*   **Funcionalidad:** Ver estado actual, subir comprobante si falta, y completar perfil si no lo hizo.

### 3. Pagos y Verificación (Manual)
*   **Mercado Pago:** ⚠️ **Link Estático Genérico**. NO hay integración de API/Webhooks.
*   **Flujo:** Usuario paga -> Usuario sube foto -> Admin verifica manualmente.
*   **Estados de Pago:**
    *   `pago_pendiente`: Inscripto, pero no subió nada.
    *   `pago_a_verificar`: Subió comprobante, admin debe revisar.
    *   `verificado`: Admin aprobó (envía email confirmación final).
    *   `rechazado`: Admin rechazó (envía email con motivo).

### 4. Sistema de Emails Automatizados
*   **Motor:** `emailService.ts` + `scheduler` en DB + Cron (GitHub Actions).
*   **Secuencia Típica:**
    1.  `confirmacion` (Inmediato - 0h): "Recibimos tu solicitud".
    2.  `recordatorio_24h` (24h después): "No olvides completar tu pago".
    3.  `urgencia_72h` (72h después): Testimonios y urgencia.
    4.  `ultima_oportunidad_7d` (7 días): Aviso final.
*   **Stop Condition:** Si `estado` cambia a `verificado` o `pagado`, se cancelan los emails pendientes.

### 5. Sincronización con Web Vieja ("Modo Hacker")
*   **Servicio:** `syncViejaWeb.ts` realiza un POST automático al formulario PHP de la web vieja (ceuta.org.uy) cada vez que hay una nueva preinscripción.
*   **Configuración:** El campo `url_web_vieja` en la tabla `cursos` almacena la URL del formulario del curso en la web vieja. Si no está configurado, no se sincroniza.

---

## 🛡️ Invariantes y Reglas de Oro (DO NOT BREAK)

1.  **Templates en DB:** NUNCA hardcodear el cuerpo de los emails en TypeScript. Usar `processTemplate` con `email_templates`.
2.  **Validación de Precio:** El frontend es solo visual. El precio final SIEMPRE se recalcula/valida en backend (`/api/admin` o `/api/inscripcion`) antes de confirmar.
3.  **Magic Links:** El `access_token` en `inscriptos` es sagrado. No regenerar a menos que sea solicitado explícitamente (riesgo de invalidar links enviados).
4.  **Admin Client:** Usar `createAdminClient()` (service role) SOLO en rutas de API seguras (`/api/*`) o Server Actions protegidas. NUNCA enviar al cliente.
5.  **Storage:** Los comprobantes van a Cloudinary carpeta `ceuta/comprobantes`.
6.  **Imágenes de cursos:** Portadas e imágenes hero van a Cloudinary `ceuta/cursos/portadas` y `ceuta/cursos/heroes`. Las galerías se almacenan como array de URLs en el campo `galeria` de `cursos`.

---

## 📂 Mapa del Proyecto

```
/src
  /app
    /api                 -> Backend Lógica (Inscripción, Admin, Cron)
    /admin               -> Panel de Control (Protected)
    /mi-inscripcion      -> Portal Usuario (Magic Link)
    /cursos/[slug]       -> Página pública de cada curso
  /components
    /cursos/EnrollmentModal.tsx  -> 🔴 Componente Crítico (Wizard 3 pasos)
    /cursos/CompleteProfileForm.tsx -> Datos personales post-pago
    /cursos/ImageCarousel.tsx    -> Galería de imágenes con efecto ambient
    /admin/ReviewPaymentModal.tsx -> Verificación de Pagos
  /lib
    /services/emailService.ts    -> Lógica de envíos
    /services/syncViejaWeb.ts    -> Sincronización web vieja
    /utils/discountUtils.ts      -> Cálculo de precios y descuentos
    /utils/priceLogic.ts         -> Lógica centralizada de precios
    /utils/tokens.ts             -> Generación de Magic Links
  /types
    /db.ts                       -> Tipos de la base de datos
    /admin.ts                    -> Tipos del panel admin
/supabase
  /migrations            -> Historial de cambios en DB
```

---

## 🚦 Estado Actual (Abril 2026)
*   Integración de **Mercado Pago es pasiva** (link estático).
*   Sistema de recordatorios automáticos **activo** vía Cron.
*   Subida de archivos migrada a **Cloudinary**.
*   Email Service migrado a **Nodemailer**.
*   Galería de imágenes y video implementados.
*   Sincronización con web vieja (ceuta.org.uy) implementada.
*   Deploy en **Vercel**.

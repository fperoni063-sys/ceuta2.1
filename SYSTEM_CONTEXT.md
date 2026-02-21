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

## 💾 Base de Datos (13 Tablas Principales)

El modelo de datos es relacional y centralizado en Supabase.

| Tabla | Descripción Crítica | Detalles Importantes |
|-------|---------------------|----------------------|
| `cursos` | Catálogo educativo | Maneja precios, fechas y config de descuentos por cupo/online. |
| `inscriptos` | Usuarios (Leads/Alumnos) | Centraliza todo. Campos clave: `access_token` (login), `estado`, `comprobante_url`. |
| `descuentos` | Códigos promocionales | Validación manual por código. Relación N:N conceptual con cursos. |
| `email_templates` | Plantillas HTML/Texto | DEFINEN el contenido de los correos. No hardcodear textos, usar esto. |
| `scheduled_emails` | Cola de envío | Emails programados (24h, 72h, 7d). Estado `pending` -> `sent`/`cancelled`. |
| `email_logs` | Historial de envíos | Auditoría de comunicaciones. |
| `docentes` | Equipo docente | Información pública de profesores. |
| `comprobantes` | (Ver `inscriptos`) | *Nota: Los comprobantes se guardan en la columna `comprobante_url` de `inscriptos`.* |

---

## 🔄 Flujos Críticos de Negocio

### 1. Inscripción (Wizard de 4 Pasos)
El componente `EnrollmentModal.tsx` es el corazón de la conversión.
1.  **Paso 1 (Contacto):** Pide Nombre/Email/Tel. Crea registro en DB (`estado: 'contacto'`). Genera `access_token`.
2.  **Paso 2 (Datos):** Pide Cédula, Depto, etc. Update registro.
3.  **Paso 3 (Pago):** Elige Método (Transf/MP/Efectivo) + Código Descuento. Define precio final.
4.  **Paso 4 (Confirmación):** Muestra instrucciones. Habilita subida de comprobante.

### 2. Portal de Usuario ("Mi Inscripción")
*   **Acceso:** Vía Magic Link (`/mi-inscripcion/[token]`).
*   **Seguridad:** El `token` (32 chars hex) es la llave. Expiración configurable (default 8-30 días).
*   **UX:** Uso de cookie `ceuta_inscripciones` solo para mostrar banner "Retomar inscripción".
*   **Funcionalidad:** Ver estado actual y subir comprobante si falta.

### 3. Pagos y Verificación (Manual)
*   **Mercado Pago:** ⚠️ **Link Estático Generico**. NO hay integración de API/Webhooks.
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

---

## 🛡️ Invariantes y Reglas de Oro (DO NOT BREAK)

1.  **Templates en DB:** NUNCA hardcodear el cuerpo de los emails en TypeScript. Usar `processTemplate` con `email_templates`.
2.  **Validación de Precio:** El frontend es solo visual. El precio final SIEMPRE se recalcula/valida en backend (`/api/admin` o `/api/inscripcion`) antes de confirmar.
3.  **Magic Links:** El `access_token` en `inscriptos` es sagrado. No regenerar a menos que sea solicitado explícitamente (riesgo de invalidar links enviados).
4.  **Admin Client:** Usar `createAdminClient()` (service role) SOLO en rutas de API seguras (`/api/*`) o Server Actions protegidas. NUNCA enviar al cliente.
5.  **Storage:** Los comprobantes van a Cloudinary carpeta `ceuta/comprobantes`.

---

## 📂 Mapa del Proyecto

```
/src
  /app
    /api                 -> Backend Lógica (Inscripción, Admin, Cron)
    /admin               -> Panel de Control (Protected)
    /mi-inscripcion      -> Portal Usuario (Magic Link)
  /components
    /cursos/EnrollmentModal.tsx -> 🔴 Componente Crítico (Wizard)
    /admin/ReviewPaymentModal.tsx -> Verificación de Pagos
  /lib
    /services/emailService.ts  -> Lógica de envíos
    /utils/discountUtils.ts    -> Cálculo de precios
    /utils/tokens.ts           -> Generación de Magic Links
  /supabase
    /migrations          -> Historial de cambios en DB
```

---

## 🚦 Estado Actual (Enero 2026)
*   Integración de **Mercado Pago es pasiva** (link estático).
*   Sistema de recordatorios automáticos **activo** vía Cron.
*   Subida de archivos migrada a **Cloudinary**.
*   Email Service migrado a **Nodemailer**.

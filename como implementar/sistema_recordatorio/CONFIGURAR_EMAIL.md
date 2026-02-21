# Configuración de Emails - Sistema de Recordatorio

## Estado Actual

✅ **Funcionando sin configuración:**
- Generación de tokens (link mágico)
- Página personal `/mi-inscripcion/[token]`
- Banner de reconocimiento (cookies)
- Editor de templates `/admin/email-templates`
- Programación de emails en base de datos

❌ **Requiere configuración:**
- Envío real de emails

---

## Configurar Envío de Emails

### Paso 1: Crear App Password en Gmail

1. Ir a https://myaccount.google.com/security
2. Activar **Verificación en 2 pasos** (si no está activa)
3. Ir a https://myaccount.google.com/apppasswords
4. Seleccionar "Correo" y "Computadora Windows"
5. Click en **Generar**
6. Copiar la contraseña de 16 caracteres (ej: `abcd efgh ijkl mnop`)

### Paso 2: Agregar a .env.local

Abrir `web/.env.local` y agregar:

```bash
# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=secretaria@ceuta.org.uy
SMTP_PASSWORD=abcd-efgh-ijkl-mnop
```

> ⚠️ Reemplazar `SMTP_PASSWORD` con tu App Password real (sin espacios).

### Paso 3: Reiniciar el servidor

```bash
# Ctrl+C para parar
npm run dev
```

---

## Configurar para Producción (Vercel)

En Vercel Dashboard → Settings → Environment Variables:

| Variable | Valor |
|----------|-------|
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 587 |
| SMTP_USER | secretaria@ceuta.org.uy |
| SMTP_PASSWORD | (tu App Password) |
| CRON_SECRET | (un secreto aleatorio largo) |

---

## Verificar que funciona

1. Hacer una preinscripción de prueba
2. Revisar en Supabase → tabla `email_logs`
3. Si el email llegó, `estado` será `sent`
4. Si falló, revisar `error_mensaje`

---

## Troubleshooting

**"SMTP not configured"**
→ Falta `SMTP_USER` o `SMTP_PASSWORD` en `.env.local`

**"Invalid login"**
→ Usaste la contraseña normal en vez del App Password

**"Less secure apps blocked"**
→ Necesitás usar App Password (no funciona con contraseña normal)

**Los emails no llegan pero no hay error**
→ Revisar carpeta spam

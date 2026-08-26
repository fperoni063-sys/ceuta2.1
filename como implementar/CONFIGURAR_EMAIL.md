# Configuración de Emails — CEUTA

Los correos de la web (confirmación de preinscripción, recordatorios, contacto, comprobante, pago aprobado/rechazado) salen desde **Vercel** usando **Resend** (HTTP). Gmail SMTP queda solo como fallback local.

No hace falta Java. No hace falta un cron de GitHub.

---

## 0. Cortar YA los correos de error de GitHub

El workflow `Trigger Cron Job` corría **cada hora** y fallaba siempre porque nunca se cargaron los secretos `APP_URL` y `CRON_SECRET` en GitHub. GitHub te mandaba un mail de "workflow failed" en cada corrida (~2.200+).

**Hacé esto ahora (tarda 20 segundos, no requiere deploy):**

1. Entrá a [Actions → Trigger Cron Job](https://github.com/fperoni063-sys/ceuta2.1/actions/workflows/cron.yml).
2. Arriba a la derecha: el botón `…` → **Disable workflow**.

Cuando se pushee el repo, el `schedule:` ya no está en el YAML. El disparo diario lo hace Vercel (`web/vercel.json`).

---

## 1. Crear cuenta Resend (gratis)

Plan gratuito: 100 mails/día, 3.000/mes. Alcanza para CEUTA.

1. Registrate en [https://resend.com/signup](https://resend.com/signup).
2. Andá a **API Keys** → **Create API Key** (permiso Sending access).
3. Copiá la clave (`re_…`).

### Dominio (para que salga de @ceuta.org.uy)

Sin dominio verificado, Resend solo deja mandar **a tu propio email** de la cuenta, desde `onboarding@resend.dev`.

1. En Resend → **Domains** → Add `ceuta.org.uy` (o un subdominio `mail.ceuta.org.uy`).
2. Cargá los registros DNS que te muestra (DKIM / SPF).
3. Esperá a que pase a **Verified**.
4. En Vercel usá:

```
EMAIL_FROM=CEUTA <secretaria@ceuta.org.uy>
```

(el remitente tiene que ser una casilla del dominio verificado)

---

## 2. Variables en Vercel

Vercel → proyecto → **Settings → Environment Variables** (Production + Preview):

| Variable | Valor | Obligatorio |
|----------|--------|-------------|
| `RESEND_API_KEY` | `re_…` | Sí |
| `EMAIL_FROM` | `CEUTA <secretaria@ceuta.org.uy>` | Sí, después de verificar dominio |
| `CRON_SECRET` | string largo aleatorio | Sí (Vercel lo manda al cron diario) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, sin `/` al final | Sí (links mágicos de los mails) |

Opcional, solo fallback local / si Resend no está:

| Variable | Valor |
|----------|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | casilla Gmail |
| `SMTP_PASSWORD` | App Password de 16 caracteres (también se acepta `SMTP_PASS`) |

Después de guardar, **Redeploy** el proyecto.

---

## 3. Probar

1. Entrá a `/admin/email-templates`.
2. Arriba debería decir **listo (resend · …)**.
3. Mandá un correo de prueba a tu casilla.
4. Una preinscripción de prueba tiene que llegar al alumno y dejar fila `sent` en `email_logs` (Supabase).

---

## Troubleshooting

**"Email no configurado"**
→ Falta `RESEND_API_KEY` en Vercel, o no se hizo Redeploy.

**El test llega a vos pero no a un alumno**
→ El dominio no está verificado. Completá el paso 1 (Domains).

**Recordatorios no salen**
→ El cron de Vercel Hobby corre **una vez por día** (`0 12 * * *`). Es suficiente para 24h / 72h / 7d. Revisá que `CRON_SECRET` exista en Vercel.

**Siguen llegando mails de GitHub "workflow failed"**
→ El workflow todavía está habilitado. Disable workflow (paso 0). El cambio de código corta el `schedule:` recién cuando se pushea a `main`.

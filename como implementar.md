# Cron de emails: ya no usa GitHub Actions

El workflow horario `Trigger Cron Job` se **desactivó**. Nunca tuvo los secretos `APP_URL` / `CRON_SECRET` en GitHub, falló en todas las corridas (~2.264) y GitHub mandaba un mail de error cada hora.

Los recordatorios los dispara **Vercel Cron** (plan Hobby: una vez por día):

```json
"/api/cron/send-scheduled-emails"  →  0 12 * * *
```

Ver `web/vercel.json` y `como implementar/CONFIGURAR_EMAIL.md`.

Si el workflow sigue mandando mails, desactivalo a mano:

https://github.com/fperoni063-sys/ceuta2.1/actions/workflows/cron.yml → `…` → **Disable workflow**.

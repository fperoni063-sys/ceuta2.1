# Guía de Verificación: Cron Job GitHub Actions

Esta guía te ayudará a configurar los secretos necesarios y probar que el Cron Job funcione correctamente.

## 1. Configurar Secretos en GitHub

Para que el cron job funcione, GitHub necesita conocer la URL de tu aplicación y la clave secreta.

1.  Ve a tu repositorio en GitHub.
2.  Haz clic en la pestaña **Settings** (Configuración).
3.  En el menú lateral izquierdo, ve a **Secrets and variables** -> **Actions**.
4.  Haz clic en el botón verde **New repository secret**.
5.  Agrega los siguientes secretos:

| Nombre | Valor (Ejemplo) | Descripción |
| :--- | :--- | :--- |
| `APP_URL` | `https://ceuta-web.vercel.app` | La URL raíz de tu sitio web (sin barra al final). |
| `CRON_SECRET` | `(Tu clave secreta)` | Debe coincidir con `CRON_SECRET` en tu Vercel `.env`. |

> [!IMPORTANT]
> Asegúrate de que `APP_URL` **no** tenga una barra `/` al final.
> Correcto: `https://mi-sitio.com`
> Incorrecto: `https://mi-sitio.com/`

## 2. Ejecutar el Workflow Manualmente

Una vez configurados los secretos, puedes probar si funciona sin esperar una hora.

1.  Ve a la pestaña **Actions** en tu repositorio.
2.  En la lista de la izquierda, selecciona **Trigger Cron Job**.
3.  A la derecha, verás un botón **Run workflow**. Púlsalo.
4.  Espera unos segundos y recarga la página para ver la ejecución.

### Resultados Esperados
- **✅ Éxito:** El paso "Call Cron Endpoint" debe mostrar un código de estado `200` y el mensaje "Success".
- **❌ Error Controlado:** Si faltan secretos, ahora el paso "Check Secrets" fallará rápidamente con un mensaje claro diciéndote cuál secreto falta, en lugar del error críptico de `curl`.

---

## 3. Validación Final
Si ves el tick verde ✅ en la ejecución del Action, ¡felicidades! El sistema de correos programados está reparado y seguro .

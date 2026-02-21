# Guía de Configuración de Email (Formulario de Contacto)

Para que el formulario de contacto envíe correos reales, necesitás configurar un servicio SMTP (como Gmail).

## 1. Conseguir la "Contraseña de Aplicación" (Gmail)

Google no te deja usar tu contraseña normal por seguridad. Tenés que crear una especial:

1.  Entrá a tu cuenta de Google: [https://myaccount.google.com/](https://myaccount.google.com/)
2.  Andá a **Seguridad** (o Security).
3.  Buscá la sección "Cómo inicias sesión en Google".
4.  Activá la **Verificación en 2 pasos** (si no la tenés activa).
5.  Una vez activa, buscá la opción **Contraseñas de aplicaciones** (o App Passwords). podes buscarla en el buscador de arriba.
6.  Creá una nueva:
    *   **App**: "Correo" (u "Otra" y poné "Web CEUTA").
    *   **Dispositivo**: "Otra" (o lo que quieras).
7.  Te va a dar una contraseña de 16 letras (ej: `abcd efgh ijkl mnop`). **COPIALA**.

## 2. Configurar el Proyecto

1.  Abrí el archivo `.env` que está en la carpeta `web` del proyecto.
2.  Agregá (o modificá) estas líneas al final:

```env
# Configuración de Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=pegá_acá_la_contraseña_de_16_letras
```

*Donde dice `tu_email@gmail.com` poné tu dirección real.*

## 3. Configurar el Destinatario (Admin)

1.  Entrá al panel de administración de la web (`/admin`).
2.  Andá a **Configuración**.
3.  Buscá el campo **"Email de Contacto"**.
4.  Escribí la dirección de correo a la que querés que lleguen los mensajes de la gente (ej: `secretaria@ceuta.org.uy`).
5.  Guardá los cambios.

---

### ¡Listo!
Ahora, cuando alguien llene el formulario en `/contacto`, el sistema usará tu Gmail (configurado en el paso 2) para enviar el correo a la dirección de secretaría (configurada en el paso 3).

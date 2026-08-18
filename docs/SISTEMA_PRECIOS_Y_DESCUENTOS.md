# Arquitectura y Funcionamiento del Sistema de Precios, Descuentos y Pagos - CEUTA 2.1

Este documento detalla en profundidad cómo opera el cálculo de costos, promociones, cuotas, monedas y visualización en todo el proyecto CEUTA (frontend, backend, base de datos Supabase y pasarelas de pago).

---

## 1. Esquema de Base de Datos (Supabase Postgres)

### Tabla `cursos`
Cada curso contiene la configuración económica base y promocional:
* **`precio` (NUMERIC)**: Precio base del curso en moneda correspondiente (`UYU` por defecto, o `ARS` si `es_curso_argentina = true`).
* **`cantidad_cuotas` (INTEGER, default 1)**: Número de cuotas para el pago diferido manual (ej: 3 cuotas).
* **`permite_online` (BOOLEAN, default false)**: Habilita la selección de modalidad 100% virtual en cursos híbridos.
* **`precio_online` (NUMERIC, nullable)**: Precio diferenciado para cursada virtual alternativa.
* **`descuento_porcentaje` (INTEGER, nullable)**: Porcentaje de descuento general (ej. 30, 50).
* **`descuento_cupos_totales` (INTEGER, nullable)**: Cupos máximos asignados a la promoción.
* **`descuento_cupos_usados` (INTEGER, default 0)**: Cantidad de cupos con descuento consumidos.
* **`descuento_etiqueta` (TEXT, nullable)**: Texto del badge promocional (ej. `"50% OFF - Hasta 17 de Agosto"`).
* **`descuento_fecha_fin` (TIMESTAMPTZ, nullable)**: Fecha límite de vigencia de la oferta.
* **`descuento_online_porcentaje` (INTEGER, nullable)**: Porcentaje de descuento exclusivo modalidad online.
* **`descuento_online_etiqueta` (TEXT, nullable)**: Etiqueta del descuento online.
* **`es_curso_argentina` (BOOLEAN, default false)**: Bandera que conmuta la moneda a Pesos Argentinos (`ARS`) y fuerza el flujo dLocal.
* **`dlocal_habilitado` (BOOLEAN, default false)**: Activa pasarela dLocal Go (tarjetas internacionales / Argentina).
* **`es_inscripcion_anticipada` (BOOLEAN, default false)**: Muestra badge de inscripción temprana.

### Tabla `descuentos` (Códigos de Cupón)
Maneja cupones promocionales ingresados por los usuarios en el checkout:
* **`codigo` (VARCHAR UNIQUE)**: Código en mayúsculas (ej. `CEUTA2024`).
* **`nombre` (VARCHAR)**: Descripción interna de la campaña.
* **`tipo` (VARCHAR)**: `'porcentaje'` o `'monto'`.
* **`valor` (NUMERIC)**: Valor numérico (ej. 20 para 20% o 1000 para $1.000 de rebaja).
* **`cursos_aplica` (ARRAY de INT, nullable)**: IDs de cursos habilitados (o NULL si es global).
* **`fecha_inicio` y `fecha_fin` (DATE)**: Ventana temporal de validez.
* **`usos_maximos` y `usos_actuales` (INT)**: Límite de canjes.
* **`activo` (BOOLEAN)**: Interruptor de activación.

### Triggers y Funciones de Base de Datos
1. **`validate_discount_code(p_code, p_curso_id)`**: Valida vigencia, stock de usos y restricción por curso en Postgres.
2. **`increment_discount_usage(p_code)`**: Incrementa el contador `usos_actuales` al procesar un cupón.
3. **`auto_update_descuento_fecha_fin`**: Trigger `BEFORE INSERT OR UPDATE` en `cursos` que ajusta `descuento_fecha_fin` automáticamente a las 23:59:59 del día de inicio del curso cuando aplica.

---

## 2. Reglas de Negocio y Lógica de Cálculo (`priceLogic.ts` y `discountUtils.ts`)

### A. Condiciones para que un Descuento esté Activo
Un descuento se considera vigente (`tieneDescuento = true`) únicamente si se cumplen **todas** estas condiciones:
1. `descuento_porcentaje > 0` y no es nulo.
2. `descuento_cupos_totales > 0` y no es nulo.
3. **Cupos disponibles** (`cuposTotales - cuposUsados`) > 0.
4. **No expirado**: Si existe `descuento_fecha_fin`, la fecha/hora actual debe ser menor o igual a las `23:59:59.999` del día especificado en la fecha de corte.

### B. Fórmula de Precio y Ahorro
```typescript
const cuposDisponibles = cuposTotales !== null ? Math.max(0, cuposTotales - cuposUsados) : null;
const porcentajeEfectivo = tieneDescuento ? (descuentoPorcentaje ?? 0) : 0;
const ahorro = Math.round(precioOriginal * porcentajeEfectivo / 100);
const precioFinal = tieneDescuento ? precioOriginal - ahorro : precioOriginal;
```

### C. Cálculo de Cuotas (`formatearCuotas`, `calcularPrecioCuota`)
* Si `cantidad_cuotas > 1`, se divide el `precioFinal` entre la cantidad de cuotas redondeando hacia arriba con `Math.ceil()` o `Math.round()`.
* **Fórmula**: `precioCuota = Math.round(precioFinal / cantidadCuotas)`.
* En la UI se muestra el valor de la **cuota individual** como foco principal (ej. *3 cuotas de $2.100*) y el total del curso en tipografía secundaria (*Total: $6.300*).

### D. Modalidad Híbrida vs 100% Online
Si el curso es `hibrido` y `permite_online = true`:
* El usuario dispone de un selector en el Sidebar de la página de detalle.
* Si selecciona **Híbrido**: Se toma `precio`, `descuento_porcentaje` y `descuento_etiqueta`.
* Si selecciona **100% Online**: Se toma `precio_online` (o fallback a `precio`), `descuento_online_porcentaje` y `descuento_online_etiqueta`.

---

## 3. Estado Actual de Cursos y Descuentos en la Base de Datos

| ID | Curso | Modalidad | Precio Base | Cuotas | Descuento | Precio Final | Valor Cuota | Estado Oferta | Vencimiento Descuento |
|---|---|---|---|---|---|---|---|---|---|
| **80** | **Huerta orgánica full** | Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **81** | **Construcción Natural: Biopiscinas** | Híbrido ($2.500 online) | $5.000 UYU | 1 | **40% OFF** (10 cupos) | **$3.000 UYU** | **1x $3.000** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **90** | **Energía Solar Fotovoltaica Full** | Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **93** | **Reconocimiento Plantas Medicinales** | Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **95** | **Cosmética Natural: Crea tus Productos**| Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **96** | **Construcción Natural Semipresencial** | Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **97** | **Jardines Ecológicos Full** | Híbrido | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **99** | **Bosques Comestibles: Diseño y Abundancia**| Híbrido | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **100**| **Cultivo de Cannabis Orgánico** | Híbrido (Online opc.) | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **102**| **Producción de Hongos Comestibles** | Híbrido | $12.600 UYU | 3 | **40% OFF** (10 cupos) | **$7.560 UYU** | **3x $2.520** | ✅ **VIGENTE** | 01/09/2026 23:59 |
| **106**| **Cosmética Natural Argentina** | 100% Virtual | AR$ 440.000 | 3 | - | - | - | ❌ **INACTIVO** (Desactivado) | - |

---

## 4. Visualización en la Web (Componente por Componente)

### 1. `CourseCard.tsx` (Cards de Listado y Home)
* **Badges de Imagen**:
  * `DiscountBadge`: Badge verde degradado arriba a la izquierda (`50% OFF` o etiqueta personalizada).
  * `Anticipada`: Si `es_inscripcion_anticipada = true`.
  * `Modalidad`: Si es 100% Online o 100% Presencial (los híbridos omiten el badge para mantener limpieza visual).
* **Footer de Precios**:
  * Utiliza `PriceDisplay` con variante `"card"`.
  * Muestra el precio original tachado en gris si hay descuento activo.
  * Si tiene cuotas: Icono chispa `✨`, texto *"3 cuotas de"*, precio en verde negrita `$2.100`, y al lado `(Total: $6.300)`.
  * Urgencia: Si faltan menos de 6 cupos, muestra *"Últimos X cupos disponibles"*. Si tiene fecha límite, muestra badge *"Oferta válida hasta el DD de Mes"*.

### 2. `CourseSidebarClient.tsx` (Barra Lateral en `/cursos/[slug]`)
* **Selector Híbrido / 100% Online**: Conmuta reactivamente los precios y descuentos.
* **PriceDisplay (variante sidebar)**:
  * Contenedor redondeado destacado con gradiente verde claro.
  * Muestra el desglose de cuotas y el total.
  * Ahorro: *"Ahorrás $6.300"*.
* **`CountdownTimer.tsx`**: Temporizador sutil de cuenta regresiva cuando hay `descuento_fecha_fin`.
* **Botones CTA**:
  * *"Reservar mi cupo - Gratis"* (Abre el modal de inscripción en 3 pasos).
  * *"Consultar por WhatsApp"* (Enlace directo con mensaje pre-armado).

### 3. `EnrollmentModal.tsx` (Embudo de Inscripción y Checkout)
* **Paso 1 (Contacto / Micro-compromiso)**:
  * Nombre, Email, Teléfono.
  * Al hacer clic en *"Reservar mi cupo - Gratis"*, se crea o recupera la preinscripción (`inscriptos` con estado `contacto`), se genera `access_token` único, se setea cookie para persistencia y se envía el email de confirmación inmediatamente.
* **Paso 2 (Método de Pago y Cuotas)**:
  * Selector **Total / Cuota** vs **Seña ($500 UYU)**.
  * Muestra precio con descuento aplicado y temporizador de oferta.
  * Métodos de pago disponibles:
    1. **Transferencia Bancaria** (BROU / Santander).
    2. **Mercado Pago** (Smart Bridge UI con botón de copiar monto exacto y enlace directo a checkout).
    3. **Efectivo** (Abitab / Red Pagos con instrucciones y cuenta).
    4. **dLocal Go** (Para tarjetas internacionales o Argentina).
  * Campo colapsable: *"¿Tenés código de descuento?"* para validar cupones de la tabla `descuentos`.
* **Paso 3 (Instrucciones y Comprobante)**:
  * Muestra datos bancarios o pasarela según el método elegido.
  * Botón para subir comprobante de pago (`UploadComprobante.tsx`), pasando el estado a `pago_a_verificar`.
  * Formulario para completar datos adicionales de perfil (Cédula, Dirección, Departamento, etc.).

### 4. `MiInscripcionClient.tsx` (Página Personal `/mi-inscripcion/[token]`)
* Los alumnos que abandonaron o quieren pagar más tarde ingresan con su token seguro.
* **Lógica de Precio Congelado (`priceLogic.ts`)**:
  * Si el alumno ya pagó (`precio_pagado`), se respeta exactamente el monto abonado.
  * Si el pago sigue pendiente, el sistema evalúa dinámicamente el estado del descuento del curso al momento de la visita.

---

## 5. Panel Administrativo (`/admin/cursos/[id]`)

El administrador puede configurar:
1. **Precio Base y Cuotas**: Monto total y número de cuotas.
2. **Promociones y Descuentos**:
   * *Porcentaje OFF* (ej: 50).
   * *Cupos con descuento* (ej: 10).
   * *Contador de cupos usados* (ej: 0 / 10).
   * *Etiqueta Promocional* (ej: "50% OFF - Hasta 17 de Agosto").
   * *Fecha límite del descuento* (Input `datetime-local`).
   * *Descuento Online específico* (porcentaje y etiqueta).
3. **Opciones Internacionales**: Toggle de `dlocal_habilitado` y toggle de `es_curso_argentina`.

-- Migración para actualizar los estados de inscriptos
-- Fecha: 2025-12-18
-- Descripción: Cambia los estados de pendiente/verificando/confirmado/cancelado 
--              a pago_a_verificar/verificado/cancelado/primer_contacto/segundo_contacto

-- PASO 1: Eliminamos el constraint existente PRIMERO
ALTER TABLE public.inscriptos DROP CONSTRAINT IF EXISTS inscriptos_estado_check;

-- PASO 2: Actualizamos los registros existentes a los nuevos estados
UPDATE public.inscriptos SET estado = 'pago_a_verificar' WHERE estado = 'pendiente';
UPDATE public.inscriptos SET estado = 'pago_a_verificar' WHERE estado = 'verificando';
UPDATE public.inscriptos SET estado = 'verificado' WHERE estado = 'confirmado';
-- cancelado se mantiene igual

-- PASO 3: Agregamos el nuevo constraint con los estados actualizados
ALTER TABLE public.inscriptos 
ADD CONSTRAINT inscriptos_estado_check 
CHECK (estado::text = ANY (ARRAY[
    'pago_pendiente'::character varying,
    'pago_a_verificar'::character varying, 
    'verificado'::character varying, 
    'cancelado'::character varying, 
    'primer_contacto'::character varying, 
    'segundo_contacto'::character varying
]::text[]));

-- PASO 4: Actualizamos el valor por defecto
ALTER TABLE public.inscriptos 
ALTER COLUMN estado SET DEFAULT 'pago_pendiente'::character varying;

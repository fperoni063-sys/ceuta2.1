-- Migration for Cannabis Orgánico course
-- Created based on context from https://www.ceuta.org.uy/cursos/calendario/136/cannabis-organico

-- 1. Variables
\set curso_slug 'cannabis-organico'
\set docente_nombre 'Agustina Alonso'

-- 2. Insertar o Actualizar Docente
UPDATE docentes SET descripcion = 'Estudiante avanzada de Facultad de Agronomía (Udelar). Especializada en producción de cannabis medicinal desde 2018. Forma parte del programa de Agroecología de Ceuta desde 2016.'
WHERE nombre = :'docente_nombre';

INSERT INTO docentes (nombre, descripcion)
SELECT :'docente_nombre', 'Estudiante avanzada de Facultad de Agronomía (Udelar). Especializada en producción de cannabis medicinal desde 2018. Forma parte del programa de Agroecología de Ceuta desde 2016.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = :'docente_nombre');

-- 3. Insertar Curso
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin, descuento_cupos_totales, descuento_cupos_usados,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Cultivo de Cannabis Orgánico',
    :'curso_slug',
    $$Domina la producción de cannabis desde una perspectiva integral y ecológica. Este curso está diseñado para llevarte desde la semilla hasta la cosecha, con bases científicas y agronómicas sólidas.

Aprenderás a diseñar y manejar cultivos en diversos sistemas: a campo, invernáculo e indoor. Profundizaremos en la fisiología de la planta, nutrición orgánica, manejo de plagas y las técnicas de cosecha y curado para asegurar la máxima calidad.

Además, abordaremos el contexto legal uruguayo, las licencias de cultivo y las oportunidades en el rubro del cannabis medicinal.

Metodología:
Clases teóricas por Zoom y jornadas prácticas presenciales en campo para meter las manos en la tierra.

Dirigido a:
Productores, emprendedores, técnicos y autocultivadores que buscan profesionalizar sus prácticas.

Requisitos:
No se requieren conocimientos previos, solo ganas de aprender.$$,
    11700, -- 3 cuotas de 3900
    3,
    '2026-03-11', -- Miércoles 11 de Marzo
    false,
    '3 meses (24 horas)',
    'hibrido',
    'Miércoles', '18:00 a 20:00 hs (Zoom)',
    'Sábados', '09:00 a 12:00 hs',
    'Teóricos Zoom / Prácticos Pinar y Sauce',
    '¿Querés cogollos de calidad premium sin químicos? 🌱',
    $$✅ Aprendé a cultivar a campo e indoor
✅ Insumos biológicos y control de plagas
✅ Normativa legal y licencias vigentes$$,
    'Diploma CEUTA avalado por MEC',
    40, -- Ajustado a 40% OFF como los otros cursos de marzo
    '40% OFF por inscripción anticipada',
    '2026-02-01',
    20,
    0,
    (SELECT id FROM docentes WHERE nombre = :'docente_nombre'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    cantidad_cuotas = EXCLUDED.cantidad_cuotas,
    fecha_inicio = EXCLUDED.fecha_inicio,
    horario_teorico = EXCLUDED.horario_teorico,
    dia_teorico = EXCLUDED.dia_teorico,
    dia_practico = EXCLUDED.dia_practico,
    horario_practico = EXCLUDED.horario_practico,
    lugar = EXCLUDED.lugar,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    certificacion = EXCLUDED.certificacion,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    descuento_etiqueta = EXCLUDED.descuento_etiqueta,
    descuento_fecha_fin = EXCLUDED.descuento_fecha_fin,
    updated_at = NOW();

-- 4. Programa de Clases
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 1, 'Introducción al rubro y bases biológicas del cultivo', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 2, 'Planificación del cultivo y genéticas', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 3, 'Suelos, sustratos, materia orgánica y nutrición', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 4, 'Fisiología, podas, rendimiento y riego', 'teorico', false, true, 4, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 5, 'Cultivo Indoor: Especificidades y manejo', 'teorico', false, true, 5, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 6, 'Sanidad: Enfermedades, plagas e insectos benéficos', 'teorico', false, true, 6, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 7, 'Cosecha, secado, curado y conservación', 'teorico', false, true, 7, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 8, 'Aspectos legales y marco normativo Uruguay', 'teorico', false, true, 8, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 9, 'Cannabis Medicinal: Introducción', 'teorico', false, true, 9, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 10, 'Práctica 1: Preparación de suelos y propagación (Sauce)', 'practico', true, false, 10, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 11, 'Práctica 2: Biopreparados y reconocimiento de plagas', 'practico', true, false, 11, true);

-- 5. FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Necesito tener experiencia previa?', 'No, el curso comienza desde los conceptos básicos de botánica y cultivo, ideal para principiantes.', 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿El diploma es oficial?', 'Sí, CEUTA es una entidad registrada en el MEC, y recibirás un certificado de aprobación o asistencia.', 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Vemos cultivo interior o exterior?', 'Ambas modalidades. Aprenderás las bases para cultivar tanto "a campo" bajo el sol como en entornos controlados (indoor).', 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Qué pasa si no puedo ir a las prácticas?', 'Las prácticas son fundamentales, pero si tienes inconvenientes puntuales, podemos coordinar recuperaciones en futuras ediciones.', 4, true);

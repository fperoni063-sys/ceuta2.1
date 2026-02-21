-- 1. Variables
\set curso_slug 'cosmetica-natural-semipresencial-full'
\set docente_nombre 'Hanna Petrikova'

-- 2. Insertar o Actualizar Docente
UPDATE docentes SET descripcion = 'Su conexión con el mundo de las plantas nace en su infancia en la zona rural de República Checa. En el jardín medicinal de su abuela recibió el conocimiento y la pasión por el cuidado natural.\n\nDesde 2011 vive en la Sierra de las Ánimas, donde investiga plantas aromáticas nativas y exóticas. Lidera el emprendimiento "Tierra Pura", poniendo en práctica su vasta experiencia en fitoterapia y cosmética natural.'
WHERE nombre = :'docente_nombre';

INSERT INTO docentes (nombre, descripcion)
SELECT :'docente_nombre', 'Su conexión con el mundo de las plantas nace en su infancia en la zona rural de República Checa. En el jardín medicinal de su abuela recibió el conocimiento y la pasión por el cuidado natural.\n\nDesde 2011 vive en la Sierra de las Ánimas, donde investiga plantas aromáticas nativas y exóticas. Lidera el emprendimiento "Tierra Pura", poniendo en práctica su vasta experiencia en fitoterapia y cosmética natural.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = :'docente_nombre');

-- 3. Insertar Curso
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Cosmética Natural: Crea tus Propios Productos',
    :'curso_slug',
    '¿Cansada de productos llenos de químicos impronunciables? Descubrí el arte de crear tu propia cosmética, sana, efectiva y 100% natural.\n\nEn este curso "Full" aprenderás a formular y elaborar desde cero: champús, cremas, emulsiones y tónicos, aprovechando el poder medicinal de las plantas. No es solo mezclar ingredientes; es entender la química natural de la piel y el cabello para diseñar tratamientos personalizados.\n\nCombinamos la teoría profunda (pH, fases, extractos) con la práctica real, para que termines el curso con tus propios productos en mano y el conocimiento para lanzar tu propio emprendimiento.\n\nDirigido a:\nCuriosos de la química natural, amantes de lo orgánico y emprendedores.\n\nRequisitos previos:\nNinguno.',
    11700, 
    3, 
    '2026-03-10', 
    true, 
    '2.5 meses (10 sesiones)',
    'hibrido',
    'A definir', '18:30 a 20:30 hs (Zoom)',
    'Sábados', 'Presencial (4 horas)',
    'Teóricos Zoom / Prácticos Presenciales',
    '🍃 Tu piel merece alimento real, no químicos.',
    '✅ Elaborá tus propios champús y cremas\n✅ Ingredientes 100% naturales\n✅ Ahorrá dinero y ganá salud\n✅ Ideal para emprendimiento',
    'Diploma CEUTA avalado por MEC',
    40, 
    '40% OFF Lansamiento',
    '2026-02-01',
    (SELECT id FROM docentes WHERE nombre = :'docente_nombre'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    updated_at = NOW();

-- 4. Limpiar clases viejas
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

-- 5. Insertar Temario
INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 1, 'Introducción: Cosmética Convencional vs Natural', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 2, 'El pH, la Piel y sus Tipos', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 3, 'Cabello, Aceites Esenciales y Plantas Medicinales', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 4, 'Práctica 1: Elaboración de Champú Líquido', 'practico', true, false, 4, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 5, 'Fase Acuosa: Aguas, Hidrolatos y Geles', 'teorico', false, true, 5, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 6, 'Extracciones Fitoterapéuticas, Vitaminas y Conservantes', 'teorico', false, true, 6, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 7, 'Emulsiones, Ceras y Tensioactivos', 'teorico', false, true, 7, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 8, 'Práctica 2: Elaboración de Emulsiones', 'practico', true, false, 8, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 9, 'Fórmulas Avanzadas: Agua Micelar y Limpieza', 'teorico', false, true, 9, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 10, 'Cierre y Presentación de Trabajos Finales', 'teorico', false, true, 10, true);

-- 6. Limpiar y regenerar FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Necesito conocimientos previos de química?', 'Para nada. Empezamos desde cero, explicando cada concepto de forma sencilla y práctica para que entiendas el "por qué" de cada ingrediente.', 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Sirve para salida laboral?', '¡Totalmente! Muchos de nuestros alumnos han creado sus propias marcas de cosmética natural (como "Tierra Pura" de la docente). Aprendés a formular con calidad profesional.', 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Qué incluye la certificación?', 'Obtenés un diploma del CEUTA, una institución con más de 30 años de trayectoria, registrada en el MEC e INEFOP. Es un aval importante para tu currículum.', 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Los materiales están incluidos?', 'Para las prácticas presenciales, CEUTA provee los insumos y herramientas. Para tu práctica en casa, te orientaremos sobre dónde conseguir los mejores ingredientes naturales.', 4, true);

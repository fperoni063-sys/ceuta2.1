-- Migration for 'Producción de Hongos Comestibles Semipresencial Full'
-- URL: https://www.ceuta.org.uy/cursos/calendario/185/produccion-de-hongos-comestibles-semipresencial-full

-- 1. Insertar o Actualizar Docente
UPDATE docentes SET descripcion = 'Diseñador, Creativo y Técnico en Cultivo de Hongos. Apasionado por la naturaleza, se formó con referentes como Susana González y Verónica Gunther. Fundador de Solar Fungi, se dedica a educar y abastecer a la comunidad sobre el cultivo de hongos comestibles, promoviendo tanto el autocultivo como la producción profesional.'
WHERE nombre = 'Lautaro Moreno';

INSERT INTO docentes (nombre, descripcion)
SELECT 'Lautaro Moreno', 'Diseñador, Creativo y Técnico en Cultivo de Hongos. Apasionado por la naturaleza, se formó con referentes como Susana González y Verónica Gunther. Fundador de Solar Fungi, se dedica a educar a la comunidad sobre el cultivo de hongos comestibles.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = 'Lautaro Moreno');

-- 2. Insertar Curso
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin, descuento_cupos_totales, descuento_cupos_usados,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Producción de Hongos Comestibles',
    'produccion-de-hongos-comestibles-semipresencial-full',
    'Descubrí el fascinante mundo del cultivo de hongos 🍄. Aprenderás desde la biología básica y el valor nutricional hasta las técnicas avanzadas de producción, enfocado principalmente en el género **Pleurotus** (Gírgolas).

Este curso te brindará las herramientas teóricas y prácticas para dominar la siembra, incubación y cosecha de hongos. Abordaremos tanto el cultivo doméstico para consumo propio como la infraestructura necesaria para un emprendimiento comercial.

**Dirigido a:**
Gastronómicos, emprendedores, permacultores y cualquier persona interesada en la soberanía alimentaria y la medicina natural.

**Requisitos:**
No se requieren conocimientos previos.',
    11700,
    3,
    '2026-03-10',
    true,
    '3 meses',
    'hibrido',
    'A definir', 'A definir (Virtual)',
    'Sábados', 'A definir (Presencial)',
    'Teóricos por Zoom / Prácticas en Montevideo/Canelones',
    '¿Te gustaría cultivar tu propio alimento y medicina en casa? 🍄',
    '✅ Aprendé a cultivar Gírgolas
✅ Salida laboral y emprendedurismo
✅ Soberanía alimentaria
✅ Técnicas de bajo costo',
    'Diploma CEUTA avalado por MEC e INEFOP',
    20,
    '20% OFF por inscripción anticipada',
    '2026-02-28',
    15,
    0,
    (SELECT id FROM docentes WHERE nombre = 'Lautaro Moreno'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    modalidad = EXCLUDED.modalidad,
    fecha_a_confirmar = EXCLUDED.fecha_a_confirmar,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    updated_at = NOW();

-- 3. Programa de Clases
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full');

INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 1, 'Introducción al mundo de los hongos', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 2, 'Propiedades nutricionales y medicinales', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 3, 'Sustratos: Elección y preparación', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 4, 'Siembra e incubación: Cultivo doméstico y en troncos', 'teorico', false, true, 4, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 5, 'Práctica: Siembra, sustrato, inóculo y cultivo', 'practico', true, false, 5, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 6, 'Fructificación, cosecha y poscosecha', 'teorico', false, true, 6, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 7, 'Producción de inóculo e infraestructura a gran escala', 'teorico', false, true, 7, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 8, 'Práctica: Métodos y configuración para cultivo doméstico', 'practico', true, false, 8, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 9, 'Plagas y contaminantes del cultivo', 'teorico', false, true, 9, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 10, 'Comercialización, mercado y perspectivas', 'teorico', false, true, 10, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), 11, 'Otros valores productivos de los hongos', 'teorico', false, true, 11, true);

-- 4. FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), '¿Necesito conocimientos previos?', 'No, el curso comienza desde los conceptos básicos de biología fungi, por lo que es apto para principiantes.', 1, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), '¿Qué certificación obtengo?', 'Obtendrás un certificado del Centro Uruguayo de Tecnologías Apropiadas (CEUTA), institución registrada en el MEC e INEFOP.', 2, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), '¿Dónde se realizan las prácticas?', 'Las prácticas son presenciales y generalmente se realizan en Montevideo o Canelones. La ubicación exacta se confirmará al inicio del curso.', 3, true),
((SELECT id FROM cursos WHERE slug = 'produccion-de-hongos-comestibles-semipresencial-full'), '¿Puedo emprender con este curso?', '¡Sí! El curso incluye módulos específicos sobre infraestructura, producción a escala y comercialización para que puedas iniciar tu propio proyecto.', 4, true);

-- =====================================================
-- CORRECCIÓN: Curso Biopiscinas y Humedales Construidos
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PRIMERO: Verificar cuántos cursos hay con este slug
-- SELECT id, nombre FROM cursos WHERE slug LIKE '%biopiscinas%';

-- =====================================================
-- PASO 1: Actualizar datos del curso existente (solo el primero)
-- =====================================================
UPDATE cursos SET
    precio = 5000,
    cantidad_cuotas = 1,
    descuento_porcentaje = 50,
    descuento_cupos_totales = 10,
    descuento_cupos_usados = 0,
    descuento_etiqueta = '🔥 50% OFF - ¡Últimos cupos verano!',
    fecha_inicio = '2026-02-03',
    fecha_a_confirmar = false,
    duracion = '4 semanas (4 teóricos + 2 prácticos)',
    dia_teorico = 'Martes',
    horario_teorico = '18:30 hs por Zoom (quedan grabadas)',
    dia_practico = 'Sábados',
    horario_practico = '08:30 hs presencial (4 horas)',
    lugar = 'Montevideo (prácticos presenciales) + Zoom (teóricos)',
    lugar_a_confirmar = false,
    modalidad = 'hibrido',
    categoria = 'bioconstruccion',
    nivel = 'todos_los_niveles',
    transformacion_hook = '¿Imaginás disfrutar de agua cristalina sin químicos, construida por tus propias manos? 🏊‍♂️',
    beneficios = '✅ Aprende principios de construcción natural y arquitectura bioclimática
✅ Domina el uso de materiales naturales y ciclos del agua
✅ Practica mezclas básicas en obra real
✅ Diseña humedales artificiales para tratamiento de aguas
✅ Construye biopiscinas ecológicas sin químicos
✅ Clases grabadas para ver cuando quieras
✅ Certificado de participación de CEUTA',
    dirigido_a = '🏡 Propietarios que quieren construir su biopiscina o humedal
🔧 Profesionales de la construcción que buscan expandir servicios
🌱 Emprendedores interesados en soluciones ecológicas
🎓 Curiosos del diseño sustentable y permacultura',
    requisitos_previos = 'No se requieren conocimientos previos. Curso diseñado para principiantes.',
    certificacion = 'Al completar el curso recibirás un certificado digital de participación emitido por CEUTA (Centro Uruguayo de Tecnologías Apropiadas), institución con más de 35 años formando en tecnologías sustentables.',
    docente = 'Santiago Ruedi',
    activo = true,
    orden = 5,
    updated_at = NOW()
WHERE id = (
    SELECT id FROM cursos 
    WHERE slug = 'construccion-natural-biopiscinas-y-humedales-construidos' 
    ORDER BY id 
    LIMIT 1
);


-- =====================================================
-- PASO 2: Crear docente Santiago Ruedi (si no existe)
-- =====================================================
INSERT INTO docentes (nombre, descripcion, foto_url)
SELECT 
    'Santiago Ruedi',
    'Bioconstructor con 15 años de experiencia, emprendedor y diseñador en permacultura. Co-creador de Nido Churrinche Barrio Naturaleza. Docente del programa de CEUTA tutorado por Luciano Davyt desde 2021.',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = 'Santiago Ruedi');

-- Vincular docente_id al curso
UPDATE cursos
SET docente_id = (SELECT id FROM docentes WHERE nombre = 'Santiago Ruedi' LIMIT 1)
WHERE id = (
    SELECT id FROM cursos 
    WHERE slug = 'construccion-natural-biopiscinas-y-humedales-construidos' 
    ORDER BY id 
    LIMIT 1
);


-- =====================================================
-- PASO 3: Obtener el ID del curso para las clases
-- =====================================================
DO $$
DECLARE
    v_curso_id INTEGER;
BEGIN
    -- Obtener el ID del curso
    SELECT id INTO v_curso_id 
    FROM cursos 
    WHERE slug = 'construccion-natural-biopiscinas-y-humedales-construidos' 
    ORDER BY id 
    LIMIT 1;
    
    -- Eliminar clases previas
    DELETE FROM programa_clases WHERE curso_id = v_curso_id;
    
    -- Insertar las 6 clases
    INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
    VALUES
        (v_curso_id, 1, 'Principios de construcción natural y conceptos de arquitectura bioclimática', 'teorico', false, true, 0, true),
        (v_curso_id, 2, 'Materiales naturales y ciclos del agua', 'teorico', false, true, 1, true),
        (v_curso_id, 3, 'Mezclas básicas - Aplicación en obra', 'practico', true, false, 2, true),
        (v_curso_id, 4, 'Diseño y construcción de humedales artificiales', 'teorico', false, true, 3, true),
        (v_curso_id, 5, 'Biopiscinas: diseño, funcionamiento y mantenimiento', 'teorico', false, true, 4, true),
        (v_curso_id, 6, 'Construcción de biopiscina - Visita a proyecto real', 'practico', true, false, 5, true);
        
    RAISE NOTICE 'Curso ID % actualizado con 6 clases', v_curso_id;
END $$;


-- =====================================================
-- VERIFICACIÓN
-- =====================================================
SELECT 
    c.id,
    c.nombre,
    c.precio,
    c.descuento_porcentaje,
    c.fecha_inicio,
    d.nombre as docente_nombre,
    (SELECT COUNT(*) FROM programa_clases pc WHERE pc.curso_id = c.id) as total_clases
FROM cursos c
LEFT JOIN docentes d ON c.docente_id = d.id
WHERE c.slug = 'construccion-natural-biopiscinas-y-humedales-construidos'
ORDER BY c.id
LIMIT 1;

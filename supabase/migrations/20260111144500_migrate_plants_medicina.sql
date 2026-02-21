DO $$
DECLARE
    v_docente_id uuid;
    v_curso_id integer;
    v_curso_slug text := 'reconocimiento-uso-plantas-medicina';
BEGIN
    -- 1. Docente Logic
    SELECT id INTO v_docente_id FROM docentes WHERE nombre = 'Hana Petrikova';
    
    IF v_docente_id IS NULL THEN
        INSERT INTO docentes (nombre, descripcion) 
        VALUES ('Hana Petrikova', 'Especialista en plantas aromáticas y extracción de principios activos. Vive en una chacra en la Sierra de las Ánimas, donde participa en proyectos de botica y farmacia natural. Docente apasionada por el diálogo entre conocimientos populares y científicos.') 
        RETURNING id INTO v_docente_id;
    ELSE
        UPDATE docentes 
        SET descripcion = 'Especialista en plantas aromáticas y extracción de principios activos. Vive en una chacra en la Sierra de las Ánimas, donde participa en proyectos de botica y farmacia natural. Docente apasionada por el diálogo entre conocimientos populares y científicos.'
        WHERE id = v_docente_id;
    END IF;

    -- 2. Curso Logic (Upsert)
    INSERT INTO cursos (
        nombre, slug, descripcion, precio, cantidad_cuotas, 
        fecha_inicio, fecha_a_confirmar, duracion, modalidad,
        dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
        transformacion_hook, beneficios, certificacion,
        descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin,
        docente_id, activo, created_at, updated_at
    ) VALUES (
        'Reconocimiento y Uso de Plantas Medicinales',
        v_curso_slug,
        'Descubre el poder curativo de la naturaleza que te rodea. En este curso aprenderás a identificar, cultivar y procesar plantas medicinales autóctonas y exóticas adaptadas a nuestro clima, reconectando con saberes ancestrales y científicos.\n\nNo solo identificarás las especies, sino que aprenderás a crear tu propia botica natural: desde la recolección respetuosa y el secado correcto, hasta la elaboración de tinturas, oleatos e infusiones.\n\nUna invitación a transformar tu jardín o entorno en una fuente de salud, guiado por expertas que unen la permacultura, la medicina china y la tradición de las yerberas.\n\nDirigido a: 🌱 Amantes de la naturaleza, ⚕️ Interesados en terapias naturales, 👩‍🌾 Todo público (nivel básico).',
        11700, 
        3, 
        '2026-03-09', 
        false, 
        '3 meses (24 horas)',
        'hibrido',
        'Lunes', '18:00 a 20:00 (Zoom)',
        'Sábados', 'Horario a confirmar (2 jornadas)',
        'Teóricos Zoom / Prácticos "Tierra Pura" (Km 90 Interbalnearia)',
        '¿Imaginás tener tu propia farmacia viva en el jardín? 🌿💊',
        '✅ Aprende a identificar y usar plantas medicinales locales\n✅ Crea tinturas, oleatos y medicinas naturales\n✅ Domina el cultivo, recolección y secado correcto\n✅ Certificado CEUTA avalado',
        'Certificado de aprobación CEUTA (Avalado por MEC/INEFOP)',
        40, 
        '40% OFF por inscripción anticipada',
        '2026-02-01',
        v_docente_id,
        true, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
        descripcion = EXCLUDED.descripcion,
        precio = EXCLUDED.precio,
        modalidad = EXCLUDED.modalidad,
        fecha_inicio = EXCLUDED.fecha_inicio,
        horario_teorico = EXCLUDED.horario_teorico,
        lugar = EXCLUDED.lugar,
        transformacion_hook = EXCLUDED.transformacion_hook,
        beneficios = EXCLUDED.beneficios,
        updated_at = NOW()
    RETURNING id INTO v_curso_id;

    -- 3. Limpiar Tablas Dependientes
    DELETE FROM programa_clases WHERE curso_id = v_curso_id;
    DELETE FROM faqs_cursos WHERE curso_id = v_curso_id;

    -- 4. Insertar Clases
    INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
    VALUES
    (v_curso_id, 1, 'Introducción: Recolección y Secado', 'teorico', false, true, 1, true),
    (v_curso_id, 2, 'Farmacopea de Jardines (Romero, Lavanda, Rosas...)', 'teorico', false, true, 2, true),
    (v_curso_id, 3, 'Salida de Campo: Reconocimiento de Ecosistemas', 'practico', true, false, 3, true),
    (v_curso_id, 4, 'Farmacopea Silvestre (Diente de León, Llantén...)', 'teorico', false, true, 4, true),
    (v_curso_id, 5, 'Farmacopea de Praderas (Carqueja, Marcela...)', 'teorico', false, true, 5, true),
    (v_curso_id, 6, 'Farmacopea Nativa y Montes (Arrayán, Pitanga...)', 'teorico', false, true, 6, true),
    (v_curso_id, 7, 'Farmacopea de Humedales (Cola de Caballo, Sauce...)', 'teorico', false, true, 7, true),
    (v_curso_id, 8, 'Salida de Campo: Práctica de Reconocimiento', 'practico', true, false, 8, true),
    (v_curso_id, 9, 'La Farmacia en Casa: Tinturas y Oleatos', 'teorico', false, true, 9, true),
    (v_curso_id, 10, 'Cierre y Presentación de Trabajos', 'teorico', false, true, 10, true);

    -- 5. Insertar FAQs
    INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
    VALUES
    (v_curso_id, '¿Necesito conocimientos previos?', 'No, el curso comienza desde un nivel básico, ideal para cualquier persona interesada.', 1, true),
    (v_curso_id, '¿Puedo hacer el curso totalmente online?', 'Sí, la parte práctica es presencial pero se ofrece la posibilidad de realizarla también en formato virtual si no puedes asistir.', 2, true),
    (v_curso_id, '¿Las clases quedan grabadas?', 'Sí, todas las clases teóricas por Zoom quedan grabadas para que puedas verlas cuando quieras.', 3, true),
    (v_curso_id, '¿Entregan certificado?', 'Sí, al finalizar y aprobar el curso recibirás un certificado de CEUTA, institución avalada por el MEC.', 4, true);

END $$;

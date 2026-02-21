---
description: Migrar un curso de la web vieja de CEUTA (ceuta.org.uy) a la base de datos nueva
---

# Migración de Curso desde URL

Este workflow permite migrar un curso de la web vieja de CEUTA a la plataforma nueva con toda la información y clases.

## Pre-requisitos
- URL del curso (formato: https://ceuta.org.uy/cursos/calendario/XXX/nombre-curso)
- Acceso al MCP de Supabase configurado

## Pasos

### 1. Leer contenido de la URL
// turbo
Usar `read_url_content` con la URL del curso para extraer toda la información.

### 2. Identificar datos del curso
Extraer de la web:
- Nombre del curso
- Descripción
- Precio y cuotas
- Fecha de inicio
- Horarios (teórico y práctico)
- Docente y bio
- Programa (lista de clases)
- Requisitos
- Certificación

### 3. Generar la migración SQL
Crear SQL siguiendo este patrón:

```sql
-- PASO 1: Actualizar curso
UPDATE cursos SET
    nombre = '[nombre]',
    slug = '[slug]',
    descripcion = '[descripcion]',
    precio = [precio_total],
    cantidad_cuotas = [n],
    fecha_inicio = [fecha o NULL],
    fecha_a_confirmar = [true/false],
    duracion = '[duracion]',
    dia_teorico = '[dia]',
    horario_teorico = '[horario]',
    dia_practico = '[dia]',
    horario_practico = '[horario]',
    lugar = '[lugar]',
    modalidad = '[hibrido/presencial/online]',
    categoria = '[categoria]',
    nivel = 'todos_los_niveles',
    docente = '[nombre_docente]',
    transformacion_hook = '[frase motivacional con emoji]',
    beneficios = '[lista con ✅]',
    dirigido_a = '[perfiles con emojis]',
    requisitos_previos = '[requisitos]',
    certificacion = '[info certificado]',
    descuento_porcentaje = [% o NULL],
    descuento_etiqueta = '[texto descuento]',
    activo = true,
    updated_at = NOW()
WHERE slug = '[slug]';

-- PASO 2: Crear docente si no existe
INSERT INTO docentes (nombre, descripcion)
SELECT '[nombre]', '[bio]'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = '[nombre]');

-- PASO 3: Vincular docente
UPDATE cursos SET docente_id = (SELECT id FROM docentes WHERE nombre = '[nombre]' LIMIT 1)
WHERE slug = '[slug]';

-- PASO 4: Insertar clases
DO $$
DECLARE v_curso_id INTEGER;
BEGIN
    SELECT id INTO v_curso_id FROM cursos WHERE slug = '[slug]' LIMIT 1;
    DELETE FROM programa_clases WHERE curso_id = v_curso_id;
    
    INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
    VALUES
        (v_curso_id, 1, '[Clase 1]', 'teorico', false, true, 0, true),
        (v_curso_id, 2, '[Clase 2]', 'teorico', false, true, 1, true),
        -- ... más clases
        ;
END $$;
```

### 4. Ejecutar migración
// turbo
Usar `mcp_supabase-mcp-server_apply_migration` con:
- project_id: `ynnjzevpqnmfkxlvvrzu`
- name: `add_[nombre_curso]_data`
- query: El SQL generado

### 5. Verificar
// turbo
Ejecutar query de verificación:
```sql
SELECT c.id, c.nombre, c.precio, c.fecha_inicio,
       (SELECT COUNT(*) FROM programa_clases WHERE curso_id = c.id) as total_clases
FROM cursos c WHERE c.slug = '[slug]';
```

## Tips de Marketing (público 30-50 años)

- **transformacion_hook**: Usar pregunta emocional + emoji
  - "¿Imaginás cosechar tus propios alimentos orgánicos sin químicos? 🥬"
  
- **beneficios**: Lista con ✅, máximo 7 ítems, enfocados en resultados
  - ✅ Aprende a preparar tu propio compost
  - ✅ Domina las técnicas de siembra estacional
  
- **dirigido_a**: Perfiles con emoji
  - 🏡 Propietarios con jardín
  - 👨‍👩‍👧 Familias buscando alimentación saludable
  - 🌱 Jubilados activos

## Campos Críticos

| Campo | Regla |
|-------|-------|
| precio | Valor TOTAL sin descuento |
| cantidad_cuotas | Número de cuotas |
| descuento_porcentaje | Solo % (50, no 50%) |
| fecha_inicio | NULL si "a confirmar" |
| programa_clases | Una fila por cada clase |

## Project ID Supabase
`ynnjzevpqnmfkxlvvrzu`

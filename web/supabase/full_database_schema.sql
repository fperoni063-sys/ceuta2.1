-- Database Schema Export for Project Ceuta
-- Generated via MCP on 2025-12-21
--
-- Extensions
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

--
-- Tables
--

CREATE TABLE public.configuracion (
    clave character varying(100) NOT NULL,
    id integer NOT NULL DEFAULT nextval('configuracion_id_seq'::regclass),
    descripcion text,
    valor text NOT NULL
);

CREATE TABLE public.cursos (
    fecha_fin_descuento timestamp with time zone,
    descuento_porcentaje integer,
    descuento_cupos_totales integer,
    descuento_cupos_usados integer DEFAULT 0,
    descuento_online_porcentaje integer,
    certificacion text,
    adjunto_5_nombre character varying(255),
    adjunto_5 text,
    adjunto_4_nombre character varying(255),
    adjunto_4 text,
    adjunto_3_nombre character varying(255),
    adjunto_3 text,
    adjunto_2_nombre character varying(255),
    id integer NOT NULL DEFAULT nextval('cursos_id_seq'::regclass),
    adjunto_2 text,
    adjunto_1_nombre character varying(255),
    precio numeric,
    fecha_inicio date,
    adjunto_1 text,
    foto_10 text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    foto_9 text,
    foto_8 text,
    foto_7 text,
    testimonio_nombre character varying(200),
    testimonio_texto text,
    foto_6 text,
    foto_5 text,
    foto_4 text,
    foto_3 text,
    foto_2 text,
    ocultar_fecha boolean DEFAULT false,
    foto_1 text,
    orden integer,
    categoria character varying(50) DEFAULT 'ninguno'::character varying,
    link_mercado_pago text,
    docente character varying(200),
    nivel character varying(50) DEFAULT 'todos_los_niveles'::character varying,
    lugar character varying(255),
    beneficios text,
    horario_practico character varying(255),
    modalidad character varying(50) DEFAULT 'presencial'::character varying,
    horario character varying(255),
    descripcion_corta text,
    descripcion_larga text,
    slug character varying(200),
    nombre character varying(200) NOT NULL,
    descripcion text,
    duracion character varying(100),
    docente_id integer
);

CREATE TABLE public.descuentos (
    id integer NOT NULL DEFAULT nextval('descuentos_id_seq'::regclass),
    codigo character varying(50) NOT NULL,
    tipo character varying(20) NOT NULL,
    valor numeric NOT NULL,
    activo boolean DEFAULT true,
    fecha_inicio date,
    fecha_fin date,
    usos_maximos integer,
    usos_actuales integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    cursos_aplica integer[],
    descripcion text
);

CREATE TABLE public.docentes (
    nombre character varying(200) NOT NULL,
    bio text,
    foto_url text,
    orden integer DEFAULT 0,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    id integer NOT NULL DEFAULT nextval('docentes_id_seq'::regclass)
);

CREATE TABLE public.email_logs (
    status character varying(50),
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    id integer NOT NULL DEFAULT nextval('email_logs_id_seq'::regclass),
    inscripto_id integer
);

CREATE TABLE public.email_templates (
    id integer NOT NULL DEFAULT nextval('email_templates_id_seq'::regclass),
    nombre character varying(100) NOT NULL,
    asunto character varying(200) NOT NULL,
    contenido text NOT NULL,
    descripcion text,
    variables text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.embeddings_cursos (
    created_at timestamp with time zone DEFAULT now(),
    embedding vector(1536),
    id integer NOT NULL DEFAULT nextval('embeddings_cursos_id_seq'::regclass),
    curso_id integer,
    contenido text
);

CREATE TABLE public.faqs_cursos (
    id integer NOT NULL DEFAULT nextval('faqs_cursos_id_seq'::regclass),
    curso_id integer NOT NULL,
    pregunta text NOT NULL,
    respuesta text NOT NULL,
    orden integer DEFAULT 0,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.historial_chats (
    user_message text NOT NULL,
    bot_response text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    embedding vector(1536),
    id integer NOT NULL DEFAULT nextval('historial_chats_id_seq'::regclass),
    metadata jsonb
);

CREATE TABLE public.inscriptos (
    pais character varying(100),
    nombre character varying(200) NOT NULL,
    telefono character varying(50),
    email character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    monto_pagado numeric,
    curso_id integer NOT NULL,
    id integer NOT NULL DEFAULT nextval('inscriptos_id_seq'::regclass),
    descuento_aplicado integer,
    precio_pagado integer,
    ultimo_email_enviado timestamp with time zone,
    emails_enviados integer DEFAULT 0,
    ultima_visita timestamp with time zone,
    veces_visitado integer DEFAULT 0,
    token_expires_at timestamp with time zone
);

CREATE TABLE public.programa_clases (
    titulo text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    activo boolean DEFAULT true,
    orden integer DEFAULT 0,
    practica_virtual boolean DEFAULT false,
    practica_presencial boolean DEFAULT false,
    tipo character varying(20) NOT NULL DEFAULT 'teorico'::character varying,
    curso_id integer NOT NULL,
    id integer NOT NULL DEFAULT nextval('programa_clases_id_seq'::regclass),
    numero integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.scheduled_emails (
    estado character varying(20) DEFAULT 'pending'::character varying,
    template_nombre character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    enviar_en timestamp with time zone NOT NULL,
    id integer NOT NULL DEFAULT nextval('scheduled_emails_id_seq'::regclass),
    inscripto_id integer
);

CREATE TABLE public.testimonios (
    activo boolean DEFAULT true,
    id integer NOT NULL DEFAULT nextval('testimonios_id_seq'::regclass),
    nombre character varying(100) NOT NULL,
    foto_url text,
    texto text NOT NULL,
    curso character varying(200),
    created_at timestamp without time zone DEFAULT now(),
    orden integer DEFAULT 0
);

--
-- Primary Keys
--

ALTER TABLE public.configuracion ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);
ALTER TABLE public.cursos ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);
ALTER TABLE public.descuentos ADD CONSTRAINT descuentos_pkey PRIMARY KEY (id);
ALTER TABLE public.docentes ADD CONSTRAINT docentes_pkey PRIMARY KEY (id);
ALTER TABLE public.email_logs ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.email_templates ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.embeddings_cursos ADD CONSTRAINT embeddings_cursos_pkey PRIMARY KEY (id);
ALTER TABLE public.faqs_cursos ADD CONSTRAINT faqs_cursos_pkey PRIMARY KEY (id);
ALTER TABLE public.historial_chats ADD CONSTRAINT historial_chats_pkey PRIMARY KEY (id);
ALTER TABLE public.inscriptos ADD CONSTRAINT inscriptos_pkey PRIMARY KEY (id);
ALTER TABLE public.programa_clases ADD CONSTRAINT programa_clases_pkey PRIMARY KEY (id);
ALTER TABLE public.scheduled_emails ADD CONSTRAINT scheduled_emails_pkey PRIMARY KEY (id);
ALTER TABLE public.testimonios ADD CONSTRAINT testimonios_pkey PRIMARY KEY (id);

--
-- Foreign Keys
--

ALTER TABLE public.embeddings_cursos ADD CONSTRAINT embeddings_cursos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos (id);
ALTER TABLE public.inscriptos ADD CONSTRAINT inscriptos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos (id);
ALTER TABLE public.cursos ADD CONSTRAINT cursos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes (id);
ALTER TABLE public.email_logs ADD CONSTRAINT email_logs_inscripto_id_fkey FOREIGN KEY (inscripto_id) REFERENCES public.inscriptos (id);
ALTER TABLE public.scheduled_emails ADD CONSTRAINT scheduled_emails_inscripto_id_fkey FOREIGN KEY (inscripto_id) REFERENCES public.inscriptos (id);
ALTER TABLE public.faqs_cursos ADD CONSTRAINT faqs_cursos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos (id);
ALTER TABLE public.programa_clases ADD CONSTRAINT programa_clases_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos (id);

--
-- Functions
--

CREATE OR REPLACE FUNCTION public.increment_emails_enviados(p_inscripto_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE inscriptos 
    SET emails_enviados = COALESCE(emails_enviados, 0) + 1, ultimo_email_enviado = NOW()
    WHERE id = p_inscripto_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.buscar_cursos_similares(query_embedding vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 5)
 RETURNS TABLE(id integer, curso_id integer, contenido text, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ec.id,
        ec.curso_id,
        ec.contenido,
        1 - (ec.embedding <=> query_embedding) AS similarity
    FROM embeddings_cursos ec
    WHERE 1 - (ec.embedding <=> query_embedding) > match_threshold
    ORDER BY ec.embedding <=> query_embedding
    LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generar_slug_unico(nombre_curso text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generar slug base
    base_slug := lower(nombre_curso);
    base_slug := translate(base_slug, 'áàäâéèëêíìïîóòöôúùüûñ', 'aaaaeeeeiiiioooouuuun');
    base_slug := regexp_replace(base_slug, '[^a-z0-9\\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '[\\s_]+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Verificar unicidad
    WHILE EXISTS (SELECT 1 FROM cursos WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_discount_usage(p_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE descuentos 
  SET usos_actuales = usos_actuales + 1 
  WHERE codigo = p_code;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_discount_code(p_code text, p_curso_id integer)
 RETURNS TABLE(valid boolean, tipo character varying, valor numeric, error_message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_discount RECORD;
BEGIN
  SELECT * INTO v_discount FROM descuentos WHERE codigo = p_code AND activo = true;
  
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código no encontrado o inactivo';
    RETURN;
  END IF;

  -- Check dates
  IF v_discount.fecha_inicio IS NOT NULL AND v_discount.fecha_inicio > CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código aún no vigente';
    RETURN;
  END IF;

  IF v_discount.fecha_fin IS NOT NULL AND v_discount.fecha_fin < CURRENT_DATE THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código vencido';
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount.usos_maximos IS NOT NULL AND v_discount.usos_actuales >= v_discount.usos_maximos THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código agotado';
    RETURN;
  END IF;

  -- Check course applicability
  IF v_discount.cursos_aplica IS NOT NULL AND NOT (p_curso_id = ANY(v_discount.cursos_aplica)) THEN
    RETURN QUERY SELECT false, NULL::VARCHAR, NULL::DECIMAL, 'Código no aplicable a este curso';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_discount.tipo, v_discount.valor, NULL::TEXT;
END;
$function$
;

--
-- Policies
--

CREATE POLICY "Public Read Configuracion" ON public.configuracion FOR SELECT TO public USING (true);
CREATE POLICY "Anon Read Descuentos" ON public.descuentos FOR SELECT TO public USING (true);
CREATE POLICY "Anon Insert Inscriptos" ON public.inscriptos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Read Testimonios" ON public.testimonios FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Email Templates" ON public.email_templates FOR SELECT TO public USING (true);
CREATE POLICY "FAQs activas son visibles por todos" ON public.faqs_cursos FOR SELECT TO public USING ((activo = true));
CREATE POLICY "Solo usuarios autenticados pueden modificar FAQs" ON public.faqs_cursos FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Escritura autenticada programa_clases" ON public.programa_clases FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Lectura pública programa_clases" ON public.programa_clases FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Cursos" ON public.cursos FOR SELECT TO public USING (true);

-- Enable RLS (Defaulting to enabled for tables on which policies exist)
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descuentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programa_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
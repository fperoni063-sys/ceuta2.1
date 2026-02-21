-- Migration: Create missing tables for CEUTA Web 2.1
-- Created: 2024-12-16
-- Run this in Supabase SQL Editor

-- 1. Table: inscriptos
CREATE TABLE IF NOT EXISTS inscriptos (
  id SERIAL PRIMARY KEY,
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  cedula VARCHAR(20),
  estado VARCHAR(20) DEFAULT 'pendiente' 
    CHECK (estado IN ('pendiente', 'verificando', 'confirmado', 'cancelado')),
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('transferencia', 'mercadopago')),
  codigo_descuento VARCHAR(50),
  monto_pagado DECIMAL(10,2),
  comprobante_url TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Table: descuentos
CREATE TABLE IF NOT EXISTS descuentos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  tipo VARCHAR(20) CHECK (tipo IN ('porcentaje', 'monto')),
  valor DECIMAL(10,2),
  cursos_aplica INT[],           -- NULL = all courses. Array of course IDs.
  fecha_inicio DATE,
  fecha_fin DATE,
  usos_maximos INT,
  usos_actuales INT DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Table: testimonios
CREATE TABLE IF NOT EXISTS testimonios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  curso VARCHAR(200),                   -- Course name (free text or reference if needed, kept free text for flexibility)
  texto TEXT NOT NULL,
  foto_url TEXT,
  orden INT DEFAULT 0,                  -- For slider ordering
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Note: 'configuracion' table already exists, so we skip it to avoid conflicts. 
-- If you need to verify it, it should have columns: clave, valor, descripcion.

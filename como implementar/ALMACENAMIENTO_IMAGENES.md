# Almacenamiento de Imágenes

## Arquitectura

Las imágenes subidas en CEUTA se almacenan de forma diferente según el entorno:

| Entorno | Storage | Ubicación |
|---------|---------|-----------|
| **Desarrollo** | Local (public folder) | `/web/public/uploads/` |
| **Producción** | Cloudinary | `res.cloudinary.com/ceuta/...` |

---

## Cloudinary (Producción)

### ¿Por qué Cloudinary?
- **25 GB gratis** - suficiente para cientos de imágenes
- **CDN global** - carga rápido en todo el mundo  
- **Optimización automática** - WebP, resize, etc.
- **Backup automático** - nunca se pierden imágenes

### Configuración
1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Ir a Settings > API Keys
3. Agregar variables en `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz
```

### URLs de imágenes
Las URLs se guardan en la base de datos (Supabase) como texto.
Ejemplo: `https://res.cloudinary.com/ceuta/image/upload/v123/cursos/huerta-hero.jpg`

---

## Campos de Imagen por Entidad

### Cursos
| Campo | Uso | Ratio Recomendado |
|-------|-----|-------------------|
| `imagen_portada` | Cards, listados, carrusel | 4:3 (800×600px) |
| `imagen_hero` | Banner grande en página de detalle | 21:9 (1920×823px) |

### Docentes
| Campo | Uso | Ratio Recomendado |
|-------|-----|-------------------|
| `foto_url` | Foto de perfil del docente | 1:1 (400×400px) |

### Testimonios
| Campo | Uso | Ratio Recomendado |
|-------|-----|-------------------|
| `foto_url` | Foto del estudiante | 1:1 (200×200px) |

---

## Estructura de Carpetas (Local)

```
/web/public/uploads/
├── cursos/
│   ├── portadas/      # Imágenes de portada (cards)
│   └── heroes/        # Imágenes hero (banners)
├── docentes/          # Fotos de docentes
└── testimonios/       # Fotos de testimonios
```

---

## Migración a Producción

Cuando deploys a producción:
1. Subir imágenes existentes a Cloudinary
2. Actualizar URLs en la base de datos
3. Configurar variables de entorno en Netlify

# Portafolio Diego Bardalez

Portfolio estático hecho con React + Vite, servido con Nginx y listo para GitHub Pages.

## Incluye

- Home pública con perfil, experiencia y repositorios.
- Panel privado oculto detrás de la foto de perfil.
- El acceso al panel se abre haciendo click en la foto de perfil o en el nombre.
- Login email + password con Supabase.
- Edición de perfil, experiencia y repositorios sin backend propio.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa tus valores reales.

## Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ejecuta el SQL de `supabase/schema.sql`.
3. Crea tu usuario con el email `diieego.brz@gmail.com`.
4. Activa email/password en Authentication.
5. Ajusta el contenido desde el panel privado.

## GitHub Pages

El sitio sigue siendo estático. Supabase solo cubre autenticación y persistencia de contenido.

## Docker

La imagen usa build multi-stage y sirve la SPA con Nginx.

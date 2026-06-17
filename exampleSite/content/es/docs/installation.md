---
title: "Instalación"
description: "Instala Wavecast como tema de Hugo o módulo de Hugo. Instrucciones paso a paso para ambas opciones."
date: 2026-01-01
weight: 70
---

Wavecast se puede usar de dos maneras. Elige la que mejor se adapte a tu proyecto.

## Requisitos Previos

- **Hugo** v0.146.0 o superior
- **Go** 1.23 o superior (solo si usas la instalación como módulo)

## Opción A: Instalar como Tema de Hugo

Recomendado para la mayoría de los sitios. Clona Wavecast en tu directorio `themes/`:

```
git clone git@github.com:adurrr/wavecast.git themes/wavecast
```

Luego añade a tu `hugo.toml`:

```
theme = "wavecast"
```

Eso es todo. Hugo descubre automáticamente el shortcode (`layouts/_shortcodes/podcast-player.html`), JS (`assets/js/podcast-player.js`) y CSS (`assets/css/podcast-player.css`) desde el directorio del tema.

{{< admonition type="tip" title="Fijar Versión" >}}
Fija una versión específica con una etiqueta Git:
```
cd themes/wavecast && git checkout v1.3.0
```
{{< /admonition >}}

## Opción B: Instalar como Módulo de Hugo

Si ya usas módulos de Hugo o necesitas combinar Wavecast con otros módulos:

```
hugo mod init github.com/tuusuario/tu-sitio
hugo mod get github.com/adurrr/wavecast
```

Luego en tu `hugo.toml`:

```
[module]
  [[module.imports]]
    path = "github.com/adurrr/wavecast"
```

Hugo resuelve el módulo y hace que el shortcode, JS y CSS estén disponibles automáticamente.

## ¿Qué Opción Debo Elegir?

| Quieres... | Usa |
|-------------|-----|
| Configuración simple, un solo tema | **Tema** (`theme = "wavecast"`) |
| Usar Wavecast junto a otros módulos | **Módulo** (`[module.imports]`) |
| Sobrescribir plantillas de Wavecast en tu proyecto | **Tema** (la cascada de temas de Hugo maneja las sobrescrituras) |
| Construcciones reproducibles y fijadas | Cualquiera: ambas soportan fijar versiones |
| Sin submodulo git ni clon en tu repositorio | **Módulo** (`hugo mod get`) |

## Desarrollo Local / Demo

Clona el repositorio y ejecuta el sitio de ejemplo incluido:

```
git clone git@github.com:adurrr/wavecast.git
cd wavecast/exampleSite
hugo server --port 1313
```

Abre tu navegador en la URL mostrada por el servidor (ej. `http://localhost:1313/wavecast/`). El primer reproductor demo usa un archivo `.wav` local, por lo que funciona inmediatamente sin dependencias externas.

## Verificar Instalación

Después de instalar, verifica que el shortcode es reconocido:

```
# En el directorio de tu proyecto Hugo
hugo server --port 1313
```

Crea una página de prueba y añade un shortcode `podcast-player`. Si el reproductor se renderiza, está todo listo.

{{< admonition type="note" >}}
¿Ves mensajes `errorf` sobre shortcode no encontrado? Asegúrate de que tu `hugo.toml` tiene `theme = "wavecast"` (tema) o `[module.imports]` (módulo) configurado correctamente.
{{< /admonition >}}

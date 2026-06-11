---
title: "Documentación"
description: "Aprende a usar Wavecast: el componente web de reproductor de podcast persistente para Hugo."
weight: 1

cascade:
  showDate: false
  showAuthor: false
---

{{< admonition type="tip" >}}
**Estás viendo la documentación.** Esta página fue construida con Wavecast. Cada ejemplo de código es un shortcode funcional que se renderiza en vivo en tu navegador.
{{< /admonition >}}

## ¿Qué es Wavecast?

Wavecast es un tema y módulo de Hugo de código abierto que añade un **reproductor de audio de podcast/radio persistente** a cualquier sitio Hugo. Proporciona dos componentes web personalizados que trabajan juntos:

<div class="info-card">

| Componente | Dónde | Qué hace |
|-----------|-------|-------------|
| `<podcast-player>` | En línea (en tu contenido) | Reproducir/pausa, saltar, buscar, volumen, capítulos, póster |
| `<podcast-footer>` | Pie de página fijo | Barra de reproductor persistente al final de cada página |

</div>

Ambos componentes están **sincronizados bidireccionalmente**: pausar el pie de página pausa todos los reproductores en línea, y viceversa. Solo se reproduce una fuente de audio a la vez. La posición, volumen, silencio y velocidad sobreviven a la navegación entre páginas.

## Características Principales

- **Componente web** con Shadow DOM: independiente del framework, funciona en cualquier sitio
- **Reproductor en línea** con reproducir/pausa, saltar ±15s, barra de progreso, volumen, silencio, velocidad (0.5×–2×)
- **Reproductor de pie fijo** con portada, nombre de pista, barra de progreso ancha, volumen, silencio, velocidad, cerrar
- **Sincronización bidireccional** entre reproductores en línea y de pie
- **Flujo único**: reproducir una nueva fuente detiene la anterior
- **Capítulos**: chips de navegación con marcas de tiempo
- **Póster y descripción**: imagen de portada y notas renderizadas en Markdown
- **Adaptadores de fuente**: archivos locales, estaciones AzuraCast, episodios de iVoox
- **Persistencia de navegación**: sobrevive a Turbolinks, Turbo, htmx y cargas de página vanilla
- **Tematización**: 11 propiedades CSS personalizadas para temas claro/oscuro
- **Selectores `::part()`**: estiliza elementos del Shadow DOM desde fuera
- **Atajos de teclado**: Espacio (reproducir/pausa), Izquierda/Derecha (saltar), M (silencio)
- **API Media Session**: se integra con los controles multimedia del sistema operativo
- **Feed RSS de podcast**: RSS compatible con iTunes con detección automática
- **Accesible**: etiquetas ARIA, anillos `:focus-visible`, controles semánticos

## ¿Para quién es?

- **Podcasters** que quieren un sitio Hugo autogestionado con un reproductor de audio profesional
- **Estaciones de radio** que usan AzuraCast y necesitan un reproductor web persistente
- **Desarrolladores de temas Hugo** que quieren incrustar audio en sus temas
- **Cualquiera** que construya un sitio de contenido y quiera audio que sobreviva a la navegación

## Demo en Vivo

{{< button url="https://adurrr.github.io/wavecast/" variant="primary" icon="→" >}}Abrir Demo en Vivo{{< /button >}}
{{< button url="https://github.com/adurrr/wavecast" variant="outline" icon="→" >}}Repositorio GitHub{{< /button >}}

## Navegando la Documentación

| Página | Lo que aprenderás |
|------|------------------|
| [Instalación]({{< ref "docs/installation" >}}) | Configuración como tema vs módulo, requisitos de Hugo |
| [Primeros Pasos]({{< ref "docs/getting-started" >}}) | Primer episodio, configuración mínima, verificar que funciona |
| [Configuración]({{< ref "docs/configuration" >}}) | Opciones de configuración, propiedades CSS, selectores `::part()` |
| [Configuración de Inicio]({{< ref "docs/homepage-setup" >}}) | Reproductor de pie, atributos de framework, alternancia de tema |
| [Shortcodes]({{< ref "docs/shortcodes" >}}) | Todos los shortcodes de utilidad con ejemplos en vivo |
| [Front Matter]({{< ref "docs/front-matter" >}}) | Campos de audio, campos RSS de podcast, configuración por página |
| [Avanzado]({{< ref "docs/advanced" >}}) | Adaptadores de fuente, API de eventos, persistencia, solución de problemas |

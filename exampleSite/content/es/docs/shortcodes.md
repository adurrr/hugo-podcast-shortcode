---
title: "Shortcodes de Utilidad"
description: "Advertencias, botones, figuras, videos, pestañas, galerías y carruseles: todo incluido con Wavecast."
date: 2026-01-01
weight: 50
---

Wavecast incluye un conjunto de shortcodes de utilidad para crear páginas de contenido enriquecido sin HTML personalizado.
Todos son compatibles con el modo oscuro, responsivos y accesibles.

---

## Advertencias / Llamadas

Cuatro variantes: `note`, `tip`, `warning`, `danger`. Acepta un `title` opcional.

### Nota

```
{{</* admonition type="note" title="Atención" */>}}
Esto es una **nota** con soporte de markdown.
{{</* /admonition */>}}
```

{{< admonition type="note" title="Atención" >}}
Esto es una **nota** con soporte de markdown.
{{< /admonition >}}

### Consejo

```
{{</* admonition type="tip" */>}}
Consejo: usa `hugo serve --disableFastRender` durante el desarrollo.
{{</* /admonition */>}}
```

{{< admonition type="tip" >}}
Consejo: usa `hugo serve --disableFastRender` durante el desarrollo.
{{< /admonition >}}

### Advertencia

```
{{</* admonition type="warning" title="Aviso de Obsolescencia" */>}}
Esta API será eliminada en la próxima versión principal.
{{</* /admonition */>}}
```

{{< admonition type="warning" title="Aviso de Obsolescencia" >}}
Esta API será eliminada en la próxima versión principal.
{{< /admonition >}}

### Peligro

```
{{</* admonition type="danger" */>}}
**No ejecutes** esto en producción sin una copia de seguridad.
{{</* /admonition */>}}
```

{{< admonition type="danger" >}}
**No ejecutes** esto en producción sin una copia de seguridad.
{{< /admonition >}}

---

## Botones

Tres variantes: `primary`, `secondary`, `outline`. Las URLs externas se abren en una nueva pestaña.

| Variante | Código |
|---|---|
| Primario | `{{</* button url="/" variant="primary" */>}}Inicio{{</* /button */>}}` |
| Secundario | `{{</* button url="/" variant="secondary" */>}}Docs{{</* /button */>}}` |
| Contorno | `{{</* button url="/" variant="outline" */>}}Saber Más{{</* /button */>}}` |
| Con icono | `{{</* button url="https://github.com/adurrr/wavecast" icon="→" */>}}Ver en GitHub{{</* /button */>}}` |

{{< button url="/" variant="primary" >}}Inicio{{< /button >}}
{{< button url="/" variant="secondary" >}}Docs{{< /button >}}
{{< button url="/" variant="outline" >}}Saber Más{{< /button >}}
{{< button url="https://github.com/adurrr/wavecast" icon="→" variant="outline" >}}Ver en GitHub{{< /button >}}

---

## Figure

Elemento `<figure>` HTML5 mejorado con caption opcional, carga diferida y soporte de recursos.

```
{{</* figure src="https://picsum.photos/800/400" caption="Una imagen aleatoria de Lorem Picsum." alt="Foto aleatoria" */>}}
```

{{< figure src="https://picsum.photos/800/400" caption="Una imagen aleatoria de Lorem Picsum." alt="Foto aleatoria" >}}

---

## Video

`<video>` HTML5 con póster y caption opcionales.

```
{{</* video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://picsum.photos/800/450" caption="Video de muestra Big Buck Bunny." */>}}
```

{{< video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://picsum.photos/800/450" caption="Video de muestra Big Buck Bunny." >}}

---

## Pestañas

Pestañas solo con CSS (botones de radio). Útiles para ejemplos de código en múltiples lenguajes o cualquier contenido con pestañas.

~~~
{{</* tabs */>}}
{{</* tab name="HTML" */>}}
```
<button class="btn">Click me</button>
```
{{</* /tab */>}}
{{</* tab name="CSS" */>}}
```
.btn { padding: 0.5rem 1rem; border-radius: 8px; }
```
{{</* /tab */>}}
{{</* tab name="JavaScript" */>}}
```
document.querySelector('.btn').addEventListener('click', () => alert('Hola'));
```
{{</* /tab */>}}
{{</* /tabs */>}}
~~~

{{< tabs >}}
{{< tab name="HTML" >}}
```
<button class="btn">Click me</button>
```
{{< /tab >}}
{{< tab name="CSS" >}}
```
.btn { padding: 0.5rem 1rem; border-radius: 8px; }
```
{{< /tab >}}
{{< tab name="JavaScript" >}}
```
document.querySelector('.btn').addEventListener('click', () => alert('Hola'));
```
{{< /tab >}}
{{< /tabs >}}

---

## Galería

Cuadrícula CSS de miniaturas. Envuelve imágenes en Markdown. Las imágenes con enlace son cliqueables.

```
{{</* gallery */>}}
![Foto 1](https://picsum.photos/400/300?1)
![Foto 2](https://picsum.photos/400/300?2)
![Foto 3](https://picsum.photos/400/300?3)
![Foto 4](https://picsum.photos/400/300?4)
![Foto 5](https://picsum.photos/400/300?5)
{{</* /gallery */>}}
```

{{< gallery >}}
![Foto 1](https://picsum.photos/400/300?1)
![Foto 2](https://picsum.photos/400/300?2)
![Foto 3](https://picsum.photos/400/300?3)
![Foto 4](https://picsum.photos/400/300?4)
![Foto 5](https://picsum.photos/400/300?5)
{{< /gallery >}}

---

## Carrusel

Carrusel CSS scroll-snap con botones anterior/siguiente. Cada imagen se convierte en una diapositiva.

```
{{</* carousel */>}}
![Diapositiva 1](https://picsum.photos/800/400?10)
![Diapositiva 2](https://picsum.photos/800/400?20)
![Diapositiva 3](https://picsum.photos/800/400?30)
{{</* /carousel */>}}
```

{{< carousel >}}
![Diapositiva 1](https://picsum.photos/800/400?10)
![Diapositiva 2](https://picsum.photos/800/400?20)
![Diapositiva 3](https://picsum.photos/800/400?30)
{{< /carousel >}}

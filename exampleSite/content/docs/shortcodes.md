---
title: "Utility Shortcodes"
description: "Admonitions, buttons, figures, videos, tabs, galleries, and carousels: all included with Wavecast."
date: 2026-01-01
weight: 30
---

Wavecast ships a set of utility shortcodes for building rich content pages without custom HTML.
All are dark-mode aware, responsive, and accessible.

---

## Admonitions / Callouts

Four variants: `note`, `tip`, `warning`, `danger`. Accepts an optional `title`.

### Note

```go-html-template
{{</* admonition type="note" title="Heads Up" */>}}
This is a **note** with markdown support.
{{</* /admonition */>}}
```

{{< admonition type="note" title="Heads Up" >}}
This is a **note** with markdown support.
{{< /admonition >}}

### Tip

```go-html-template
{{</* admonition type="tip" */>}}
Pro tip: use `hugo serve --disableFastRender` during development.
{{</* /admonition */>}}
```

{{< admonition type="tip" >}}
Pro tip: use `hugo serve --disableFastRender` during development.
{{< /admonition >}}

### Warning

```go-html-template
{{</* admonition type="warning" title="Deprecation Notice" */>}}
This API will be removed in the next major version.
{{</* /admonition */>}}
```

{{< admonition type="warning" title="Deprecation Notice" >}}
This API will be removed in the next major version.
{{< /admonition >}}

### Danger

```go-html-template
{{</* admonition type="danger" */>}}
**Do not** run this in production without a backup.
{{</* /admonition */>}}
```

{{< admonition type="danger" >}}
**Do not** run this in production without a backup.
{{< /admonition >}}

---

## Buttons

Three variants: `primary`, `secondary`, `outline`. External URLs open in a new tab.

| Variant | Code |
|---|---|
| Primary | `{{</* button url="/" variant="primary" */>}}Home{{</* /button */>}}` |
| Secondary | `{{</* button url="/" variant="secondary" */>}}Docs{{</* /button */>}}` |
| Outline | `{{</* button url="/" variant="outline" */>}}Learn More{{</* /button */>}}` |
| With icon | `{{</* button url="https://github.com/adurrr/wavecast" icon="→" */>}}View on GitHub{{</* /button */>}}` |

{{< button url="/" variant="primary" >}}Home{{< /button >}}
{{< button url="/" variant="secondary" >}}Docs{{< /button >}}
{{< button url="/" variant="outline" >}}Learn More{{< /button >}}
{{< button url="https://github.com/adurrr/wavecast" icon="→" variant="outline" >}}View on GitHub{{< /button >}}

---

## Figure

Enhanced HTML5 `<figure>` with optional caption, lazy loading, and resource support.

```go-html-template
{{</* figure src="https://picsum.photos/800/400" caption="A random image from Lorem Picsum." alt="Random photo" */>}}
```

{{< figure src="https://picsum.photos/800/400" caption="A random image from Lorem Picsum." alt="Random photo" >}}

---

## Video

HTML5 `<video>` with optional poster and caption.

```go-html-template
{{</* video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://picsum.photos/800/450" caption="Big Buck Bunny sample video." */>}}
```

{{< video src="https://www.w3schools.com/html/mov_bbb.mp4" poster="https://picsum.photos/800/450" caption="Big Buck Bunny sample video." >}}

---

## Tabs

CSS-only tabs (radio buttons). Useful for code examples in multiple languages, or any tabbed content.

~~~
{{</* tabs */>}}
{{</* tab name="HTML" */>}}
```html
<button class="btn">Click me</button>
```
{{</* /tab */>}}
{{</* tab name="CSS" */>}}
```css
.btn { padding: 0.5rem 1rem; border-radius: 8px; }
```
{{</* /tab */>}}
{{</* tab name="JavaScript" */>}}
```javascript
document.querySelector('.btn').addEventListener('click', () => alert('Hi'));
```
{{</* /tab */>}}
{{</* /tabs */>}}
~~~

{{< tabs >}}
{{< tab name="HTML" >}}
```html
<button class="btn">Click me</button>
```
{{< /tab >}}
{{< tab name="CSS" >}}
```css
.btn { padding: 0.5rem 1rem; border-radius: 8px; }
```
{{< /tab >}}
{{< tab name="JavaScript" >}}
```javascript
document.querySelector('.btn').addEventListener('click', () => alert('Hi'));
```
{{< /tab >}}
{{< /tabs >}}

---

## Gallery

CSS grid of thumbnails. Wrap Markdown images. Anchor-wrapped images are clickable.

```go-html-template
{{</* gallery */>}}
![Photo 1](https://picsum.photos/400/300?1)
![Photo 2](https://picsum.photos/400/300?2)
![Photo 3](https://picsum.photos/400/300?3)
![Photo 4](https://picsum.photos/400/300?4)
![Photo 5](https://picsum.photos/400/300?5)
{{</* /gallery */>}}
```

{{< gallery >}}
![Photo 1](https://picsum.photos/400/300?1)
![Photo 2](https://picsum.photos/400/300?2)
![Photo 3](https://picsum.photos/400/300?3)
![Photo 4](https://picsum.photos/400/300?4)
![Photo 5](https://picsum.photos/400/300?5)
{{< /gallery >}}

---

## Carousel

CSS scroll-snap carousel with prev/next buttons. Each image becomes a slide.

```go-html-template
{{</* carousel */>}}
![Slide 1](https://picsum.photos/800/400?10)
![Slide 2](https://picsum.photos/800/400?20)
![Slide 3](https://picsum.photos/800/400?30)
{{</* /carousel */>}}
```

{{< carousel >}}
![Slide 1](https://picsum.photos/800/400?10)
![Slide 2](https://picsum.photos/800/400?20)
![Slide 3](https://picsum.photos/800/400?30)
{{< /carousel >}}

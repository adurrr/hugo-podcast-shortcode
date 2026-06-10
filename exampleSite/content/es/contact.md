---
title: "Contacto"
---

¿Tienes una pregunta, sugerencia o quieres ser invitado en uno de nuestros programas? Nos encantaría saber de ti.

<div class="demo-player">
  <div class="info-card" style="margin-bottom:1rem;background:var(--pp-surface);border:none">
    <p style="font-size:0.85rem;margin:0;color:var(--text-muted)">
      <strong>Nota:</strong> Este es un sitio de demostración. El formulario siguiente es solo para demostración y no envía mensajes reales. Para contacto real, abre un issue o discusión en <a href="https://github.com/adurrr/wavecast" target="_blank" rel="noopener">GitHub</a>.
    </p>
  </div>
  <h3 style="margin-bottom:1rem">Ponte en Contacto</h3>
  <form style="display:flex;flex-direction:column;gap:1rem;max-width:500px" onsubmit="event.preventDefault();this.innerHTML='<div class=info-card style=text-align:center><p><strong>¡Mensaje recibido!</strong></p><p style=font-size:0.85rem;color:var(--text-muted)>Este es un formulario de demostración. No se enviaron datos. Para consultas reales, visita nuestro <a href=https://github.com/adurrr/wavecast>repositorio de GitHub</a>.</p></div>'" novalidate>
    <div>
      <label for="name" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Nombre</label>
      <input type="text" id="name" placeholder="Tu nombre" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
    </div>
    <div>
      <label for="email" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Correo electrónico</label>
      <input type="email" id="email" placeholder="tu@ejemplo.com" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem">
    </div>
    <div>
      <label for="message" style="display:block;font-size:0.9rem;font-weight:600;margin-bottom:0.25rem">Mensaje</label>
      <textarea id="message" rows="5" placeholder="Tu mensaje" required style="width:100%;padding:0.55rem 0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);font-size:0.9rem;resize:vertical"></textarea>
    </div>
    <button type="submit" class="nav-button nav-button-primary" style="align-self:flex-start;border:none;font-size:0.9rem">Enviar Mensaje</button>
  </form>
</div>

## Otras Formas de Contactarnos

- [**GitHub**](https://github.com/adurrr/wavecast) :  código fuente, issues, solicitudes de funciones y pull requests
- [**README**](https://github.com/adurrr/wavecast#readme) :  documentación completa con instalación, temas y referencia de API

// Add copy-to-clipboard buttons to all code blocks.
// Targets Hugo's .highlight wrapper (Chroma syntax highlighting) AND
// plain <pre> blocks (e.g. fenced code without a language specifier).
// Falls back to document.execCommand for older browsers.
(function () {
  'use strict';

  var i18n = (window.wavecast && window.wavecast.i18n) || {};
  var CODE_COPY_TITLE = i18n.code_copy_title || 'Copy code';
  var CODE_COPY_LABEL = i18n.code_copy_label || 'Copy code to clipboard';
  var CODE_COPIED = i18n.code_copied || 'Copied!';
  var CODE_COPIED_LABEL = i18n.code_copied_label || 'Code copied';

  // Collect both .highlight wrappers and standalone <pre> elements.
  // Filter out <pre> that are already inside .highlight (they get a button
  // via the parent).  Also skip <pre> that are empty or inside the
  // podcast-player shadow DOM.
  var targets = [];

  document.querySelectorAll('.highlight').forEach(function (el) {
    targets.push(el);
  });

  document.querySelectorAll('pre').forEach(function (el) {
    // Only standalone <pre> — not children of .highlight.
    if (el.closest('.highlight')) return;
    if (!el.textContent.trim()) return;
    targets.push(el);
  });

  targets.forEach(function (el) {
    // Ensure the container is positioned for the absolute button.
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.type = 'button';
    btn.title = CODE_COPY_TITLE;
    btn.setAttribute('aria-label', CODE_COPY_LABEL);
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
      '</svg>';

    btn.addEventListener('click', function () {
      var text;

      // For .highlight: prefer td:last-child code (line-number table layout),
      // then fall back to the first <code> element.
      if (el.classList.contains('highlight')) {
        var code = el.querySelector('td:last-child code');
        if (!code) code = el.querySelector('code');
        text = code ? code.textContent : el.textContent;
      } else {
        // Plain <pre>: grab text from <code> child or the pre itself.
        var codeEl = el.querySelector('code');
        text = codeEl ? codeEl.textContent : el.textContent;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showCopied(btn);
        }).catch(function () {
          fallbackCopy(btn, text, el);
        });
      } else {
        fallbackCopy(btn, text, el);
      }
    });

    el.insertBefore(btn, el.firstChild);
  });

  function showCopied(btn) {
    btn.classList.add('copied');
    btn.title = CODE_COPIED;
    btn.setAttribute('aria-label', CODE_COPIED_LABEL);
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.title = CODE_COPY_TITLE;
      btn.setAttribute('aria-label', CODE_COPY_LABEL);
    }, 2000);
  }

  function fallbackCopy(btn, text, container) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    container.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    container.removeChild(ta);
    showCopied(btn);
  }
})();

// Add copy-to-clipboard buttons to all code blocks on the page.
// Targets Hugo's .highlight wrapper (Chroma syntax highlighting).
// Falls back to document.execCommand for older browsers.
(function () {
  'use strict';

  document.querySelectorAll('.highlight').forEach(function (el) {
    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.type = 'button';
    btn.title = 'Copy code';
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
      '</svg>';

    btn.addEventListener('click', function () {
      // Extract text: if Hugo generated line numbers (table layout) the
      // code lives in td:last-child, otherwise the first <code> element.
      var code = el.querySelector('td:last-child code');
      if (!code) code = el.querySelector('code');
      var text = code ? code.textContent : el.textContent;

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
    btn.title = 'Copied!';
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.title = 'Copy code';
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

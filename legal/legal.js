// The one renderer behind /terms/ and /privacy/.
//
// 🔴 THE MARKDOWN FILE IS THE DOCUMENT (R69). Neither page holds a copy of the
// text: both fetch the same `.md` the app fetches and render it here.
//
// 🔴 …AND NEITHER HOLDS A COPY OF THIS. The two pages once differed in four
// places across 159 identical lines, which is R69's failure one level along —
// a rendering fix would have landed in one file with nothing to say the other
// existed. Every difference between them is now a declared VALUE on the script
// tag, and this file is the only copy of the machinery.
//
// The shell declares two things and nothing else:
//   data-source — the document to fetch, relative to the PAGE
//   data-title  — the document's name, for the heading and the failure sentence
(function () {
  var script = document.currentScript;
  var SOURCE = script.getAttribute('data-source');
  var TITLE = script.getAttribute('data-title');
  // ONE sentence template, one value substituted. "Terms of service" reads as
  // "the terms of service" mid-sentence and "Privacy policy" as "the privacy
  // policy", so the only transformation the template needs is the case.
  var NAME = TITLE.charAt(0).toLowerCase() + TITLE.slice(1);
  var FILE = SOURCE.split('/').pop();

  var host = document.getElementById('doc');

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // The dullest possible subset, matching `parseLegalMarkdown` in the app:
  // a `# ` title, italic `_…_` header lines, `## ` headings, blank-line
  // separated paragraphs, and a `- ` list item drawn as its own paragraph.
  function render(text) {
    var inHeader = true;
    var headerHtml = '';
    var bodyHtml = '';

    text.replace(/\r\n?/g, '\n').split(/\n\s*\n/).forEach(function (block) {
      block.split('\n').forEach(function (raw) {
        var line = raw.trim();
        if (!line) return;
        if (line.indexOf('## ') === 0) {
          inHeader = false;
          bodyHtml += '<h2>' + escapeHtml(line.slice(3).trim()) + '</h2>';
          return;
        }
        if (line.indexOf('# ') === 0) {
          headerHtml += '<h1>' + escapeHtml(line.slice(2).trim()) + '</h1>';
          return;
        }
        if (inHeader && line.length > 2 &&
            line.charAt(0) === '_' && line.charAt(line.length - 1) === '_') {
          headerHtml += '<p class="meta">' +
            escapeHtml(line.slice(1, -1).trim()) + '</p>';
          return;
        }
        inHeader = false;
        bodyHtml += '<p>' + escapeHtml(line) + '</p>';
      });
    });

    return '<div class="header">' + headerHtml + '</div>' + bodyHtml;
  }

  function fail() {
    // 🔴 Never a blank page. If the fetch fails the reader is told so plainly
    // and handed the raw file, which is the document itself.
    host.innerHTML =
      '<h1>' + escapeHtml(TITLE) + '</h1>' +
      '<p>We could not load the ' + escapeHtml(NAME) + ' just now — you may ' +
      'be offline, or the page may have failed to reach the file.</p>' +
      '<p>You can read the document directly: ' +
      '<a href="' + escapeHtml(SOURCE) + '">' + escapeHtml(FILE) + '</a>.</p>';
  }

  try {
    fetch(SOURCE, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then(function (text) {
        if (!text || !text.trim()) throw new Error('empty');
        host.innerHTML = render(text);
        var h1 = host.querySelector('h1');
        if (h1) document.title = 'Life Eco — ' + h1.textContent;
      })
      .catch(fail);
  } catch (e) {
    fail();
  }
})();

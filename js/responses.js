// Renders saved responses from localStorage into #responses-container

(function () {
  var STORAGE_KEY = 'rv_responses';
  var BC = window.BroadcastChannel ? new BroadcastChannel('rv_channel') : null;

  function safeText(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadResponses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('loadResponses error', e);
      return [];
    }
  }

  function render() {
    var container = document.getElementById('responses-container');
    if (!container) return;
    var responses = loadResponses();

    if (!responses.length) {
      container.innerHTML = '<p>No responses yet. Be the first to answer!</p>';
      return;
    }

    // newest first
    responses = responses.slice().reverse();

    var html = '<ul class="responses-list">';
    for (var i = 0; i < responses.length; i++) {
      var r = responses[i];
      html += '<li class="response-item">';
      html += '<div class="response-meta"><strong>' + safeText(r.timestampLocal || r.timestampISO || '') + '</strong></div>';
      html += '<div class="response-body">' + safeText(r.answer) + '</div>';
      html += '</li>';
    }
    html += '</ul>';
    container.innerHTML = html;
  }

  function clearAll() {
    if (!confirm('Clear all saved responses? This cannot be undone.')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (BC) BC.postMessage({ type: 'responses-cleared' });
    } catch (e) { /* ignore */ }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    var btn = document.getElementById('clear-responses');
    if (btn) btn.addEventListener('click', clearAll);
  });

  if (BC) {
    BC.addEventListener('message', function (ev) {
      if (!ev || !ev.data) return;
      if (ev.data.type === 'responses-updated' || ev.data.type === 'responses-cleared') {
        render();
      }
    });
  }
})();
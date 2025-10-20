// Save a single-question response with timestamp into localStorage and redirect to thank-you.html

(function () {
  var FORM_ID = 'day-form';
  var TEXT_ID = 'day-answer';
  var STORAGE_KEY = 'rv_responses';
  var BC = window.BroadcastChannel ? new BroadcastChannel('rv_channel') : null;

  function loadResponses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('loadResponses error', e);
      return [];
    }
  }

  function saveResponses(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      if (BC) BC.postMessage({ type: 'responses-updated' });
    } catch (e) {
      console.error('saveResponses error', e);
    }
  }

  function nowISO() { return new Date().toISOString(); }
  function nowLocale() { return new Date().toLocaleString(); }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById(FORM_ID);
    var textarea = document.getElementById(TEXT_ID);

    if (!form || !textarea) {
      console.warn('questionnaire.js: form or textarea not found', FORM_ID, TEXT_ID);
      return;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var text = textarea.value.trim();
      if (!text) {
        alert('Please enter an answer before submitting.');
        return;
      }

      var responses = loadResponses();
      responses.push({
        answer: text,
        timestampISO: nowISO(),
        timestampLocal: nowLocale()
      });
      saveResponses(responses);

      textarea.value = '';
      // Redirect to a thank-you page
      window.location.href = 'thank-you.html';
    });
  });
})();
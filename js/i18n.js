// i18n.js — language switcher for Barbers Hub
(function () {
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'bh_lang';

  let translations = {};
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  async function loadLang(lang) {
    const res = await fetch('lang/' + lang + '.json?v=' + Date.now());
    return await res.json();
  }

  function applyTranslations(t) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined && t[key] !== '') {
        el.innerHTML = t[key];
      }
    });
    if (t['page_title']) document.title = t['page_title'];
    document.documentElement.lang = currentLang;
  }

  function updateToggle() {
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = currentLang === 'en' ? 'LV' : 'EN';
  }

  async function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    translations = await loadLang(lang);
    applyTranslations(translations);
    updateToggle();
  }

  async function init() {
    translations = await loadLang(currentLang);
    applyTranslations(translations);
    updateToggle();

    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        switchLang(currentLang === 'en' ? 'lv' : 'en');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// i18n.js — language switcher for Barbers Hub
(function () {
  const DEFAULT_LANG = 'en';
  const SUPPORTED_LANGS = ['en', 'lv', 'ru'];
  const STORAGE_KEY = 'bh_lang';

  let translations = {};
  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

  if (SUPPORTED_LANGS.indexOf(currentLang) === -1) {
    currentLang = DEFAULT_LANG;
  }

  async function loadLang(lang) {
    const res = await fetch('lang/' + lang + '.json?v=' + Date.now());
    if (!res.ok) throw new Error('Could not load language: ' + lang);
    return await res.json();
  }

  function applyTranslations(t) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined && t[key] !== '') {
        el.innerHTML = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-aria-label');
      if (t[key] !== undefined && t[key] !== '') {
        el.setAttribute('aria-label', t[key]);
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-alt');
      if (t[key] !== undefined && t[key] !== '') {
        el.setAttribute('alt', t[key]);
      }
    });
    const pageTitleKey = document.body.getAttribute('data-page-title-key');
    if (pageTitleKey && t[pageTitleKey]) {
      document.title = t[pageTitleKey];
    } else if (t['page_title']) {
      document.title = t['page_title'];
    }
    document.documentElement.lang = currentLang;
    document.dispatchEvent(new CustomEvent('barbershub:languagechange', {
      detail: { lang: currentLang, translations: t }
    }));
  }

  function updateLanguageControls() {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      const isActive = btn.getAttribute('data-lang') === currentLang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  async function switchLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1 || lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    try {
      translations = await loadLang(lang);
      applyTranslations(translations);
    } catch (err) {
      translations = {};
    }
    updateLanguageControls();
  }

  async function init() {
    try {
      translations = await loadLang(currentLang);
      applyTranslations(translations);
    } catch (err) {
      translations = {};
    }
    updateLanguageControls();

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLang(btn.getAttribute('data-lang'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

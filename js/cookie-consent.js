(function () {
  'use strict';

  var analyticsId = window.GOOGLE_TAG_ID || '';
  var storageKey = window.COOKIE_CONSENT_STORAGE_KEY || 'cookie_consent_v1';
  var analyticsChoice = 'analytics';
  var necessaryChoice = 'necessary';

  window.googleAnalyticsConsentGranted = false;

  function updateGoogleConsent(isGranted) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      analytics_storage: isGranted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function loadGoogleAnalytics() {
    if (!analyticsId) return;

    window.googleAnalyticsConsentGranted = true;
    updateGoogleConsent(true);

    if (document.querySelector('script[data-google-tag-loader]')) return;

    var loader = document.createElement('script');
    loader.async = true;
    loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
    loader.setAttribute('data-google-tag-loader', analyticsId);
    document.head.appendChild(loader);

    window.gtag('js', new Date());
    window.gtag('config', analyticsId, { anonymize_ip: true });
  }

  function clearAnalyticsCookies() {
    var parentDomain = window.location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.' + parentDomain + '; SameSite=Lax';
    });
  }

  function readChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // If storage is unavailable, the banner will be shown again next visit.
    }
  }

  function start() {
    var banner = document.createElement('section');
    banner.id = 'cookie-consent-panel';
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-description');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cookie-consent__content">' +
        '<div class="cookie-consent__copy">' +
          '<strong id="cookie-consent-title">Sīkdatņu iestatījumi</strong>' +
          '<p id="cookie-consent-description">Šī vietne saglabā jūsu izvēli. Ar jūsu piekrišanu mēs izmantojam Google Analytics, lai saprastu vietnes lietojumu. Analītika netiek ielādēta pirms piekrišanas.</p>' +
        '</div>' +
        '<div class="cookie-consent__actions">' +
          '<button type="button" class="cookie-consent__button" data-cookie-choice="necessary">Tikai nepieciešamās</button>' +
          '<button type="button" class="cookie-consent__button" data-cookie-choice="analytics">Atļaut analītiku</button>' +
        '</div>' +
      '</div>';

    var settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'cookie-settings-trigger';
    settingsButton.textContent = 'Sīkdatņu iestatījumi';
    settingsButton.setAttribute('aria-controls', 'cookie-consent-panel');
    settingsButton.hidden = true;

    function showBanner() {
      banner.hidden = false;
      settingsButton.hidden = true;
    }

    function hideBanner() {
      banner.hidden = true;
      settingsButton.hidden = false;
    }

    function applyChoice(choice) {
      saveChoice(choice);
      if (choice === analyticsChoice) {
        loadGoogleAnalytics();
      } else {
        window.googleAnalyticsConsentGranted = false;
        updateGoogleConsent(false);
        clearAnalyticsCookies();
      }
      hideBanner();
    }

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-cookie-choice]');
      if (!button) return;
      applyChoice(button.getAttribute('data-cookie-choice'));
    });

    settingsButton.addEventListener('click', showBanner);

    document.body.appendChild(banner);
    document.body.appendChild(settingsButton);

    var savedChoice = readChoice();
    if (savedChoice === analyticsChoice) {
      loadGoogleAnalytics();
      hideBanner();
    } else if (savedChoice === necessaryChoice) {
      updateGoogleConsent(false);
      hideBanner();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();


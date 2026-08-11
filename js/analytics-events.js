// BARBERS HUB outbound conversion-intent tracking.
// Records only link destination category and page context; no personal data is collected.
(function () {
  function sendEvent(eventName, linkUrl) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, {
      link_url: linkUrl,
      page_path: window.location.pathname,
      audience: document.body.getAttribute('data-audience') || 'unknown',
      transport_type: 'beacon'
    });
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;

    var href = link.href || '';
    var host = '';
    try {
      host = new URL(href, window.location.href).hostname.toLowerCase();
    } catch (error) {
      return;
    }

    if (host.indexOf('fresha.com') !== -1) {
      sendEvent('client_booking_click', href);
    } else if (host === 'calendar.app.google') {
      sendEvent('barber_tour_click', href);
    } else if (host === 'wa.me') {
      sendEvent(document.body.getAttribute('data-audience') === 'barber' ? 'barber_whatsapp_click' : 'whatsapp_click', href);
    } else if (host.indexOf('stripe.com') !== -1) {
      sendEvent('day_pass_payment_click', href);
    } else if (host === 'forms.gle' || host.indexOf('docs.google.com') !== -1) {
      sendEvent('day_pass_form_click', href);
    } else if (href.indexOf('mailto:') === 0) {
      sendEvent('email_click', 'mailto');
    } else if (href.indexOf('tel:') === 0) {
      sendEvent('phone_click', 'tel');
    }
  });
})();

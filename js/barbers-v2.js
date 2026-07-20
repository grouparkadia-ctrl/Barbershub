(function () {
    var integrationConfig = {
        whatsappPhone: '37125774433',
        whatsappMessages: {
            en: 'Hi Barbers HUB, I want to book a Trial Day and ask about chair rental.',
            lv: 'Sveiki, Barbers HUB! Vēlos rezervēt izmēģinājuma dienu un uzzināt vairāk par krēsla nomu.'
        },
        fallbackEmail: 'barbersbronson@gmail.com',
        googleFormAction: '',
        googleFormEntries: {
            name: '',
            email: '',
            phone: ''
        }
    };

    function hasGoogleFormConfig() {
        return Boolean(
            integrationConfig.googleFormAction &&
            integrationConfig.googleFormEntries.name &&
            integrationConfig.googleFormEntries.email &&
            integrationConfig.googleFormEntries.phone
        );
    }

    var currentLang = document.documentElement.lang || 'en';
    var translations = {};

    function translate(key, fallback) {
        return translations[key] || fallback;
    }

    function buildWhatsAppUrl() {
        var message = integrationConfig.whatsappMessages[currentLang] || integrationConfig.whatsappMessages.en;
        return 'https://wa.me/' + integrationConfig.whatsappPhone + '?text=' + encodeURIComponent(message);
    }

    function setAudience(target) {
        document.querySelectorAll('[data-audience-tab]').forEach(function (tab) {
            var isActive = tab.getAttribute('data-audience-tab') === target;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        document.querySelectorAll('[data-audience-panel]').forEach(function (panel) {
            var isActive = panel.getAttribute('data-audience-panel') === target;
            panel.classList.toggle('active', isActive);
            panel.hidden = !isActive;
        });
    }

    function initAudienceSwitcher() {
        document.querySelectorAll('[data-audience-tab]').forEach(function (tab) {
            tab.addEventListener('click', function () {
                setAudience(tab.getAttribute('data-audience-tab'));
            });
        });

        document.querySelectorAll('[data-audience-link]').forEach(function (link) {
            link.addEventListener('click', function () {
                setAudience(link.getAttribute('data-audience-link'));
            });
        });
    }

    function initWhatsAppLinks() {
        document.querySelectorAll('[data-whatsapp-link]').forEach(function (link) {
            link.href = buildWhatsAppUrl();
        });
    }

    function setFormStatus(form, message, isError) {
        var status = form.querySelector('[data-form-status]');
        if (!status) return;

        status.textContent = message;
        status.classList.toggle('is-error', Boolean(isError));
    }

    function submitToGoogleForm(form, data) {
        var entries = integrationConfig.googleFormEntries;
        var body = new URLSearchParams();

        body.append(entries.name, data.get('name') || '');
        body.append(entries.email, data.get('email') || '');
        body.append(entries.phone, data.get('phone') || '');

        return fetch(integrationConfig.googleFormAction, {
            method: 'POST',
            mode: 'no-cors',
            body: body
        });
    }

    function openMailFallback(data) {
        var subject = encodeURIComponent(translate('v2_mail_subject', 'Barbers HUB Trial Day request'));
        var body = encodeURIComponent(
            translate('v2_form_name', 'Full name') + ': ' + (data.get('name') || '') + '\n' +
            translate('v2_form_email', 'Email') + ': ' + (data.get('email') || '') + '\n' +
            translate('v2_form_phone', 'Phone number') + ': ' + (data.get('phone') || '')
        );

        window.location.href = 'mailto:' + integrationConfig.fallbackEmail + '?subject=' + subject + '&body=' + body;
    }

    function initTourForm() {
        var form = document.querySelector('[data-tour-form]');
        if (!form) return;

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var data = new FormData(form);

            if (!hasGoogleFormConfig()) {
                setFormStatus(form, translate('v2_form_opening_email', 'Opening an email draft so you can send your request.'), false);
                openMailFallback(data);
                return;
            }

            setFormStatus(form, translate('v2_form_sending', 'Sending request...'), false);
            submitToGoogleForm(form, data)
                .then(function () {
                    form.reset();
                    setFormStatus(form, translate('v2_form_sent', 'Request sent. We will contact you to arrange your Trial Day.'), false);
                })
                .catch(function () {
                    setFormStatus(form, translate('v2_form_email_fallback', 'Could not send the request directly. Opening an email draft instead.'), true);
                    openMailFallback(data);
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initWhatsAppLinks();
        initAudienceSwitcher();
        initTourForm();
    });

    document.addEventListener('barbershub:languagechange', function (event) {
        currentLang = event.detail.lang;
        translations = event.detail.translations || {};
        initWhatsAppLinks();
    });
})();

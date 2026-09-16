(function () {
    var integrationConfig = {
        whatsappPhone: '37125774433',
        whatsappMessages: {
            en: 'Hi BARBERS HUB! I have a question about reserving a workspace at 0.10 €/min.',
            lv: 'Sveiki, BARBERS HUB! Man ir jautājums par darba vietas rezervāciju par 0,10 €/min.',
            ru: 'Здравствуйте, BARBERS HUB! У меня вопрос о бронировании рабочего места по цене 0,10 €/мин.'
        },
        fallbackEmail: 'info@barbershub.lv',
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

    function initHeroFocalPoints() {
        var hero = document.querySelector('.for-barbers-page .hero');
        var slider = document.querySelector('.for-barbers-page .hero_slider');
        if (!hero || !slider) return;

        function applyActiveFocalPoint() {
            var activeSlide = slider.querySelector('.swiper-slide-active') || slider.querySelector('.swiper-slide');
            if (!activeSlide) return;

            var desktopPosition = activeSlide.getAttribute('data-position') || 'center center';
            var mobilePosition = activeSlide.getAttribute('data-position-mobile') || desktopPosition;

            hero.style.setProperty('--hero-bg-position', desktopPosition);
            hero.style.setProperty('--hero-bg-position-mobile', mobilePosition);
        }

        applyActiveFocalPoint();

        if (slider.swiper && typeof slider.swiper.on === 'function') {
            ['activeIndexChange', 'slideChange', 'transitionEnd'].forEach(function (eventName) {
                slider.swiper.on(eventName, applyActiveFocalPoint);
            });
        }

        window.addEventListener('resize', applyActiveFocalPoint);
    }

    function initWhatsAppLinks() {
        document.querySelectorAll('[data-whatsapp-link]').forEach(function (link) {
            link.href = buildWhatsAppUrl();
        });
    }

    function reorderFinalSections() {
        var panel = document.querySelector('[data-audience-panel="barbers"]');
        if (!panel) return;
        [
            panel.querySelector('#apply'),
            panel.querySelector('.v2-founder'),
            panel.querySelector('.v2-success'),
            panel.querySelector('#faq')
        ].forEach(function (section) {
            if (section) panel.appendChild(section);
        });
    }

    function initCarousels() {
        document.querySelectorAll('[data-card-carousel], [data-image-carousel]').forEach(function (carousel, carouselIndex) {
            var slides = Array.prototype.slice.call(carousel.children).filter(function (child) {
                return child.matches('article, a');
            });
            if (slides.length < 2 || carousel.dataset.carouselReady === 'true') return;

            var current = 0;
            var startX = null;
            var timer = null;
            var isImageCarousel = carousel.hasAttribute('data-image-carousel');
            var controls = document.createElement('div');
            var previous = document.createElement('button');
            var next = document.createElement('button');
            var labelKey = carousel.getAttribute('data-carousel-label-key') || '';
            var label = translate(labelKey, carousel.getAttribute('aria-label') || 'Carousel');

            carousel.dataset.carouselReady = 'true';
            carousel.classList.add('is-enhanced');
            carousel.id = carousel.id || 'v2-carousel-' + (carouselIndex + 1);
            controls.className = 'v2-carousel-controls v2-carousel-controls--overlay';
            controls.setAttribute('aria-controls', carousel.id);
            previous.type = 'button';
            next.type = 'button';
            previous.className = 'v2-carousel-button';
            next.className = 'v2-carousel-button';
            previous.dataset.carouselDirection = 'previous';
            next.dataset.carouselDirection = 'next';
            previous.dataset.carouselLabelKey = labelKey;
            next.dataset.carouselLabelKey = labelKey;
            previous.innerHTML = '<span aria-hidden="true">←</span>';
            next.innerHTML = '<span aria-hidden="true">→</span>';
            previous.setAttribute('aria-label', label + ': ' + translate('v2_carousel_previous', 'previous'));
            next.setAttribute('aria-label', label + ': ' + translate('v2_carousel_next', 'next'));

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    var active = slideIndex === current;
                    slide.hidden = !active;
                    slide.classList.toggle('is-active', active);
                    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
                    if (slide.tagName === 'A') slide.tabIndex = active ? 0 : -1;
                });
            }

            function stopAutoplay() {
                if (timer) window.clearInterval(timer);
                timer = null;
            }

            function startAutoplay() {
                if (isImageCarousel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                stopAutoplay();
                timer = window.setInterval(function () { show(current + 1); }, 5200);
            }

            previous.addEventListener('click', function () { show(current - 1); });
            next.addEventListener('click', function () { show(current + 1); });
            carousel.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
                if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
            });
            carousel.addEventListener('touchstart', function (event) {
                startX = event.touches[0].clientX;
            }, { passive: true });
            carousel.addEventListener('touchend', function (event) {
                if (startX === null) return;
                var distance = event.changedTouches[0].clientX - startX;
                if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
                startX = null;
            }, { passive: true });

            if (!isImageCarousel) {
                carousel.addEventListener('mouseenter', stopAutoplay);
                carousel.addEventListener('mouseleave', startAutoplay);
                carousel.addEventListener('focusin', stopAutoplay);
                carousel.addEventListener('focusout', startAutoplay);
            }

            if (isImageCarousel) {
                controls.appendChild(previous);
                controls.appendChild(next);
                carousel.appendChild(controls);
            }
            show(0);
            startAutoplay();
        });
    }

    function animateHeroCopy() {
        var copy = document.querySelector('.v2-dynamic-copy');
        if (!copy) return;
        var text = copy.textContent.trim();
        var sentences = (text.match(/.*?(?:\s+[—-]\s+|[.!?](?:\s+|$)|$)/g) || [text]).filter(function (part) {
            return part.trim().length > 0;
        });
        copy.textContent = '';
        copy.setAttribute('aria-label', text);
        sentences.forEach(function (sentence, index) {
            var segment = document.createElement('span');
            segment.textContent = sentence;
            segment.style.setProperty('--reveal-order', index);
            copy.appendChild(segment);
        });
    }

    function updateCarouselLabels() {
        document.querySelectorAll('[data-carousel-direction]').forEach(function (button) {
            var carousel = document.getElementById(button.parentElement.getAttribute('aria-controls'));
            var labelKey = button.dataset.carouselLabelKey || '';
            var label = translate(labelKey, carousel && carousel.getAttribute('aria-label') || 'Carousel');
            var directionKey = button.dataset.carouselDirection === 'previous' ? 'v2_carousel_previous' : 'v2_carousel_next';
            var fallback = button.dataset.carouselDirection === 'previous' ? 'previous' : 'next';
            button.setAttribute('aria-label', label + ': ' + translate(directionKey, fallback));
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
        var subject = encodeURIComponent(translate('v2_mail_subject', 'BARBERS HUB workspace request'));
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
                    setFormStatus(form, translate('v2_form_sent', 'Request sent. We will contact you about the workspace.'), false);
                })
                .catch(function () {
                    setFormStatus(form, translate('v2_form_email_fallback', 'Could not send the request directly. Opening an email draft instead.'), true);
                    openMailFallback(data);
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        reorderFinalSections();
        initWhatsAppLinks();
        initAudienceSwitcher();
        initHeroFocalPoints();
        initCarousels();
        animateHeroCopy();
        initTourForm();
    });

    document.addEventListener('barbershub:languagechange', function (event) {
        currentLang = event.detail.lang;
        translations = event.detail.translations || {};
        initWhatsAppLinks();
        updateCarouselLabels();
        animateHeroCopy();
    });
})();


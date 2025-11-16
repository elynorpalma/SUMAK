document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initSmoothScroll();
    initAnimationsOnScroll();
    checkAuthStatus();
});

function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.getElementById('header');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
            navToggle.setAttribute(
                'aria-expanded',
                navMenu.classList.contains('is-open')
            );
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('is-open') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        lastScroll = currentScroll;
    });
}
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#' || !href) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                smoothScrollTo(href);

                history.pushState(null, null, href);
            }
        });
    });
}

function initScrollEffects() {
    const style = document.createElement('style');
    style.textContent = `
        .header--scrolled {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-in.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

function initAnimationsOnScroll() {
    const animatedElements = document.querySelectorAll(
        '.solution-card, .step, .impact-metric, .pricing-card, .testimonial-card'
    );

    animatedElements.forEach(el => el.classList.add('fade-in'));

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const navActions = document.querySelector('.nav__actions');

    if (currentUser && navActions) {
        navActions.innerHTML = `
            <a href="${getDashboardUrl(currentUser.role)}" class="btn btn--secondary">
                Mi Panel
            </a>
            <button onclick="logout()" class="btn btn--outline">
                Cerrar Sesión
            </button>
        `;
    }
}

/**
 * Obtiene la URL del dashboard según el rol
 * @param {string} role - Rol del usuario
 * @returns {string} - URL del dashboard
 */
function getDashboardUrl(role) {
    const dashboards = {
        'emprendedor': 'dashboard-emprendedor.html',
        'facilitador': 'dashboard-facilitador.html',
        'cliente': 'dashboard-cliente.html'
    };
    return dashboards[role] || 'dashboard-emprendedor.html';
}

window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
});
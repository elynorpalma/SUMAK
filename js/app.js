/**
 * APLICACIÓN PRINCIPAL
 * Archivo: js/app.js
 * Descripción: Lógica principal de la landing page
 * Implementa navegación, scroll, y funcionalidades generales
 */

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initSmoothScroll();
    initAnimationsOnScroll();
    checkAuthStatus();
});

// ========================================
// NAVEGACIÓN
// US-017: Navegación clara y accesible
// ========================================

/**
 * Inicializa el sistema de navegación
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.getElementById('header');

    // Toggle menú móvil
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
            navToggle.setAttribute(
                'aria-expanded',
                navMenu.classList.contains('is-open')
            );
        });
    }

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('is-open')) {
                navMenu.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('is-open') &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Cambiar apariencia del header al hacer scroll
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

// ========================================
// SMOOTH SCROLL
// ========================================

/**
 * Inicializa el scroll suave para enlaces internos
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Ignorar enlaces sin destino válido
            if (href === '#' || !href) return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                smoothScrollTo(href);

                // Actualizar URL sin recargar
                history.pushState(null, null, href);
            }
        });
    });
}

// ========================================
// EFECTOS DE SCROLL
// ========================================

/**
 * Inicializa efectos visuales al hacer scroll
 */
function initScrollEffects() {
    // Agregar clase CSS para efectos
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

// ========================================
// ANIMACIONES AL HACER SCROLL
// Intersection Observer API
// ========================================

/**
 * Inicializa animaciones cuando elementos entran en viewport
 */
function initAnimationsOnScroll() {
    const animatedElements = document.querySelectorAll(
        '.solution-card, .step, .impact-metric, .pricing-card, .testimonial-card'
    );

    // Agregar clase inicial
    animatedElements.forEach(el => el.classList.add('fade-in'));

    // Configurar Intersection Observer
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

// ========================================
// VERIFICACIÓN DE AUTENTICACIÓN
// US-035: Perfil del usuario
// ========================================

/**
 * Verifica si hay usuario logueado y actualiza la UI
 */
function checkAuthStatus() {
    const currentUser = getCurrentUser();
    const navActions = document.querySelector('.nav__actions');

    if (currentUser && navActions) {
        // Usuario logueado - mostrar menú personalizado
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

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================

window.addEventListener('error', (e) => {
    console.error('Error capturado:', e.error);
    // En producción, enviar a servicio de logging
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
    // En producción, enviar a servicio de logging
});
/**
 * UTILIDADES GENERALES
 * Archivo: js/utils.js
 * Descripción: Funciones helper y utilidades reutilizables
 */

// ========================================
// VALIDACIÓN DE FORMULARIOS
// US-017: Validación en tiempo real
// ========================================

/**
 * Valida un campo de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Valida un número de teléfono peruano
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
const validatePhone = (phone) => {
    // Acepta 9 dígitos con o sin espacios
    const cleaned = phone.replace(/\s/g, '');
    const regex = /^9\d{8}$/;
    return regex.test(cleaned);
};

/**
 * Valida contraseña (mínimo 6 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es válida
 */
const validatePassword = (password) => {
    return password.length >= 6;
};

/**
 * Muestra error en un campo de formulario
 * @param {HTMLElement} input - Input element
 * @param {string} message - Mensaje de error
 */
const showFieldError = (input, message) => {
    const errorElement = document.getElementById(`${input.name}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        input.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
    }
};

/**
 * Limpia el error de un campo
 * @param {HTMLElement} input - Input element
 */
const clearFieldError = (input) => {
    const errorElement = document.getElementById(`${input.name}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
    }
};

/**
 * Valida un campo individual en tiempo real
 * @param {HTMLElement} input - Input element
 * @returns {boolean} - True si es válido
 */
const validateField = (input) => {
    const { name, value, type } = input;

    clearFieldError(input);

    // Validación según tipo de campo
    switch (name) {
        case 'email':
            if (!validateEmail(value)) {
                showFieldError(input, 'Ingresa un correo electrónico válido');
                return false;
            }
            break;

        case 'phone':
            if (!validatePhone(value)) {
                showFieldError(input, 'Ingresa un teléfono válido (9 dígitos)');
                return false;
            }
            break;

        case 'password':
            if (!validatePassword(value)) {
                showFieldError(input, 'La contraseña debe tener al menos 6 caracteres');
                return false;
            }
            break;

        case 'name':
        case 'businessName':
            if (value.trim().length < 2) {
                showFieldError(input, 'Este campo debe tener al menos 2 caracteres');
                return false;
            }
            break;

        default:
            if (input.hasAttribute('required') && !value.trim()) {
                showFieldError(input, 'Este campo es obligatorio');
                return false;
            }
    }

    return true;
};

// ========================================
// ALMACENAMIENTO LOCAL
// US-035: Perfil del usuario
// ========================================

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave
 * @param {*} data - Datos a guardar
 */
const saveToLocalStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
};

/**
 * Obtiene datos de localStorage
 * @param {string} key - Clave
 * @returns {*} - Datos recuperados
 */
const getFromLocalStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error al leer de localStorage:', error);
        return null;
    }
};

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave
 */
const removeFromLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
        return false;
    }
};

// ========================================
// GESTIÓN DE SESIÓN
// US-035: Perfil del usuario
// ========================================

/**
 * Obtiene el usuario actual
 * @returns {Object|null} - Usuario o null
 */
const getCurrentUser = () => {
    return getFromLocalStorage('currentUser');
};

/**
 * Guarda el usuario actual
 * @param {Object} user - Datos del usuario
 */
const setCurrentUser = (user) => {
    saveToLocalStorage('currentUser', user);
};

/**
 * Cierra la sesión del usuario
 */
const logout = () => {
    removeFromLocalStorage('currentUser');
    window.location.href = 'index.html';
};

/**
 * Verifica si hay un usuario logueado
 * @returns {boolean}
 */
const isAuthenticated = () => {
    return getCurrentUser() !== null;
};

/**
 * Redirige a la página correspondiente según el rol del usuario
 * @param {string} role - Rol del usuario
 */
const redirectToDashboard = (role) => {
    const dashboards = {
        'emprendedor': 'dashboard-emprendedor.html',
        'facilitador': 'dashboard-facilitador.html',
        'cliente': 'dashboard-cliente.html'
    };

    const destination = dashboards[role] || 'dashboard-emprendedor.html';
    window.location.href = destination;
};

// ========================================
// UTILIDADES DE UI
// ========================================

/**
 * Muestra un toast notification
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 */
const showToast = (message, type = 'info') => {
    // Crear elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Agregar estilos inline si no existen en CSS
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        backgroundColor: type === 'error' ? '#E53935' : 
                         type === 'success' ? '#4CAF50' : 
                         type === 'warning' ? '#FBC02D' : '#2196F3',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(toast);

    // Remover después de 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

/**
 * Muestra un loader en un botón
 * @param {HTMLElement} button - Botón
 * @param {boolean} show - Mostrar u ocultar
 */
const toggleButtonLoader = (button, show) => {
    if (show) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
            Cargando...
        `;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Enviar';
    }
};

/**
 * Scroll suave a un elemento
 * @param {string} selector - Selector del elemento
 */
const smoothScrollTo = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

/**
 * Debounce function para optimizar eventos
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ========================================
// ANIMACIONES CSS
// ========================================

// Agregar estilos de animación al documento
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .has-error {
        border-color: #E53935 !important;
    }
`;
document.head.appendChild(style);

// ========================================
// EXPORTAR FUNCIONES
// ========================================

// Si se usa como módulo ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePhone,
        validatePassword,
        validateField,
        showFieldError,
        clearFieldError,
        saveToLocalStorage,
        getFromLocalStorage,
        removeFromLocalStorage,
        getCurrentUser,
        setCurrentUser,
        logout,
        isAuthenticated,
        redirectToDashboard,
        showToast,
        toggleButtonLoader,
        smoothScrollTo,
        debounce
    };
}
/**
 * Obtiene la lista de usuarios registrados
 * @returns {Array} - Array de usuarios
 */
function getUsers() {
    const users = localStorage.getItem('sumak_users');
    return users ? JSON.parse(users) : [];
}
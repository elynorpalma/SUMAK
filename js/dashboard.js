/**
 * DASHBOARD
 * Archivo: js/dashboard.js
 * Descripción: Lógica común de los dashboards según rol de usuario
 * Implementa US-014, US-020, US-022, US-045, US-059
 */

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar según rol
    initDashboard(currentUser);
    initUserMenu();
    initNotifications();
});

// ========================================
// INICIALIZACIÓN GENERAL DEL DASHBOARD
// ========================================

/**
 * Inicializa el dashboard según el rol del usuario
 * @param {Object} user - Usuario actual
 */
function initDashboard(user) {
    // Actualizar información del usuario en la UI
    updateUserInfo(user);

    // Inicializar funciones específicas según rol
    switch (user.role) {
        case 'emprendedor':
            initEmprendedorDashboard(user);
            break;
        case 'facilitador':
            initFacilitadorDashboard(user);
            break;
        case 'cliente':
            initClienteDashboard(user);
            break;
    }
}

/**
 * Actualiza la información del usuario en la UI
 * @param {Object} user - Usuario actual
 */
function updateUserInfo(user) {
    // Nombre del usuario
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });

    // Email del usuario
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });

    // Nombre del negocio (para emprendedores)
    if (user.businessName) {
        const businessNameElements = document.querySelectorAll('[data-business-name]');
        businessNameElements.forEach(el => {
            el.textContent = user.businessName;
        });
    }

    // Avatar con iniciales
    const avatarElements = document.querySelectorAll('[data-user-avatar]');
    avatarElements.forEach(el => {
        const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        el.textContent = initials;
    });
}

// ========================================
// DASHBOARD DEL EMPRENDEDOR
// US-020: Recibir microtareas prácticas y accionables
// US-022: Ver progreso y métricas simples
// ========================================

function initEmprendedorDashboard(user) {
    loadTasks(user);
    loadProgress(user);
    loadMetrics(user);
    initTaskActions();
}

/**
 * Carga las microtareas del usuario
 * US-020: Recibir microtareas prácticas y accionables
 */
function loadTasks(user) {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    const tasks = user.personalizedPath || [];

    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>¡Todo listo!</h3>
                <p>No tienes tareas pendientes por ahora</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <article class="task-card" data-task-id="${task.id}">
            <div class="task-card__header">
                <span class="task-card__badge task-card__badge--${task.priority}">
                    ${getPriorityLabel(task.priority)}
                </span>
                <span class="task-card__category">${task.category}</span>
            </div>
            <h3 class="task-card__title">${task.title}</h3>
            <div class="task-card__meta">
                <span class="task-card__time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    ${task.timeEstimate}
                </span>
                <span class="task-card__difficulty">${task.difficulty}</span>
            </div>
            <div class="task-card__actions">
                <button class="btn btn--primary" onclick="startTask(${task.id})">
                    Comenzar
                </button>
                <button class="btn btn--outline" onclick="viewTaskDetails(${task.id})">
                    Ver detalles
                </button>
            </div>
        </article>
    `).join('');
}

/**
 * Carga el progreso del usuario
 * US-022: Ver progreso y métricas simples
 */
function loadProgress(user) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!progressBar || !progressText) return;

    // Calcular progreso (simulado)
    const totalTasks = user.personalizedPath?.length || 0;
    const completedTasks = user.completedTasks?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;

    // Agregar animación
    progressBar.style.transition = 'width 1s ease-out';
}

/**
 * Carga las métricas del negocio
 * US-022: Ver progreso y métricas simples
 */
function loadMetrics(user) {
    // Métricas simuladas - en producción vendrían de la API
    const metrics = {
        tasksCompleted: user.completedTasks?.length || 0,
        currentStreak: 7, // días consecutivos
        totalBadges: 3,
        weeklyActivity: 85 // porcentaje
    };

    // Actualizar elementos en el DOM
    updateMetricElement('tasks-completed', metrics.tasksCompleted);
    updateMetricElement('current-streak', `${metrics.currentStreak} días`);
    updateMetricElement('total-badges', metrics.totalBadges);
    updateMetricElement('weekly-activity', `${metrics.weeklyActivity}%`);
}

function updateMetricElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Inicializa las acciones de tareas
 */
function initTaskActions() {
    // Botones para completar tarea rápida
    const quickCompleteButtons = document.querySelectorAll('[data-quick-complete]');
    quickCompleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = btn.dataset.taskId;
            completeTask(taskId);
        });
    });
}

/**
 * Inicia una tarea
 * US-020: Recibir microtareas prácticas y accionables
 * @param {number} taskId - ID de la tarea
 */
function startTask(taskId) {
    const user = getCurrentUser();
    const task = user.personalizedPath?.find(t => t.id === taskId);

    if (!task) return;

    // Abrir modal o página de tarea
    showToast(`Iniciando: ${task.title}`, 'info');

    // En una implementación completa, aquí se abriría un modal o se navegaría
    // a una página dedicada para completar la tarea con:
    // - Instrucciones detalladas
    // - Campo para subir evidencias (US-021)
    // - Formulario de validación
}

/**
 * Ver detalles de una tarea
 * @param {number} taskId - ID de la tarea
 */
function viewTaskDetails(taskId) {
    showToast('Cargando detalles de la tarea...', 'info');
    // Implementación completa mostraría un modal con detalles
}

/**
 * Completa una tarea
 * US-021: Subir evidencias
 * @param {number} taskId - ID de la tarea
 */
function completeTask(taskId) {
    const user = getCurrentUser();

    // Agregar tarea a completadas
    if (!user.completedTasks) {
        user.completedTasks = [];
    }

    user.completedTasks.push({
        id: taskId,
        completedAt: new Date().toISOString()
    });

    // Actualizar usuario
    setCurrentUser(user);

    // Actualizar UI
    loadTasks(user);
    loadProgress(user);
    loadMetrics(user);

    showToast('¡Tarea completada! 🎉', 'success');
}

// ========================================
// DASHBOARD DEL FACILITADOR
// US-045: Crear microtareas prácticas
// US-059: Ver progreso de alumnos en tablero
// ========================================

function initFacilitadorDashboard(user) {
    loadStudents(user);
    initTaskCreation();
    initStudentFilters();
}

/**
 * Carga la lista de estudiantes
 * US-059: Ver progreso de alumnos en tablero
 */
function loadStudents(user) {
    const studentsGrid = document.getElementById('students-grid');
    if (!studentsGrid) return;

    // Estudiantes simulados
    const students = [
        { id: 1, name: 'María González', progress: 75, status: 'activo', lastActivity: '2 horas' },
        { id: 2, name: 'Carlos Mendoza', progress: 45, status: 'activo', lastActivity: '1 día' },
        { id: 3, name: 'Ana Quispe', progress: 90, status: 'activo', lastActivity: '30 min' },
        { id: 4, name: 'José Fernández', progress: 20, status: 'rezagado', lastActivity: '5 días' }
    ];

    studentsGrid.innerHTML = students.map(student => `
        <article class="student-card" data-student-id="${student.id}">
            <div class="student-card__header">
                <div class="student-card__avatar">${getInitials(student.name)}</div>
                <div class="student-card__info">
                    <h3 class="student-card__name">${student.name}</h3>
                    <span class="student-card__status student-card__status--${student.status}">
                        ${student.status}
                    </span>
                </div>
            </div>
            <div class="student-card__progress">
                <div class="progress-bar">
                    <div class="progress-bar__fill" style="width: ${student.progress}%"></div>
                </div>
                <span class="student-card__progress-text">${student.progress}%</span>
            </div>
            <div class="student-card__meta">
                <span>Última actividad: ${student.lastActivity}</span>
            </div>
            <div class="student-card__actions">
                <button class="btn btn--outline btn--small" onclick="viewStudentDetail(${student.id})">
                    Ver detalle
                </button>
                <button class="btn btn--outline btn--small" onclick="contactStudent(${student.id})">
                    Contactar
                </button>
            </div>
        </article>
    `).join('');
}

/**
 * Inicializa la creación de microtareas
 * US-045: Crear microtareas prácticas
 */
function initTaskCreation() {
    const createTaskBtn = document.getElementById('create-task-btn');
    if (!createTaskBtn) return;

    createTaskBtn.addEventListener('click', () => {
        showToast('Abriendo editor de microtareas...', 'info');
        // En implementación completa, abriría un modal con formulario
    });
}

/**
 * Inicializa los filtros de estudiantes
 */
function initStudentFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterStudents(filter);

            // Actualizar UI de botones activos
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Filtra estudiantes por estado
 * @param {string} filter - Filtro a aplicar
 */
function filterStudents(filter) {
    const studentCards = document.querySelectorAll('.student-card');

    studentCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
        } else {
            const status = card.querySelector('.student-card__status').classList;
            card.style.display = status.contains(`student-card__status--${filter}`) ? 'block' : 'none';
        }
    });
}

/**
 * Ver detalle de un estudiante
 * @param {number} studentId - ID del estudiante
 */
function viewStudentDetail(studentId) {
    showToast('Cargando perfil del estudiante...', 'info');
    // Implementación completa mostraría un modal con detalles
}

/**
 * Contactar a un estudiante
 * @param {number} studentId - ID del estudiante
 */
function contactStudent(studentId) {
    showToast('Abriendo chat...', 'info');
    // Implementación completa abriría un chat o formulario de mensaje
}

// ========================================
// DASHBOARD DEL CLIENTE
// US-029: Ver información detallada del negocio
// US-041: Ver catálogo visual del negocio
// ========================================

function initClienteDashboard(user) {
    loadNearbyBusinesses();
    loadFavoriteBusinesses(user);
    initBusinessFilters();
}

/**
 * Carga negocios cercanos
 * US-029: Ver información detallada del negocio
 */
function loadNearbyBusinesses() {
    const businessesGrid = document.getElementById('businesses-grid');
    if (!businessesGrid) return;

    // Negocios simulados
    const businesses = [
        {
            id: 1,
            name: 'Bodega La Esquina',
            category: 'Bodega',
            rating: 4.5,
            certified: true,
            distance: '0.5 km',
            image: 'assets/business-1.jpg'
        },
        {
            id: 2,
            name: 'Repostería Dulce María',
            category: 'Gastronomía',
            rating: 4.8,
            certified: true,
            distance: '1.2 km',
            image: 'assets/business-2.jpg'
        },
        {
            id: 3,
            name: 'Taller de Costura Ana',
            category: 'Textil',
            rating: 4.3,
            certified: false,
            distance: '2.0 km',
            image: 'assets/business-3.jpg'
        }
    ];

    businessesGrid.innerHTML = businesses.map(business => `
        <article class="business-card" data-business-id="${business.id}">
            <div class="business-card__image">
                <img src="${business.image}" alt="${business.name}" loading="lazy">
                ${business.certified ? `
                    <span class="business-card__badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Certificado SUMAK
                    </span>
                ` : ''}
            </div>
            <div class="business-card__content">
                <h3 class="business-card__name">${business.name}</h3>
                <span class="business-card__category">${business.category}</span>
                <div class="business-card__rating">
                    ${renderStars(business.rating)}
                    <span>${business.rating}</span>
                </div>
                <span class="business-card__distance">📍 ${business.distance}</span>
                <div class="business-card__actions">
                    <button class="btn btn--primary btn--small" onclick="viewBusinessDetail(${business.id})">
                        Ver más
                    </button>
                    <button class="btn btn--outline btn--small" onclick="toggleFavorite(${business.id})">
                        ♥
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

/**
 * Carga negocios favoritos del usuario
 * @param {Object} user - Usuario actual
 */
function loadFavoriteBusinesses(user) {
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) return;

    const favorites = user.favoriteBusinesses || [];

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <p>Aún no tienes negocios favoritos</p>
            </div>
        `;
    }
}

/**
 * Inicializa los filtros de negocios
 */
function initBusinessFilters() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    categoryFilter.addEventListener('change', (e) => {
        const category = e.target.value;
        filterBusinesses(category);
    });
}

/**
 * Filtra negocios por categoría
 * @param {string} category - Categoría a filtrar
 */
function filterBusinesses(category) {
    const businessCards = document.querySelectorAll('.business-card');

    businessCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            const cardCategory = card.querySelector('.business-card__category').textContent;
            card.style.display = cardCategory === category ? 'block' : 'none';
        }
    });
}

/**
 * Ver detalle de un negocio
 * US-029: Ver información detallada del negocio
 * @param {number} businessId - ID del negocio
 */
function viewBusinessDetail(businessId) {
    showToast('Cargando información del negocio...', 'info');
    // Implementación completa mostraría un modal con detalles completos
}

/**
 * Alternar favorito
 * US-031: Guardar emprendedores favoritos
 * @param {number} businessId - ID del negocio
 */
function toggleFavorite(businessId) {
    const user = getCurrentUser();

    if (!user.favoriteBusinesses) {
        user.favoriteBusinesses = [];
    }

    const index = user.favoriteBusinesses.indexOf(businessId);

    if (index > -1) {
        user.favoriteBusinesses.splice(index, 1);
        showToast('Eliminado de favoritos', 'info');
    } else {
        user.favoriteBusinesses.push(businessId);
        showToast('Agregado a favoritos ♥', 'success');
    }

    setCurrentUser(user);
}

// ========================================
// MENÚ DE USUARIO
// US-035: Perfil del usuario
// ========================================

function initUserMenu() {
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userMenu = document.getElementById('user-menu');

    if (!userMenuToggle || !userMenu) return;

    userMenuToggle.addEventListener('click', () => {
        userMenu.classList.toggle('is-open');
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!userMenuToggle.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.remove('is-open');
        }
    });

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                logout();
            }
        });
    }
}

// ========================================
// NOTIFICACIONES
// US-001: Recibir recordatorios de microtareas
// ========================================

function initNotifications() {
    const notificationsBell = document.getElementById('notifications-bell');
    const notificationsPanel = document.getElementById('notifications-panel');

    if (!notificationsBell || !notificationsPanel) return;

    notificationsBell.addEventListener('click', () => {
        notificationsPanel.classList.toggle('is-open');
        loadNotifications();
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!notificationsBell.contains(e.target) && !notificationsPanel.contains(e.target)) {
            notificationsPanel.classList.remove('is-open');
        }
    });
}

/**
 * Carga las notificaciones del usuario
 */
function loadNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) return;

    // Notificaciones simuladas
    const notifications = [
        {
            id: 1,
            type: 'task',
            message: 'Tienes una nueva microtarea disponible',
            time: '5 min',
            read: false
        },
        {
            id: 2,
            type: 'achievement',
            message: '¡Ganaste una nueva insignia!',
            time: '2 horas',
            read: false
        },
        {
            id: 3,
            type: 'message',
            message: 'Tu mentor respondió tu consulta',
            time: '1 día',
            read: true
        }
    ];

    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-state">
                <p>No tienes notificaciones</p>
            </div>
        `;
        return;
    }

    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification ${notif.read ? '' : 'notification--unread'}" data-notification-id="${notif.id}">
            <div class="notification__icon notification__icon--${notif.type}">
                ${getNotificationIcon(notif.type)}
            </div>
            <div class="notification__content">
                <p class="notification__message">${notif.message}</p>
                <span class="notification__time">${notif.time}</span>
            </div>
        </div>
    `).join('');
}

// ========================================
// UTILIDADES
// ========================================

function getPriorityLabel(priority) {
    const labels = {
        'alta': 'Urgente',
        'media': 'Normal',
        'baja': 'Opcional'
    };
    return labels[priority] || priority;
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }

    if (halfStar) {
        stars += '✨';
    }

    return stars;
}

function getNotificationIcon(type) {
    const icons = {
        'task': '✅',
        'achievement': '🏆',
        'message': '💬',
        'reminder': '⏰'
    };
    return icons[type] || '📢';
}
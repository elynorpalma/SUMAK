/**
 * AUTENTICACIÓN
 * Archivo: js/auth.js
 * Descripción: Lógica de login, registro y recuperación de contraseña
 * Implementa US-012, US-017, US-019
 */

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        initLoginForm(loginForm);
    }

    if (registerForm) {
        initRegisterForm(registerForm);
    }

    initPasswordRecovery();
    initPasswordToggle();
});

// ========================================
// LOGIN
// ========================================

function initLoginForm(form) {
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', debounce(() => {
            if (input.value.length > 0) {
                validateField(input);
            }
        }, 500));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const errorMessage = document.getElementById('login-error');
        const successMessage = document.getElementById('login-success');

        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            errorMessage.textContent = 'Por favor completa todos los campos correctamente';
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            return;
        }

        toggleButtonLoader(submitBtn, true);
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        try {
            const formData = new FormData(form);
            await handleLogin(formData);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            toggleButtonLoader(submitBtn, false);
        }
    });
}

async function handleLogin(formData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Correo o contraseña incorrectos');
    }

    user.lastLogin = new Date().toISOString();
    localStorage.setItem('sumak_users', JSON.stringify(users));

    setCurrentUser(user);

    if (remember) {
        localStorage.setItem('sumak_remember', 'true');
    }

    showToast('¡Bienvenido de vuelta! 👋', 'success');

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Usar la función de utils.js
    redirectToDashboard(user.role);
}

// ========================================
// REGISTRO
// ========================================

function initRegisterForm(form) {
    const steps = form.querySelectorAll('.form__step');
    const progressSteps = document.querySelectorAll('.registration-progress__step');
    let currentStep = 1;

    const nextButtons = form.querySelectorAll('[data-next-step]');
    const prevButtons = form.querySelectorAll('[data-prev-step]');

    nextButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetStep = parseInt(button.dataset.nextStep);
            
            if (await validateCurrentStep(currentStep, form)) {
                goToStep(targetStep, steps, progressSteps, form);
                currentStep = targetStep;
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetStep = parseInt(button.dataset.prevStep);
            goToStep(targetStep, steps, progressSteps, form);
            currentStep = targetStep;
        });
    });

    const allInputs = form.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        if (input.type !== 'radio' && input.type !== 'checkbox') {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', debounce(() => {
                if (input.value.length > 0) {
                    validateField(input);
                }
            }, 500));
        }
    });

    initRoleSelection();
const allRadios = form.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const groupName = radio.name;
            const errorElement = document.getElementById(groupName + '-error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        });
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('#submit-registration');
        const errorMessage = document.getElementById('register-error');

        if (!await validateCurrentStep(4, form)) {
            errorMessage.textContent = 'Por favor completa todos los campos requeridos';
            errorMessage.style.display = 'block';
            return;
        }

        const termsCheckbox = form.querySelector('#terms');
        if (!termsCheckbox || !termsCheckbox.checked) {
            const termsError = document.getElementById('terms-error');
            if (termsError) {
                termsError.textContent = 'Debes aceptar los términos y condiciones';
                termsError.style.display = 'block';
            }
            return;
        }

        toggleButtonLoader(submitBtn, true);
        errorMessage.style.display = 'none';

        try {
            const formData = new FormData(form);
            await handleRegister(formData);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            toggleButtonLoader(submitBtn, false);
        }
    });
}

function goToStep(stepNumber, steps, progressSteps, form) {
    steps.forEach(step => {
        step.classList.remove('form__step--active');
    });

    const targetStepElement = form.querySelector('[data-step="' + stepNumber + '"]');
    if (targetStepElement) {
        targetStepElement.classList.add('form__step--active');
    }

    progressSteps.forEach((step, index) => {
        if (index < stepNumber) {
            step.classList.add('registration-progress__step--completed');
            step.classList.remove('registration-progress__step--active');
        } else if (index === stepNumber - 1) {
            step.classList.add('registration-progress__step--active');
            step.classList.remove('registration-progress__step--completed');
        } else {
            step.classList.remove('registration-progress__step--active');
            step.classList.remove('registration-progress__step--completed');
        }
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function validateCurrentStep(step, form) {
    const currentStepElement = form.querySelector('[data-step="' + step + '"]');
    if (!currentStepElement) return false;

    // Validación especial para paso 1 (selección de rol)
    if (step === 1) {
        const selectedRole = form.querySelector('input[name="role"]:checked');
        if (!selectedRole) {
            const errorElement = document.getElementById('role-error');
            if (errorElement) {
                errorElement.textContent = 'Por favor selecciona un tipo de cuenta';
                errorElement.style.display = 'block';
            }
            return false;
        }
        return true;
    }

    // Validación de inputs normales
    const inputs = currentStepElement.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (input.offsetParent !== null && !input.disabled) {
            if (!validateField(input)) {
                isValid = false;
            }
        }
    });

    // Validación especial para grupos de radio buttons
    const radioGroups = {};
    const allRadios = currentStepElement.querySelectorAll('input[type="radio"]');
    
    allRadios.forEach(radio => {
        // Solo considerar radios visibles y que estén dentro de campos específicos de rol activos
        const parentFields = radio.closest('.role-specific-fields');
        const isVisible = radio.offsetParent !== null || (parentFields && parentFields.style.display !== 'none');
        
        if (isVisible) {
            const name = radio.name;
            if (!radioGroups[name]) {
                radioGroups[name] = {
                    hasChecked: false,
                    isRequired: false
                };
            }
            
            // Verificar si al menos un radio del grupo está marcado como required
            if (radio.hasAttribute('required')) {
                radioGroups[name].isRequired = true;
            }
            
            if (radio.checked) {
                radioGroups[name].hasChecked = true;
            }
        }
    });

    // Verificar que todos los grupos requeridos tengan una opción seleccionada
    Object.keys(radioGroups).forEach(groupName => {
        const group = radioGroups[groupName];
        
        if (group.isRequired && !group.hasChecked) {
            const errorElement = document.getElementById(groupName + '-error');
            if (errorElement) {
                errorElement.textContent = 'Por favor selecciona una opción';
                errorElement.style.display = 'block';
            }
            isValid = false;
        }
    });

    return isValid;
}
function initRoleSelection() {
    const roleCards = document.querySelectorAll('.role-card');
    const roleInputs = document.querySelectorAll('input[name="role"]');
    
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            const input = card.querySelector('input[type="radio"]');
            if (input) {
                input.checked = true;
                
                const errorElement = document.getElementById('role-error');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }

                updateFieldsByRole(input.value);
            }
        });
    });

    roleInputs.forEach(input => {
        input.addEventListener('change', () => {
            roleCards.forEach(card => {
                const cardInput = card.querySelector('input[type="radio"]');
                if (cardInput === input) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });

            updateFieldsByRole(input.value);
        });
    });

    const selectedRole = document.querySelector('input[name="role"]:checked');
    if (selectedRole) {
        const selectedCard = selectedRole.closest('.role-card');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }
}

function updateFieldsByRole(role) {
    document.querySelectorAll('.role-specific-fields').forEach(section => {
        section.style.display = 'none';
        section.querySelectorAll('input, select, textarea').forEach(field => {
            field.removeAttribute('required');
        });
    });

    const fieldsToShow = document.getElementById(role + '-fields');
    if (fieldsToShow) {
        fieldsToShow.style.display = 'block';
        updateRequiredFields(role);
    }

    updateDiagnosticSection(role);
}

function updateRequiredFields(role) {
    const activeFields = document.getElementById(role + '-fields');
    if (!activeFields) return;

    if (role === 'emprendedor') {
        const requiredFields = ['businessName', 'businessSector'];
        requiredFields.forEach(fieldName => {
            const field = activeFields.querySelector('[name="' + fieldName + '"]');
            if (field) field.setAttribute('required', 'required');
        });

        const radioGroups = ['goal', 'connectivity'];
        radioGroups.forEach(groupName => {
            const radios = activeFields.querySelectorAll('[name="' + groupName + '"]');
            radios.forEach(radio => radio.setAttribute('required', 'required'));
        });
    }
    
    if (role === 'facilitador') {
        const requiredFields = ['specialization', 'experience', 'motivation'];
        requiredFields.forEach(fieldName => {
            const field = activeFields.querySelector('[name="' + fieldName + '"]');
            if (field) field.setAttribute('required', 'required');
        });
    }
    
    if (role === 'cliente') {
        const requiredFields = ['location'];
        requiredFields.forEach(fieldName => {
            const field = activeFields.querySelector('[name="' + fieldName + '"]');
            if (field) field.setAttribute('required', 'required');
        });

        const discoveryRadios = activeFields.querySelectorAll('[name="discoveryMethod"]');
        discoveryRadios.forEach(radio => radio.setAttribute('required', 'required'));
    }
}

function updateDiagnosticSection(role) {
    const diagnosticSection = document.getElementById('diagnostic-section');
    const welcomeSection = document.getElementById('welcome-section');

    if (!diagnosticSection || !welcomeSection) return;

    if (role === 'emprendedor') {
        diagnosticSection.style.display = 'block';
        welcomeSection.style.display = 'none';
    } else {
        diagnosticSection.style.display = 'none';
        welcomeSection.style.display = 'block';
    }
}

async function handleRegister(formData) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const role = formData.get('role');
        
        if (!role) {
            throw new Error('Debes seleccionar un tipo de cuenta');
        }

        const users = getUsers();
        const emailExists = users.some(user => user.email === formData.get('email'));

        if (emailExists) {
            throw new Error('Este correo electrónico ya está registrado');
        }

        const newUser = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password'),
            role: role,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        switch (role) {
            case 'emprendedor':
                newUser.businessName = formData.get('businessName');
                newUser.businessSector = formData.get('businessSector');
                newUser.goal = formData.get('goal');
                newUser.connectivity = formData.get('connectivity');
                
                newUser.diagnostic = {
                    q1: formData.get('q1'),
                    q2: formData.get('q2'),
                    q3: formData.get('q3'),
                    q4: formData.get('q4'),
                    q5: formData.get('q5')
                };
                
                newUser.personalizedPath = generatePersonalizedPath(newUser);
                newUser.completedTasks = [];
                newUser.badges = [];
                newUser.streak = 0;
                break;

            case 'facilitador':
                newUser.institution = formData.get('institution') || 'Independiente';
                newUser.specialization = formData.get('specialization');
                newUser.experience = formData.get('experience');
                newUser.motivation = formData.get('motivation');
                newUser.students = [];
                newUser.coursesCreated = [];
                newUser.rating = 0;
                break;

            case 'cliente':
                newUser.location = formData.get('location');
                newUser.discoveryMethod = formData.get('discoveryMethod');
                
                const interests = [];
                const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
                interestCheckboxes.forEach(checkbox => {
                    interests.push(checkbox.value);
                });
                newUser.interests = interests;
                
                newUser.favoriteBusinesses = [];
                newUser.reviews = [];
                break;

            default:
                throw new Error('Rol no válido');
        }

        users.push(newUser);
        localStorage.setItem('sumak_users', JSON.stringify(users));

        setCurrentUser(newUser);

        showToast('¡Cuenta creada exitosamente! Bienvenido a SUMAK 🎉', 'success');

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Usar la función de utils.js
        redirectToDashboard(role);

    } catch (error) {
        throw error;
    }
}

function generatePersonalizedPath(user) {
    const tasks = [];
    let taskId = 1;

    const diagnostic = user.diagnostic;

    tasks.push({
        id: taskId++,
        title: '¡Bienvenido a SUMAK!',
        description: 'Completa tu perfil y explora el panel de control',
        category: 'Introducción',
        priority: 'alta',
        timeEstimate: '5 minutos',
        difficulty: 'Muy fácil',
        status: 'pending'
    });

    if (diagnostic.q1 === 'no') {
        tasks.push({
            id: taskId++,
            title: 'Crear tu primer registro de ingresos y gastos',
            description: 'Aprende a registrar cada venta y gasto del día usando una plantilla simple',
            category: 'Finanzas',
            priority: 'alta',
            timeEstimate: '15 minutos',
            difficulty: 'Fácil',
            status: 'pending'
        });
    }

    if (diagnostic.q2 === 'no' || diagnostic.q2 === 'aveces') {
        tasks.push({
            id: taskId++,
            title: 'Separar gastos personales de los del negocio',
            description: 'Identifica qué gastos son del negocio y cuáles son personales',
            category: 'Finanzas',
            priority: 'alta',
            timeEstimate: '10 minutos',
            difficulty: 'Fácil',
            status: 'pending'
        });
    }

    if (diagnostic.q3 === 'no' || diagnostic.q3 === 'aveces') {
        tasks.push({
            id: taskId++,
            title: 'Crear tu primera publicación en redes sociales',
            description: 'Toma una foto de tu producto más vendido y publícala en Facebook/Instagram',
            category: 'Marketing',
            priority: 'media',
            timeEstimate: '10 minutos',
            difficulty: 'Fácil',
            status: 'pending'
        });
    }

    if (diagnostic.q4 === 'no' || diagnostic.q4 === 'mas-o-menos') {
        tasks.push({
            id: taskId++,
            title: 'Identificar tu producto más rentable',
            description: 'Calcula cuánto ganas realmente con cada producto que vendes',
            category: 'Finanzas',
            priority: 'media',
            timeEstimate: '20 minutos',
            difficulty: 'Media',
            status: 'pending'
        });
    }

    switch (user.goal) {
        case 'finanzas':
            tasks.push({
                id: taskId++,
                title: 'Calcular tu margen de ganancia',
                description: 'Aprende a calcular cuánto ganas de cada 100 soles que vendes',
                category: 'Finanzas',
                priority: 'media',
                timeEstimate: '15 minutos',
                difficulty: 'Media',
                status: 'pending'
            });
            break;

        case 'ventas':
            tasks.push({
                id: taskId++,
                title: 'Crear una promoción efectiva',
                description: 'Diseña una oferta que atraiga más clientes sin perder dinero',
                category: 'Ventas',
                priority: 'media',
                timeEstimate: '15 minutos',
                difficulty: 'Media',
                status: 'pending'
            });
            break;

        case 'marketing':
            tasks.push({
                id: taskId++,
                title: 'Optimizar tu perfil de WhatsApp Business',
                description: 'Configura un catálogo y respuestas automáticas',
                category: 'Marketing',
                priority: 'media',
                timeEstimate: '20 minutos',
                difficulty: 'Media',
                status: 'pending'
            });
            break;

        case 'clientes':
            tasks.push({
                id: taskId++,
                title: 'Crear una base de datos de clientes',
                description: 'Registra nombres y preferencias de tus clientes frecuentes',
                category: 'Ventas',
                priority: 'media',
                timeEstimate: '15 minutos',
                difficulty: 'Fácil',
                status: 'pending'
            });
            break;
    }

    return tasks;
}

// ========================================
// RECUPERACIÓN DE CONTRASEÑA
// ========================================

function initPasswordRecovery() {
    const forgotPasswordLink = document.getElementById('forgot-password');
    const modal = document.getElementById('recovery-modal');
    const closeBtn = document.querySelector('.modal__close');
    const recoveryForm = document.getElementById('recovery-form');

    if (!forgotPasswordLink || !modal) return;

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('modal--active');
        document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('modal--active');
            document.body.style.overflow = '';
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('modal--active');
            document.body.style.overflow = '';
        }
    });

    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePasswordRecovery(recoveryForm);
        });
    }
}

async function handlePasswordRecovery(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#recovery-email').value;
    const successMessage = document.getElementById('recovery-success');
    const errorMessage = document.getElementById('recovery-error');

    toggleButtonLoader(submitBtn, true);
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('No encontramos una cuenta con este correo electrónico');
        }

        const code = Math.floor(100000 + Math.random() * 900000);
        
        localStorage.setItem('sumak_recovery_code', JSON.stringify({
            email: email,
            code: code,
            expires: Date.now() + 15 * 60 * 1000
        }));

        successMessage.innerHTML = '<strong>¡Código enviado!</strong><br>Hemos enviado un código de 6 dígitos al ' + user.phone + '.<br><small>Código de prueba: <strong>' + code + '</strong></small>';
        successMessage.style.display = 'block';

        showToast('Código enviado por SMS', 'success');

        toggleButtonLoader(submitBtn, false);

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
        toggleButtonLoader(submitBtn, false);
    }
}

// ========================================
// UTILIDADES
// ========================================

function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.form__toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                button.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    });
}
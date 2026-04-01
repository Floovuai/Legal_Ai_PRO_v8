// ============================================
// FLOOVU Legal AI PRO V8 - Application Script
// ============================================

// --- Firebase Session Control ---
    // Esperar a que Firebase compat cargue
    window.addEventListener('load', function() {
        try {
            var FB_CONFIG = {
                apiKey:            "AIzaSyBb3IubEjyVMNsl8S-98pzfV9H_LEGhvWM",
                authDomain:        "legal-ai-pro-v8.firebaseapp.com",
                databaseURL:       "https://legal-ai-pro-v8-default-rtdb.firebaseio.com",
                projectId:         "legal-ai-pro-v8",
                storageBucket:     "legal-ai-pro-v8.firebasestorage.app",
                messagingSenderId: "215298653639",
                appId:             "1:215298653639:web:db9b999d63bd20ce0c2de2"
            };

            if (!firebase.apps.length) { firebase.initializeApp(FB_CONFIG); }
            var FB_DB    = firebase.database();
            var FB_TOKEN = Math.random().toString(36).slice(2) + Date.now().toString(36);
            var FB_USER  = null;
            var FB_HB    = null;

            // ── Registrar sesión ──
            window.firebaseRegisterSession = async function(username, profile) {
                FB_USER = username;
                var ref  = FB_DB.ref('sessions/' + username);
                var snap = await ref.once('value');
                if (snap.exists()) {
                    var d = snap.val();
                    if (d.token !== FB_TOKEN && (Date.now() - d.lastSeen) < 30000) {
                        return { blocked: true };
                    }
                }
                var data = {
                    token:     FB_TOKEN,
                    lastSeen:  Date.now(),
                    loginTime: Date.now(),
                    name:      (profile && profile.name)  || username,
                    email:     (profile && profile.email) || '',
                    role:      (profile && profile.role)  || '',
                    userAgent: navigator.userAgent.substring(0, 100)
                };
                await ref.set(data);
                if (FB_HB) clearInterval(FB_HB);
                FB_HB = setInterval(async function() {
                    var s = await ref.once('value');
                    if (s.exists() && s.val().token !== FB_TOKEN) {
                        clearInterval(FB_HB);
                        window.firebaseHandleExpulsion();
                        return;
                    }
                    data.lastSeen = Date.now();
                    ref.set(data);
                }, 15000);
                return { blocked: false };
            };

            // ── Cerrar sesión ──
            window.firebaseCloseSession = async function() {
                if (FB_HB) clearInterval(FB_HB);
                if (FB_USER) {
                    var ref  = FB_DB.ref('sessions/' + FB_USER);
                    var snap = await ref.once('value');
                    if (snap.exists() && snap.val().token === FB_TOKEN) await ref.remove();
                }
                FB_USER = null;
            };

            // ── Forzar cierre ──
            window.firebaseForceLogout = async function(username) {
                await FB_DB.ref('sessions/' + username).remove();
            };

            // ── Obtener sesiones ──
            window.firebaseGetSessions = async function() {
                var snap = await FB_DB.ref('sessions').once('value');
                return snap.exists() ? snap.val() : {};
            };

            // ── Expulsión ──
            window.firebaseHandleExpulsion = function() {
                if (typeof currentUser !== 'undefined') currentUser = null;
                var ov = document.getElementById('login-overlay');
                var ap = document.getElementById('app-shell');
                if (ov) ov.classList.remove('hidden');
                if (ap) ap.style.display = 'none';
                if (typeof showToast === 'function')
                    showToast('⚠️ Sesión cerrada — se inició sesión desde otro dispositivo', 'error');
            };

            // ── Escucha en tiempo real → panel admin ──
            window.fbWatchSessions = function() {
                FB_DB.ref('sessions').on('value', function(snap) {
                    var sessions = snap.exists() ? snap.val() : {};
                    var container = document.getElementById('active-sessions-list');
                    if (container && typeof renderActiveSessionsLive === 'function') {
                        renderActiveSessionsLive(sessions);
                    }
                });
            };

            console.log('[Floovu] Firebase ✓ listo');
        } catch(e) {
            console.warn('[Floovu] Firebase no disponible:', e.message);
        }
    });

// --- Configuration ---
    // ══════════════════════════════════════════════════════════
    // FLOOVU Legal AI PRO V8 — Configuración integrada
    // ══════════════════════════════════════════════════════════
    window.FLOOVU_CONFIG = {

        ACCOUNT_EMAIL: 'floovuai@gmail.com',

        API_SECRET: 'sFD:qws/r>%:?v_HaQ14_hUGc*X0n*',

        // ── Usuarios del sistema ──────────────────────────────
        // Genera los hash con hash-generator.html
        // Para agregar un cliente: duplica el bloque y pega el hash
        USERS: [
            {
                username: 'floovu_admin',
                hash: '0afe54449556726c7eaddb40475f6fd6941f4e85416cdc4a2ccf228254cea26c',
                role: 'admin',
                name: 'Floovu Automation',
                email: 'floovuai@gmail.com'
            },
            {
                username: 'usuario_test',
                hash: 'd11263c74b1fb6bcd55659d6aafb347ea0dd0605d809594717f1d54efac2fd99',
                role: 'operator',
                name: 'Usuario test',
                email: 'floovutest@gmail.com'
            }
        ],

        // ── Webhooks de n8n ───────────────────────────────────
        WEBHOOKS: {
            ASSIGN:        'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-asignar-caso',
            LAWYER_SAVE:   'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-guardar-abogado',
            LAWYER_DELETE: 'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-eliminar-abogado',
            FORCE_SYNC:    'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-force-sync',
            GET_DATA:      'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-data',
            HEALTH_CHECK:  'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-health-check',
            GET_LAWYERS:   'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-abogados',
            GET_CLIENTS:   'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-clientes',
            CLIENT_SAVE:        'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-guardar-cliente',
            CLIENT_DELETE:      'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-eliminar-cliente',
            GET_CLIENT_MAILS:   'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-client-mails',
            GET_DEBUG_LOG:      'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-debug-log',
            SAVE_OBS:           'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-guardar-observacion',
            GET_OBS:            'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-observaciones',
            EDIT_OBS:           'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-editar-anotacion',
            DELETE_OBS:         'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-eliminar-anotacion',
            GET_USUARIOS:       'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-usuarios',
            SAVE_USUARIO:       'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-guardar-usuario-admin',
            DEL_USUARIO:        'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-eliminar-usuario-admin',
            LOGIN_SHEET:        'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-login-sheet'
        }
    };

// --- Main Application ---
        // ══════════════════════════════════════════
        // SISTEMA DE AUTENTICACIÓN Y ROLES
        // ══════════════════════════════════════════
        // Usuarios cargados desde config.js — nunca hardcodeados en el HTML
        const FLOOVU_USERS = (window.FLOOVU_CONFIG && window.FLOOVU_CONFIG.USERS) || [];

        // Pestañas visibles por rol
        const ROLE_TABS = {
            admin:    ['usuarios', 'version'],          // SOLO ve estas
            operator: ['dashboard','asignaciones','expedientes','abogados','clientes','observaciones','bandeja','calendario','version']
        };

        // Pestañas que NADIE ve excepto admin
        const ADMIN_ONLY_TABS = ['usuarios'];

        let currentUser = null;

        async function sha256(msg) {
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
        }

        async function doLogin() {
            const username = document.getElementById('login-user').value.trim().toLowerCase();
            const password = document.getElementById('login-pass').value;
            const errEl    = document.getElementById('login-error');
            const btn      = document.getElementById('login-btn');

            errEl.style.display = 'none';
            if (!username || !password) {
                errEl.textContent = 'Completa usuario y contraseña.';
                errEl.style.display = 'block';
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Verificando...';

            const hash = await sha256(password);

            // Intentar login desde Sheet primero, fallback a array local
            let user = null;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await fetch(WH.LOGIN_SHEET, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-floovu-secret': window.FLOOVU_CONFIG.API_SECRET },
                    body: JSON.stringify({ username, hash })
                });
                if (res.ok) {
                    const _txt = await res.text();
                    let data = {};
                    try { if (_txt) data = JSON.parse(_txt); } catch(_e) {}
                    if (data.ok) {
                        user = { username: data.username, name: data.nombre, email: data.email, role: data.rol, hash, _fromSheet: true };
                    }
                }
            } catch(e) { /* red caída — fallback local */ }

            // Fallback: usuarios hardcodeados en config
            if (!user) {
                const localUser = FLOOVU_USERS.find(u => u.username === username && u.hash === hash);
                if (localUser) user = localUser;
            }

            if (!user) {
                errEl.textContent = 'Usuario o contraseña incorrectos.';
                errEl.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Ingresar al Sistema';
                return;
            }

            // Login exitoso
            // Verificar sesión única con Firebase
            if (typeof window.firebaseRegisterSession === 'function') {
                const btn = document.getElementById('login-btn');
                if (btn) { btn.disabled = true; btn.textContent = 'Verificando sesión...'; }
                try {
                    // Pasar perfil completo a Firebase
                    window._sessionProfile = { name: user.name, email: user.email || '', role: user.role };
                    const result = await window.firebaseRegisterSession(user.username, window._sessionProfile);
                    if (result.blocked) {
                        const errEl = document.getElementById('login-error');
                        if (errEl) {
                            errEl.style.display = 'block';
                            errEl.textContent = '⚠️ Ya hay una sesión activa en otro dispositivo. Cerrá sesión allí primero.';
                        }
                        if (btn) { btn.disabled = false; btn.textContent = 'Acceder al Sistema →'; }
                        return;
                    }
                } catch(e) {
                    console.warn('Firebase session check failed, continuing:', e);
                }
                if (btn) { btn.disabled = false; btn.textContent = 'Acceder al Sistema →'; }
            }

            currentUser = user;
            localStorage.setItem('floovu_user', JSON.stringify({ username: user.username, role: user.role, name: user.name, email: user.email }));

            document.getElementById('login-overlay').classList.add('hidden');
            document.getElementById('app-shell').style.display = 'grid';

            applyRoleUI(user);
            btn.disabled = false;
            btn.textContent = 'Ingresar al Sistema';
        }

        // Pestañas que ve cada rol
        const OPERATOR_TABS = ['dashboard','asignaciones','expedientes','abogados','clientes','calendario','version'];
        const ADMIN_TABS    = ['dashboard','usuarios','version'];

        function applyRoleUI(user) {
            // Mostrar nombre y rol en topnav
            const emailEl = document.getElementById('top-account-email');
            if (emailEl) emailEl.textContent = user.email;
            const badgeEl = document.getElementById('top-role-badge');
            if (badgeEl) {
                badgeEl.textContent = user.role === 'admin' ? 'Agencia' : 'Operador';
                badgeEl.className = `role-badge ${user.role}`;
            }

            // Control de pestañas por rol
            const allowedTabs = user.role === 'admin' ? ADMIN_TABS : OPERATOR_TABS;
            const allTabs = document.querySelectorAll('.nav-item[data-tab]');
            allTabs.forEach(tab => {
                const tabId = tab.getAttribute('data-tab');
                tab.style.display = allowedTabs.includes(tabId) ? 'flex' : 'none';
            });

            // Control de secciones de navegación (Agency no ve Core/Tools)
            const navSectionCore = document.getElementById('nav-section-core');
            const navSectionTools = document.getElementById('nav-section-tools');
            if (user.role === 'admin') {
                if (navSectionCore) navSectionCore.style.display = 'none';
                if (navSectionTools) navSectionTools.style.display = 'none';
            } else {
                if (navSectionCore) navSectionCore.style.display = 'block';
                if (navSectionTools) navSectionTools.style.display = 'block';
            }

            // Ocultar secciones a las que el rol no tiene acceso
            document.querySelectorAll('.content-section').forEach(section => {
                if (!allowedTabs.includes(section.id)) {
                    section.style.display = 'none';
                }
            });

            // Activar la primera pestaña permitida
            const firstTab = document.querySelector(`.nav-item[data-tab="${allowedTabs[0]}"]`);
            if (firstTab) firstTab.click();

            // Versión de Capacidades según rol
            renderCapacidadesForRole(user.role);

            // Iniciar el sistema
            init();
            // Auto-refresh de servicios para admin
            if (user.role === 'admin') startHealthAutoRefresh();
            // Mostrar dashboard según rol
            showDashboardForRole(user.role);
        }

        function renderCapacidadesForRole(role) {
            const versionSection = document.getElementById('version');
            if (!versionSection) return;

            // Título de versión
            const headerH1 = versionSection.querySelector('h1');
            if (headerH1) headerH1.textContent = `Capacidades del Sistema (${role === 'admin' ? 'v8 Full' : 'v8 Pro'})`;

            if (role === 'operator') {
                // Ocultar todas las tarjetas técnicas marcadas
                const techCards = versionSection.querySelectorAll('.version-tech-card');
                techCards.forEach(c => c.style.display = 'none');

                // Personalizar el resumen de arquitectura para que sea menos técnico y más enfocado en beneficios
                const archCard = versionSection.querySelector('.card:not(.version-tech-card)');
                if (archCard) {
                    const archText = archCard.querySelector('p:not(.card-title)');
                    if (archText) {
                        archText.innerHTML = '<b>FLOOVU Legal AI Pro V8</b> es tu asistente inteligente de alto rendimiento. El sistema centraliza la recepción de correos, analiza tus documentos con IA para extraer estrategias clave y gestiona tu agenda judicial automáticamente, permitiéndote enfocarte 100% en la labor jurídica estratégica.';
                    }
                }
            } else {
                // Asegurar que admin vea todo
                const techCards = versionSection.querySelectorAll('.version-tech-card');
                techCards.forEach(c => c.style.display = 'block');
            }
        }

        function doLogout() {
            // Cerrar sesión en Firebase
            if (typeof window.firebaseCloseSession === 'function') {
                window.firebaseCloseSession();
            }
            localStorage.removeItem('floovu_user');
            currentUser = null;
            document.getElementById('login-overlay').classList.remove('hidden');
            document.getElementById('app-shell').style.display = 'none';
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
        }

        // Enter key en login
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !document.getElementById('login-overlay').classList.contains('hidden')) {
                doLogin();
            }
        });

        // Verificar sesión guardada al cargar
        window.addEventListener('load', () => {
            const saved = localStorage.getItem('floovu_user');
            if (saved) {
                try {
                    const user = JSON.parse(saved);
                    const found = FLOOVU_USERS.find(u => u.username === user.username && u.role === user.role);
                    if (found) {
                        currentUser = found;
                        document.getElementById('login-overlay').classList.add('hidden');
                        document.getElementById('app-shell').style.display = 'grid';
                        applyRoleUI(found);
                        return;
                    }
                } catch(e) {}
            }
            // Sin sesión — mostrar login
            document.getElementById('login-overlay').classList.remove('hidden');
            document.getElementById('app-shell').style.display = 'none';
        });

                let db = [];
        let lawyers = [];      // Se carga desde Google Sheets — no hardcodeado en config.js
        let clients = [];      // Directorio unificado (manual + casos)
        let allClientRows = []; // Cache para búsqueda
        let observacionesData = [];
        let bandejaData = [];

        // Mostrar email de cuenta en sidebar (viene de config.js, no del HTML)
        const _accountEl = document.getElementById('sidebar-account-email');
        if (_accountEl) _accountEl.textContent = window.FLOOVU_CONFIG.ACCOUNT_EMAIL || '—';

        // URLs y token cargados desde config.js (no está en el repo)
        const { WEBHOOKS, API_SECRET } = window.FLOOVU_CONFIG;

        const N8N_ASSIGN_WEBHOOK  = WEBHOOKS.ASSIGN;
        const N8N_LAWYER_SAVE     = WEBHOOKS.LAWYER_SAVE;
        const N8N_FORCE_SYNC      = WEBHOOKS.FORCE_SYNC;
        const N8N_GET_DATA        = WEBHOOKS.GET_DATA;
        const N8N_HEALTH_CHECK    = WEBHOOKS.HEALTH_CHECK;
        const N8N_LAWYER_DELETE   = WEBHOOKS.LAWYER_DELETE;
        const N8N_GET_LAWYERS     = WEBHOOKS.GET_LAWYERS;
        const N8N_GET_CLIENTS     = WEBHOOKS.GET_CLIENTS;
        const N8N_CLIENT_SAVE       = WEBHOOKS.CLIENT_SAVE;
        const N8N_CLIENT_DELETE     = WEBHOOKS.CLIENT_DELETE;
        const N8N_GET_CLIENT_MAILS  = WEBHOOKS.GET_CLIENT_MAILS;
        const N8N_GET_DEBUG_LOG     = WEBHOOKS.GET_DEBUG_LOG;

        // Sanitizador contra XSS — escapa todos los datos antes de insertar en el DOM (F1-04)
        function esc(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Helper centralizado para todos los fetch — añade el token de autenticación
        // FIX-TIMEOUT: AbortController con 15s para evitar requests colgados
        async function authFetch(url, options = {}) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 60000);
            const headers = {
                'Content-Type': 'application/json',
                'x-floovu-secret': API_SECRET,
                ...(options.headers || {})
            };
            try {
                const res = await fetch(url, { ...options, headers, signal: controller.signal });
                clearTimeout(timer);
                return res;
            } catch(e) {
                clearTimeout(timer);
                if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado (15s). Verifica que n8n esté activo.');
                throw e;
            }
        }

        document.querySelectorAll('.nav-item').forEach(i => i.onclick = () => {
            // Verificar que el tab está permitido para el rol actual
            const tabId = i.dataset.tab;
            const allowed = currentUser && (currentUser.role === 'admin' || currentUser.role === 'AGENCIA' || currentUser.role === 'agencia') ? ADMIN_TABS : OPERATOR_TABS;
            if (!allowed.includes(tabId)) return;

            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            i.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            const section = document.getElementById(tabId);
            if (section) { section.style.display = ''; section.classList.add('active'); }

            if (tabId === 'abogados') {
                if (lawyers.length > 0) { renderLawyers(); updateUI(); } else { loadLawyers(); }
            } else if (tabId === 'usuarios') {
                loadUsuariosAdmin();
                updateUI();
            } else if (tabId === 'clientes') {
                if (clients.length > 0) { renderClients(); } else { loadClients(); }
            } else if (tabId === 'dashboard' || tabId === 'expedientes' || tabId === 'asignaciones') {
                loadRealData();
                if (tabId === 'dashboard' && currentUser) showDashboardForRole(currentUser.role);
            } else {
                updateUI();
            }
        });

        // Caché de elementos DOM estáticos (F5-02)
        const _els = {};
        function el(id) {
            if (!_els[id]) _els[id] = document.getElementById(id);
            return _els[id];
        }

        // Carga el directorio de abogados directamente desde la hoja ABOGADOS
        // n8n (nodo Normalizar Abogados) ya devuelve: { name, email, especialidad }
        // También soporta columnas crudas del sheet: Nombre | Email | Especialidad | Estado
        async function loadLawyers() {
            const container = document.getElementById('lawyer-list-full');
            if (container) container.innerHTML = `<p style="color:var(--silver);font-size:0.85rem;text-align:center;padding:2rem;">⏳ Cargando directorio...</p>`;

            try {
                const res = await authFetch(N8N_GET_LAWYERS, { method: 'POST' });
                if (res.ok) {
                    let rawData = [];
                    try {
                        const txt = await res.text();
                        rawData = txt ? JSON.parse(txt) : [];
                    } catch(parseErr) {
                        logError(`⚠️ Error parseando respuesta de abogados: ${parseErr.message}`);
                    }

                    const rows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

                    // FIX-LAW-1: acepta tanto la salida normalizada de n8n (name/email/especialidad)
                    // como las columnas crudas del sheet (Nombre/Email/Especialidad).
                    // FIX-LAW-2: el filtro de Estado ya lo aplica n8n; aquí solo descartamos filas vacías.
                    // FIX-LAW-3: email ya NO es obligatorio para no perder abogados sin email en el sheet.
                    lawyers = rows
                        .map(row => ({
                            name:         row['name']         || row['Nombre']       || row['nombre']       || '',
                            email:        row['email']        || row['Email']        || '',
                            especialidad: row['especialidad'] || row['Especialidad'] || ''
                        }))
                        .filter(l => l.name.trim()); // solo descartar filas completamente vacías

                    renderLawyers();
                    updateUI(); // refrescar dropdowns de asignación con los nuevos abogados
                    logError(`✓ ${lawyers.length} abogados cargados desde hoja ABOGADOS.`);
                } else {
                    logError(`Error al cargar abogados: HTTP ${res.status}`);
                    if (container) container.innerHTML = `<p style="color:#ef4444;font-size:0.85rem;text-align:center;padding:2rem;">⚠️ No se pudo conectar con n8n (${res.status}).</p>`;
                }
            } catch(e) {
                logError(`Error al cargar abogados: ${e.message}`);
                if (container) container.innerHTML = `<p style="color:#ef4444;font-size:0.85rem;text-align:center;padding:2rem;">⚠️ Sin conexión con n8n.</p>`;
            }
        }

        // B5 — renderPartialAlerts y openPartialClientForm eliminados
        // Los datos del cliente ahora se confirman directamente en la tarjeta de Asignaciones

async function loadRealData() {
            el('dash-rows').innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--silver);padding:2rem;font-size:0.85rem;">⏳ Sincronizando...</td></tr>`;
            const expContainer = document.getElementById('exp-cards-container');
            if (expContainer) expContainer.innerHTML = `<div class="empty-state"><span class="empty-icon">📁</span>Cargando...</div>`;
            logError("Sincronizando base de datos real...");
            try {
                const res = await authFetch(N8N_GET_DATA, { method: 'POST' });
                if (res.ok) {
                    // FIX-DATA-1: parseo defensivo; si el JSON viene malformado, muestra error sin romper la UI
                    let rawData = [];
                    try {
                        const txt = await res.text();
                        rawData = txt ? JSON.parse(txt) : [];
                    } catch(parseErr) {
                        logError(`⚠️ Respuesta no es JSON válido: ${parseErr.message}`);
                        el('dash-rows').innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:1.5rem;font-size:0.85rem;">⚠️ Respuesta inválida de n8n.</td></tr>`;
                        const _expParse = document.getElementById('exp-cards-container');
                        if (_expParse) _expParse.innerHTML = `<div class="empty-state" style="color:#ef4444;">⚠️ Error de formato.</div>`;
                        return;
                    }
                    const normalizedRows = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
                    db = normalizedRows.map(row => {
                        // FASE 2: leer fecha de vencimiento desde múltiples campos posibles
                        const venc = row['Fecha de Vencimiento'] || row['vencimiento'] ||
                                     row['vencimiento_explicito'] || row['Vencimiento'] || 'S/D';

                        // FASE 3: parser robusto de fechas — normaliza CUALQUIER formato a DD/MM/AAAA HH:mm
                        const fechaRaw = row.Fecha || row.fecha || '';
                        const dateStr = (() => {
                            if (!fechaRaw) return new Date().toLocaleString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
                            const raw = String(fechaRaw).trim();
                            let d = null;
                            // 1. DD/MM/YYYY HH:mm
                            const dmyMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*(\d{1,2}:\d{2})?/);
                            if (dmyMatch) {
                                const [, dd, mm, yyyy, time] = dmyMatch;
                                d = new Date(parseInt(yyyy), parseInt(mm)-1, parseInt(dd));
                                if (time) { const [h,m] = time.split(':'); d.setHours(parseInt(h), parseInt(m)); }
                            }
                            // 2. "Mar 25, 2026" / "March 25, 2026" (extraer del inicio, ignorar basura)
                            if (!d || isNaN(d.getTime())) {
                                // Primero intenta con coma opcional
                                const engMatch = raw.match(/^([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/);
                                if (engMatch) { const p = new Date(engMatch[1]); if (!isNaN(p.getTime())) d = p; }
                                // Si aún no, busca el patrón en cualquier parte y extrae
                                if (!d || isNaN(d.getTime())) {
                                    const looseMon = raw.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
                                    if (looseMon) { const p = new Date(`${looseMon[1]} ${looseMon[2]}, ${looseMon[3]}`); if (!isNaN(p.getTime())) d = p; }
                                }
                            }
                            // 3. Intentar parseo directo
                            if (!d || isNaN(d.getTime())) {
                                const parsed = new Date(raw);
                                if (!isNaN(parsed.getTime())) d = parsed;
                            }
                            // 4. YYYY-MM-DD
                            if (!d || isNaN(d.getTime())) {
                                const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
                                if (isoMatch) d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2])-1, parseInt(isoMatch[3]));
                            }
                            if (!d || isNaN(d.getTime())) return raw;
                            const pad = n => String(n).padStart(2, '0');
                            const fecha = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
                            const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                            return d.getHours() || d.getMinutes() ? `${fecha} ${hora}` : fecha;
                        })();

                        // FASE 4: score robusto — acepta string, number, con o sin tilde
                        const scoreRaw = row['Score Auto-Evaluación'] || row['Score Auto-Evaluacion'] ||
                                         row['Score IA'] || row['Score_IA'] || row['score_ia'] ||
                                         row['score'] || row['Score'] || row.score || '0';
                        // Score viene del sheet como string 0-100 — normalizar a escala 0-10
                        let scoreParsed = parseFloat(String(scoreRaw).replace(',', '.')) || 0;
                        // Si viene en escala 0-100 (ej: 85), convertir a 0-10 (ej: 8.5)
                        const score = scoreParsed > 10 ? parseFloat((scoreParsed / 10).toFixed(1)) : scoreParsed;

                        // FASE 7: limpiar el resumen — quitar el bloque DATA, quitar markdown **
                        let desc = row['Resumen del Documento'] || row['resumen'] || '';
                        // Eliminar bloque [[[DATA_START]]]...[[[DATA_END]]]
                        desc = desc.replace(/\[\[\[DATA_START\]\]\][\s\S]*?\[\[\[DATA_END\]\]\]/g, '').trim();
                        // Eliminar "Bloque JSON" y todo lo que sigue
                        desc = desc.replace(/Bloque\s*JSON[\s\S]*/i, '').trim();
                        // Convertir **texto** en etiquetas bold
                        desc = desc
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, (_, t) => t.trim() ? `<em>${t}</em>` : '')
                            .replace(/<em>\s*<\/em>/g, '')
                            .trim();
                        if (!desc) desc = 'Sin resumen disponible.';

                        return {
                            date:         dateStr,
                            dateOnly:     dateStr.split(' ')[0] || new Date().toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'numeric'}),
                            rama:         row.Rama  || row.rama  || 'General',
                            partes:       row.Partes || row.partes || row.nombre_cliente || row['Cliente a defender'] || row.asunto || row.subject || 'Caso sin clasificar',
                            venc,
                            status:       (row['Estado Alerta'] || '').trim().toUpperCase() === 'PENDIENTE_ASIGNACION' ? 'PENDIENTE' : 'ASIGNADO',
                            es_nuevo_caso: (row['Es_Nuevo_Caso'] || row['es_nuevo_caso'] || '').toString().toUpperCase() === 'TRUE',
                            desc,
                            token:        row.token || row.Token || (row.row_number ? `FLV-EX-${String(row.row_number).padStart(2,'0')}` : 'FLV-EX-00'),
                            row_number:   row.row_number || null,
                            lawyer:       row['Abogado asignado'] || row['Abogado Asignado'] || row['abogado_asignado'] || row['abogado_responsable'] || null,
                            priority:     row.Prioridad || row.prioridad || 'Media',
                            ahorroMin:    parseFloat(String(row['Ahorro Humano (min)'] || '0').replace(',','.')) || 0,
                            score,
                            tipo:         row['Tipo de Documento'] || row.tipo_documento || '',
                            dictamen:     row['Dictamen JSON'] || row['Dictamen Json'] || row['dictamen_json'] || null,
                            informe_html:         (() => {
                                let html = row.informe_html || row['Informe HTML'] || '';
                                let tok = row.token || row.Token || (row.row_number ? `FLV-EX-${String(row.row_number).padStart(2,'0')}` : 'FLV-EX-00');
                                if (html && html.includes('Abogado Asignado') && !html.includes('>Token</td>')) {
                                    html = html.replace(/(<tr><td[^>]*>Abogado Asignado<\/td>)/, `<tr><td style="padding:10px;font-weight:bold;color:#495057;border-bottom:1px solid #eee;width:150px;">Token</td><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;font-family:monospace;color:#2980b9;">${tok}</td></tr>$1`);
                                }
                                return html;
                            })(),
                            messageId:            row['Email ID'] || row.messageId || row['messageId'] || '',
                            archivo_url:          row['Archivo URL'] || row.archivo_url || '',
                            nit:                  row['NIT_Cedula'] || row['NIT'] || row['nit'] || row['nit_cedula'] || row['nit_cliente'] || '',
                            cliente_a_defender:   row['Cliente a defender'] || row['cliente_a_defender'] || '',
                            partes_array:         (() => {
                                const p = row.Partes || row.partes || '';
                                // Detectar separadores comunes en documentos legales
                                const sep = p.match(/\s+(?:vs?\.?|contra|c\/)\s+/i);
                                if (sep) return p.split(sep[0]).map(x => x.trim()).filter(Boolean);
                                const byComma = p.split(/\s*,\s*/);
                                return byComma.length >= 2 ? byComma.slice(0,2) : [p, ''];
                            })()
                        };
                    });
                    updateUI();
                    logError(`✓ ${db.length} casos cargados desde Google Sheets.`);
                } else {
                    el('dash-rows').innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:1.5rem;font-size:0.85rem;">⚠️ Error al conectar con n8n (${res.status}). Reintenta.</td></tr>`;
                    const _expErr = document.getElementById('exp-cards-container');
                    if (_expErr) _expErr.innerHTML = `<div class="empty-state" style="color:#ef4444;">⚠️ Error de sincronización.</div>`;
                    logError(`Error de sincronización: HTTP ${res.status}`);
                }
            } catch(e) {
                el('dash-rows').innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:1.5rem;font-size:0.85rem;">⚠️ Sin conexión con n8n.</td></tr>`;
                const _expErr2 = document.getElementById('exp-cards-container');
                if (_expErr2) _expErr2.innerHTML = `<div class="empty-state" style="color:#ef4444;">⚠️ Sin conexión.</div>`;
                logError(`Error de sincronización: ${e.message}`);
            }
        }


        // F5-01: renombrado de 'console' a 'logEl' para no shadear window.console
        function logError(msg) {
            const logEl = document.getElementById('error-console');
            if (!logEl) return;
            const line = document.createElement('div');
            line.style.color = msg.includes('Error') || msg.includes('error') ? '#ef4444' : '#94a3b8';
            line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logEl.prepend(line);
        }

        // F2-05 aplicado: toggleDesc busca por token, no por índice (F2-02 complemento)
        function toggleDesc(token) {
            const panel = document.getElementById(`desc-panel-${token}`);
            if (!panel) return;
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        }

        // ══════════════════════════════════════════
        // TREND BADGES — cálculo real (últimos 7d vs 7d anteriores)
        // ══════════════════════════════════════════
        function calculateTrends(cases) {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            const d7ago = new Date(now);
            d7ago.setDate(d7ago.getDate() - 7);
            d7ago.setHours(0, 0, 0, 0);
            const d14ago = new Date(now);
            d14ago.setDate(d14ago.getDate() - 14);
            d14ago.setHours(0, 0, 0, 0);

            function parseTrendDate(str) {
                if (!str) return null;
                const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
                const d = new Date(str);
                return isNaN(d.getTime()) ? null : d;
            }

            const recent = cases.filter(c => {
                const d = parseTrendDate(c.dateOnly || c.date);
                return d && d >= d7ago;
            });
            const previous = cases.filter(c => {
                const d = parseTrendDate(c.dateOnly || c.date);
                return d && d >= d14ago && d < d7ago;
            });

            function pctChange(cur, prev) {
                if (prev === 0 && cur === 0) return { pct: '0.0', dir: 'neutral' };
                if (prev === 0) return { pct: '100', dir: cur > 0 ? 'up' : 'neutral' };
                const change = ((cur - prev) / prev) * 100;
                return {
                    pct: Math.abs(change).toFixed(1),
                    dir: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'neutral'
                };
            }

            // Casos procesados
            const casesTrend = pctChange(recent.length, previous.length);

            // Pendientes
            const recentPend = recent.filter(c => c.status === 'PENDIENTE').length;
            const prevPend = previous.filter(c => c.status === 'PENDIENTE').length;
            const pendingTrend = pctChange(recentPend, prevPend);

            // Horas ahorradas (ahorroMin)
            const recentMin = recent.reduce((a, c) => a + (c.ahorroMin || 0), 0);
            const prevMin = previous.reduce((a, c) => a + (c.ahorroMin || 0), 0);
            const hoursTrend = pctChange(recentMin, prevMin);

            // Score IA promedio
            const rScores = recent.filter(c => c.score > 0).map(c => c.score);
            const pScores = previous.filter(c => c.score > 0).map(c => c.score);
            const rAvg = rScores.length ? rScores.reduce((a, b) => a + b, 0) / rScores.length : 0;
            const pAvg = pScores.length ? pScores.reduce((a, b) => a + b, 0) / pScores.length : 0;
            const scoreTrend = pctChange(rAvg, pAvg);

            // Asignados
            const recentAsig = recent.filter(c => c.lawyer && c.lawyer !== 'Pendiente').length;
            const prevAsig = previous.filter(c => c.lawyer && c.lawyer !== 'Pendiente').length;
            const assignedTrend = pctChange(recentAsig, prevAsig);

            return { cases: casesTrend, pending: pendingTrend, hours: hoursTrend, score: scoreTrend, assigned: assignedTrend };
        }

        function updateTrendBadge(elId, trend, invertColor) {
            const tbEl = document.getElementById(elId);
            if (!tbEl) return;
            if (trend.pct === '0.0') {
                tbEl.textContent = '→ 0%';
                tbEl.className = 'kpi-v2-delta';
                return;
            }
            const arrow = trend.dir === 'up' ? '↗' : trend.dir === 'down' ? '↘' : '→';
            tbEl.textContent = arrow + ' ' + trend.pct + '%';
            let cssDir = trend.dir === 'neutral' ? '' : trend.dir;
            if (invertColor && cssDir) cssDir = cssDir === 'up' ? 'down' : 'up';
            tbEl.className = 'kpi-v2-delta ' + cssDir;
        }

        function updateUI() {
            if (!db.length) {
                el('chart-area').innerHTML      = `<div class="empty-state-svg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Sin datos en métricas</span></div>`;
                el('dash-rows').innerHTML       = `<tr><td colspan="6" class="empty-state">No se reconoce actividad reciente</td></tr>`;
                el('dash-deadlines').innerHTML  = `<div class="empty-state-svg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Sin actividad</span></div>`;
                el('asig-content').innerHTML    = `<div class="empty-state-svg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Sin casos pendientes de despacho</span></div>`;
                const _expEmpty = document.getElementById('exp-cards-container');
                if (_expEmpty) _expEmpty.innerHTML = `<div class="empty-state"><span class="empty-icon">📁</span>La base de datos se encuentra vacía</div>`;
                el('cal-content').innerHTML     = `<tr><td colspan="6" style="padding:0;border:none;"><div class="empty-state-svg no-bg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>No hay vencimientos agendados</span></div></td></tr>`;
                el('kpi-hours').innerText       = '0h';
                el('kpi-score').innerText       = '—';
                el('kpi-total').innerText       = '0';
                el('kpi-pending').innerText     = '0';
                ['trend-cases','trend-pending','trend-hours','trend-score'].forEach(function(id) {
                    var _t = document.getElementById(id); if (_t) { _t.textContent = '--'; _t.className = 'kpi-v2-delta'; }
                });
                return;
            }

            // KPIs
            const totalMinutos = db.reduce((acc, c) => acc + (c.ahorroMin || 0), 0);
            const totalHours   = totalMinutos > 0 ? (totalMinutos / 60).toFixed(1) : '0';
            const scores       = db.filter(c => c.score > 0).map(c => c.score);
            const avgScore     = scores.length ? (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : null;
            const totalCases   = db.length;
            const pendingCases = db.filter(c => c.status === 'PENDIENTE').length;

            function animateKPINumber(id, val, suffix = '', isFloat = false, duration = 1200) {
                const el = document.getElementById(id);
                if (!el || val === 'N/A' || isNaN(val)) {
                    if (el) el.innerText = val === 'N/A' ? val : val + suffix;
                    return;
                }
                const target = parseFloat(val);
                let start = null;
                const step = (ts) => {
                    if (!start) start = ts;
                    const progress = Math.min((ts - start) / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = target * easeOut;
                    el.innerText = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
                    if (progress < 1) window.requestAnimationFrame(step);
                    else el.innerText = (isFloat ? target.toFixed(1) : target) + suffix;
                };
                window.requestAnimationFrame(step);
            }

            animateKPINumber('kpi-hours', totalHours, 'h', true);
            animateKPINumber('kpi-score', avgScore ? avgScore : 'N/A', '/10', true);
            animateKPINumber('kpi-total', totalCases, '', false);
            animateKPINumber('kpi-pending', pendingCases, '', false);

            // Barras de progreso KPIs
            const scoreBar = document.getElementById('kpi-bar-score');
            const pendBar  = document.getElementById('kpi-bar-pending');
            const hoursBar = document.getElementById('kpi-bar-hours');
            if (scoreBar) scoreBar.style.width = avgScore ? `${(parseFloat(avgScore)/10)*100}%` : '0%';
            if (pendBar)  pendBar.style.width  = totalCases ? `${(pendingCases/totalCases)*100}%` : '0%';
            if (hoursBar) hoursBar.style.width = totalHours > 0 ? `${Math.min(parseFloat(totalHours)/20*100, 100)}%` : '0%';

            // Trend badges operador — cálculo real últimos 7d vs 7d anteriores
            const trends = calculateTrends(db);
            updateTrendBadge('trend-cases', trends.cases);
            updateTrendBadge('trend-pending', trends.pending, true); // invertido: menos pendientes = bueno (verde)
            updateTrendBadge('trend-hours', trends.hours);
            updateTrendBadge('trend-score', trends.score);

            // Gráfico rama jurídica — canvas futurista
            const ramaCount = {};
            db.forEach(c => { ramaCount[c.rama] = (ramaCount[c.rama] || 0) + 1; });
            const ramaLabels = Object.keys(ramaCount);
            const ramaData   = ramaLabels.map(r => ramaCount[r]);
            const chartSig   = JSON.stringify(ramaCount);
            const chartEl    = el('chart-area');
            if (chartEl && chartEl.dataset.sig !== chartSig) {
                chartEl.dataset.sig = chartSig;
                drawFuturisticDonut(chartEl, ramaLabels, ramaData);
            }

            // Entradas recientes
            el('dash-rows').innerHTML = db.slice(0, 5).map(c =>
                `<tr>
                    <td>${esc(c.date)}</td>
                    <td><span style="color:var(--gold);font-weight:700;">${esc((c.priority||'Media').toUpperCase())}</span></td>
                    <td>${esc(c.partes)}</td>
                    <td>${esc(c.rama)}</td>
                    <td style="color:var(--silver);">${(c.venc && c.venc !== 'S/D' && c.venc !== 'N/A') ? esc(c.venc) : '<em>—</em>'}</td>
                    <td style="color:${c.lawyer ? 'var(--white)' : 'var(--silver)'};font-style:${c.lawyer ? 'normal' : 'italic'};">${esc(c.lawyer || 'Pendiente')}</td>
                </tr>`
            ).join('');

            // Vencimientos con alertas de color
            function parseVenc(v) {
                if (!v || v === 'S/D' || v === 'N/A') return null;
                if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
                const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
                return v;
            }
            const today = new Date(); today.setHours(0,0,0,0);
            const conVenc = db
                .map(c => ({ ...c, vencSort: parseVenc(c.venc) }))
                .filter(c => c.vencSort)
                .sort((a,b) => (a.vencSort > b.vencSort ? 1 : -1));

            if (conVenc.length) {
                el('dash-deadlines').innerHTML = conVenc.slice(0, 5).map(c => {
                    const diff = c.vencSort ? Math.ceil((new Date(c.vencSort) - today) / 86400000) : 99;
                    const level = diff <= 3 ? 'urgente' : diff <= 10 ? 'proximo' : 'normal';
                    const badge = diff <= 0 ? 'VENCIDO' : diff <= 3 ? `${diff}d` : diff <= 10 ? `${diff} días` : c.venc;
                    return `<div class="deadline-item ${level}">
                        <span class="deadline-badge ${level}">${esc(badge)}</span>
                        <div style="min-width:0;flex:1;">
                            <p style="margin:0;font-size:0.72rem;color:var(--white);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(c.partes)}</p>
                            <p style="margin:1px 0 0;font-size:0.62rem;color:var(--silver);">${esc(c.rama)} · ${esc(c.tipo || '—')}</p>
                        </div>
                    </div>`;
                }).join('');
            } else {
                el('dash-deadlines').innerHTML = `<div class="empty-state-svg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span>Sin vencimientos próximos</span></div>`;
            }

            // Agenda Judicial — solo casos ASIGNADOS con abogado vinculado
            const conVencAsig = conVenc.filter(c => c.lawyer && c.status === 'ASIGNADO');
            if (conVencAsig.length) {
                el('cal-content').innerHTML = conVencAsig.map(c => {
                    // Estado calendario: si tiene fecha de vencimiento real = programado
                    const calEstado = (c.venc && c.venc !== 'S/D' && c.venc !== 'N/A')
                        ? `<span style="color:#22c55e;font-weight:700;font-size:0.78rem;">● Programado</span>`
                        : `<span style="color:#f97316;font-weight:700;font-size:0.78rem;">○ Sin programar</span>`;
                    return `<tr>
                        <td style="color:var(--gold);font-family:monospace;font-size:0.82rem;font-weight:700;">${esc(c.venc)}</td>
                        <td style="font-weight:600;color:var(--white);">${esc(c.partes)}</td>
                        <td>${esc(c.rama)}</td>
                        <td style="color:var(--silver);font-size:0.82rem;">${esc(c.tipo || '—')}</td>
                        <td style="color:var(--white);">${esc(c.lawyer)}</td>
                        <td>${calEstado}</td>
                    </tr>`;
                }).join('');
            } else {
                el('cal-content').innerHTML = `<tr><td colspan="6" style="padding:0;border:none;"><div class="empty-state-svg no-bg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>No hay vencimientos con casos asignados</span></div></td></tr>`;
            }

            // Asignaciones
            const pend = db.filter(c => c.status === 'PENDIENTE');
            const badge = document.getElementById('asig-badge');
            badge.innerText = pend.length;
            badge.style.display = pend.length > 0 ? 'inline-block' : 'none';

            const asigContent = document.getElementById('asig-content');
            if (pend.length) {
                asigContent.classList.remove('empty-state');
                asigContent.innerHTML = pend.map(c => {
                    const tok = esc(c.token);
                    // Si aún no hay abogados cargados, mostrar placeholder
                    const lawyerOptions = lawyers.length
                        ? lawyers.map(l => `<option value="${esc(l.name)}">${esc(l.name)}</option>`).join('')
                        : `<option value="">Cargando abogados...</option>`;

                    // FASE 8: formatear desc — párrafos separados, sin markdown crudo
                    // FIX-XSS: esc() aplicado a cada párrafo de desc antes de insertar en DOM
                    const descFormatted = (() => {
                        // Limpiar "Bloque JSON" y lo que sigue
                        let cleaned = c.desc
                            .replace(/Bloque\s*JSON[\s\S]*/i, '')
                            .replace(/<strong>(.*?)<\/strong>/g, '|||TITLE|||$1|||ENDTITLE|||')
                            .trim();
                        return cleaned
                            .split(/\n+/)
                            .filter(p => p.trim() && p.trim() !== '<em></em>' && p.trim() !== '<em> </em>')
                            .map(p => {
                                if (p.includes('|||TITLE|||')) {
                                    const title = p.replace(/\|\|\|TITLE\|\|\|(.*)\|\|\|ENDTITLE\|\|\|/, '$1');
                                    return `<p style="margin:8px 0 4px;font-size:0.8rem;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${esc(title)}</p>`;
                                }
                                // Preservar <em> sin escapar — reemplazar temporalmente
                                const safe = p
                                    .replace(/<em>(.*?)<\/em>/g, (_, t) => `<em>${esc(t)}</em>`)
                                    .replace(/<\/em>|<em>/g, m => m); // dejar etiquetas em intactas
                                // Para el resto del texto, escapar solo si no tiene tags em
                                const html = safe.includes('<em>') ? safe : esc(p);
                                return `<p style="margin:0 0 8px;font-size:0.82rem;color:var(--silver);line-height:1.6;">${html}</p>`;
                            })
                            .join('');
                    })();

                    return `
                    <div class="asig-card">
                        <div class="asig-header">
                            <div>
                                <h3 style="color:var(--white);font-size:1.1rem;margin-bottom:4px;">${esc(c.partes)}</h3>
                                <div style="display:flex;gap:10px;align-items:center;">
                                    <span style="font-size:0.7rem;color:var(--gold);text-transform:uppercase;font-weight:800;letter-spacing:1px;">RAMA: ${esc(c.rama)}</span>
                                    <span style="width:4px;height:4px;background:var(--border);border-radius:50%;"></span>
                                    <span style="font-size:0.75rem;color:var(--silver);">Vencimiento: ${(c.venc && c.venc !== 'S/D' && c.venc !== 'N/A') ? esc(c.venc) : '<em>Sin fecha definida</em>'}</span>
                                </div>
                            </div>
                            <span style="font-size:0.75rem;color:var(--silver);background:rgba(255,255,255,0.05);padding:4px 10px;border-radius:20px;">Recibido: ${esc(c.date)}</span>
                        </div>
                        <div class="asig-actions">
                            <button class="btn-outline" onclick="toggleDesc('${tok}')">📂 Ver Resumen</button>
                            <div style="flex-grow:1;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                                <select id="law-sel-${tok}" style="max-width:200px;">${lawyerOptions}</select>
                                <button class="btn-asig-main" onclick="finish('${tok}')">⚖️ Confirmar Asignación</button>
                            </div>
                        </div>
                        <!-- CLIENTE A DEFENDER — B5 -->
                        <div style="margin-top:10px;padding:12px 16px;background:linear-gradient(135deg,rgba(212,175,55,0.08),rgba(26,26,46,0.6));border:1px solid rgba(212,175,55,0.3);border-radius:12px;">
                            <p style="margin:0 0 10px;font-size:0.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:1.5px;display:flex;align-items:center;gap:6px;">🛡 Cliente a Defender</p>
                            ${(() => {
                                const parts = c.partes_array || [];
                                const p0 = parts[0] || c.partes || '';
                                const p1 = parts[1] || '';
                                const nit = c.nit ? `<span style="font-size:0.65rem;color:rgba(212,175,55,0.7);font-weight:600;margin-left:8px;padding:2px 7px;background:rgba(212,175,55,0.1);border-radius:4px;border:1px solid rgba(212,175,55,0.2);">${esc(c.nit)}</span>` : '';
                                const presel = c.cliente_a_defender || '';
                                const sel0 = presel === p0 ? 'checked' : (!presel && p0 ? 'checked' : '');
                                const sel1 = presel === p1 ? 'checked' : '';
                                const mkLabel = (val, sel, extra='') => `
                                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.08);transition:all 0.2s;box-sizing:border-box;width:100%;" onmouseover="this.style.background='rgba(212,175,55,0.06)'" onmouseout="if(!this.querySelector('input').checked)this.style.background='rgba(255,255,255,0.03)'" onclick="this.querySelector('input').checked=true;document.querySelectorAll('[name=cad-${tok}]').forEach(r=>{const l=r.closest('label');l.style.borderColor='rgba(255,255,255,0.08)';l.style.background='rgba(255,255,255,0.03)'});this.style.borderColor='var(--gold)';this.style.background='rgba(212,175,55,0.08)';">
                                        <input type="radio" name="cad-${tok}" value="${esc(val)}" ${sel} style="accent-color:var(--gold);flex-shrink:0;width:16px;height:16px;">
                                        <span style="font-size:0.85rem;font-weight:600;color:#fff;line-height:1.3;word-break:break-word;overflow-wrap:anywhere;">${esc(val)}</span>${extra}
                                    </label>`;
                                let html = `<div style="display:flex;flex-direction:column;gap:8px;">`;
                                if (p0) html += mkLabel(p0, sel0, nit);
                                if (p1) html += mkLabel(p1, sel1);
                                html += `</div>`;
                                if (presel) html += `<p style="margin:4px 0 0;font-size:0.68rem;color:var(--gold);">⚡ Pre-detectado por el sistema</p>`;
                                return html;
                            })()}
                            <!-- Datos provisorios del cliente para confirmar en asignación -->
                            <div class="asig-client-fields">
                                <div>
                                    <label for="asig-nit-${tok}">NIT / CÉDULA</label>
                                    <input type="text" id="asig-nit-${tok}" placeholder="Ej: 900.123.456-7" value="${esc(String(c.nit || ''))}">
                                </div>
                                <div>
                                    <label for="asig-email-${tok}">EMAIL DEL CLIENTE</label>
                                    <input type="email" id="asig-email-${tok}" placeholder="cliente@empresa.com" value="${esc(c.email_cliente || '')}">
                                </div>
                                <div>
                                    <label for="asig-tel-${tok}">TELÉFONO</label>
                                    <input type="text" id="asig-tel-${tok}" placeholder="+57 300 000 0000">
                                </div>
                                <div>
                                    <label for="asig-notas-${tok}">NOTAS</label>
                                    <input type="text" id="asig-notas-${tok}" placeholder="Observaciones del cliente">
                                </div>
                            </div>
                        </div>
                        <div id="desc-panel-${tok}" class="asig-desc-panel" style="display:none;">
                            ${descFormatted}
                        </div>
                        <div id="mails-panel-${tok}" style="display:none;margin-top:1rem;padding:1rem;background:rgba(0,0,0,0.3);border-radius:8px;border-left:3px solid var(--gold);"></div>
                    </div>`;
                }).join('');
            } else {
                asigContent.classList.add('empty-state');
                const asignado = db.find(c => c.status === 'ASIGNADO');
                asigContent.innerHTML = asignado
                    ? `<div class="empty-state"><span class="empty-icon">✅</span>Expediente de ${esc(asignado.partes)} asignado a ${esc(asignado.lawyer || '—')}.</div>`
                    : `<div class="empty-state-svg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Sin casos pendientes</span></div>`;
            }

            // Registro Legal — solo casos ASIGNADOS, vista tarjetas
            renderExpedientesCards(db.filter(c => c.status === 'ASIGNADO'));
        }

        // F4-04: Toast — reemplaza alert() nativo
        function showToast(msg, type = 'ok') {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.className = `toast toast-${type} show`;
            clearTimeout(t._timer);
            t._timer = setTimeout(() => { t.classList.remove('show'); }, 3500);
        }

        // F4-05: Confirmación visual — reemplaza confirm() nativo
        function floovuConfirm(msg) {
            return new Promise(resolve => {
                const modal = document.getElementById('confirm-modal');
                document.getElementById('confirm-msg').textContent = msg;
                modal.classList.add('visible');
                const ok  = document.getElementById('confirm-ok');
                const no  = document.getElementById('confirm-cancel');
                const cleanup = (result) => {
                    modal.classList.remove('visible');
                    ok.replaceWith(ok.cloneNode(true));
                    no.replaceWith(no.cloneNode(true));
                    resolve(result);
                };
                document.getElementById('confirm-ok').onclick     = () => cleanup(true);
                document.getElementById('confirm-cancel').onclick = () => cleanup(false);
            });
        }

        // F5-08: helpers para el terminal que usan clase CSS en vez de style inline
        function showTerminal(steps) {
            const overlay = document.getElementById('loader');
            const term = document.getElementById('term');
            overlay.classList.add('visible');
            term.innerHTML = '';
            steps.forEach((msg, i) => {
                setTimeout(() => {
                    const p = document.createElement('p'); p.className = 'terminal-line';
                    p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
                    term.appendChild(p);
                }, i * 300);
            });
        }

        function closeTerminal() {
            document.getElementById('loader').classList.remove('visible');
        }

        // F2-08 aplicado: forceGmailSync ya no llama startAIProcessing con pasos falsos
        async function forceGmailSync() {
            console.log('[Floovu] forceGmailSync called, user:', currentUser ? currentUser.email : 'null');
            logError("Iniciando Escaneo de Gmail forzado...");
            document.getElementById('mail-notification').style.opacity = '0.5';
            showTerminal(["Conectando con n8n...", "Solicitando escaneo de Gmail..."]);
            try {
                const res = await authFetch(N8N_FORCE_SYNC, {
                    method: 'POST',
                    body: JSON.stringify({ email: currentUser ? currentUser.email : '' })
                });
                if (res.ok) {
                    // Pipeline async en n8n — cada email con múltiples PDFs puede tomar 30-60s
                    logError('✓ Escaneo iniciado. Procesando emails y PDFs en segundo plano...');
                    showToast('Gmail procesándose. Los casos nuevos aparecerán en 30-60 segundos.', 'ok');
                    // Primera recarga a los 30s
                    setTimeout(async () => {
                        await loadRealData();
                        logError('✓ Primera actualización de datos.');
                    }, 30000);
                    // Segunda recarga a los 65s por si hay múltiples emails o PDFs pesados
                    setTimeout(async () => {
                        await loadRealData();
                        logError('✓ Datos actualizados (verificación final).');
                    }, 65000);
                } else {
                    logError(`Error Sync: ${res.status}`);
                }
            } catch(e) {
                logError(`Error en escaneo: ${e.message}`);
            }
            document.getElementById('mail-notification').style.opacity = '1';
            setTimeout(closeTerminal, 1200);
        }

        function renderLawyers() {
            // FIX-RENDER-1: no usar el caché _els para lawyer-list-full ya que su
            // contenido se sobreescribe y el DOM se mantiene estable; sí hacemos
            // getElementById directo para estar seguros.
            const container = document.getElementById('lawyer-list-full');
            if (!container) return;
            if (!lawyers.length) {
                container.innerHTML = `<p style="color:var(--silver);font-size:0.85rem;text-align:center;padding:2rem;">Sin abogados registrados.</p>`;
                return;
            }
            container.innerHTML = lawyers.map((l, i) => `
                <div style="padding:1rem;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong style="color:var(--gold);">${esc(l.name)}</strong><br>
                        <small style="color:var(--silver)">${esc(l.email || '—')} | ${esc(l.especialidad || '—')}</small>
                    </div>
                    <button class="btn-delete" onclick="deleteLawyer(${i})">Eliminar</button>
                </div>
            `).join('');
        }

        async function addLawyer() {
            const name  = document.getElementById('new-law-name').value.trim();
            const email = document.getElementById('new-law-email').value.trim();
            const spec  = document.getElementById('new-law-spec').value;

            if (!name) { showToast('El nombre del abogado es obligatorio.', 'error'); return; }
            // FIX-ADD-1: email es opcional, pero si se ingresa debe ser válido
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showToast('El email ingresado no tiene un formato válido.', 'error'); return;
            }

            // FIX-INPUT-ESC: sanitizar inputs antes de enviar a n8n
            const safeName  = name.replace(/[<>"'&]/g, '');
            const safeEmail = email.replace(/[<>"'&]/g, '');
            const safeSpec  = spec.replace(/[<>"'&]/g, '');

            logError(`Guardando abogado: ${safeName}...`);
            try {
                const res = await authFetch(N8N_LAWYER_SAVE, {
                    method: 'POST',
                    body: JSON.stringify({ nombre: safeName, email: safeEmail, especialidad: safeSpec })
                });
                if (res.ok) {
                    lawyers.push({ name: safeName, email: safeEmail, especialidad: safeSpec });
                    renderLawyers();
                    updateUI();
                    showToast(`Abogado ${name} guardado correctamente.`, 'ok');
                    logError(`✓ Abogado guardado en Google Sheets.`);
                    document.getElementById('new-law-name').value  = '';
                    document.getElementById('new-law-email').value = '';
                    document.getElementById('new-law-spec').selectedIndex = 0;
                } else {
                    showToast(`Error del servidor: ${res.status}`, 'error');
                }
            } catch(e) { logError(`Error al guardar: ${e.message}`); showToast('No se pudo conectar con n8n.', 'error'); }
        }

        async function deleteLawyer(idx) {
            const l = lawyers[idx];
            // F4-05: floovuConfirm en vez de confirm() nativo
            const ok = await floovuConfirm(`¿Eliminar a ${l.name} del directorio?`);
            if (!ok) return;

            logError(`Eliminando abogado: ${l.name}...`);
            try {
                const res = await authFetch(N8N_LAWYER_DELETE, {
                    method: 'POST',
                    body: JSON.stringify({ email: l.email })
                });
                if (res.ok) {
                    lawyers.splice(idx, 1);
                    renderLawyers();
                    updateUI();
                    showToast(`${l.name} eliminado del directorio.`, 'ok');
                    logError(`✓ Abogado eliminado del sistema.`);
                } else {
                    showToast(`Error del servidor: ${res.status}`, 'error');
                }
            } catch(e) { logError(`Error al eliminar: ${e.message}`); showToast('No se pudo conectar con n8n.', 'error'); }
        }

        function switchDebugTab(tab) {
            const isFrontend = tab === 'frontend';
            document.getElementById('debug-panel-frontend').style.display = isFrontend ? 'block' : 'none';
            document.getElementById('debug-panel-n8n').style.display      = isFrontend ? 'none'  : 'block';
            document.getElementById('dtab-frontend').style.background = isFrontend ? 'rgba(197,160,89,0.15)' : 'transparent';
            document.getElementById('dtab-frontend').style.color      = isFrontend ? 'var(--gold)'   : 'var(--silver)';
            document.getElementById('dtab-frontend').style.border     = isFrontend ? '1px solid rgba(197,160,89,0.5)' : '1px solid rgba(255,255,255,0.1)';
            document.getElementById('dtab-n8n').style.background = !isFrontend ? 'rgba(197,160,89,0.15)' : 'transparent';
            document.getElementById('dtab-n8n').style.color      = !isFrontend ? 'var(--gold)'   : 'var(--silver)';
            document.getElementById('dtab-n8n').style.border     = !isFrontend ? '1px solid rgba(197,160,89,0.5)' : '1px solid rgba(255,255,255,0.1)';
            if (!isFrontend) loadDebugLog();
        }

        async function loadDebugLog() {
            const logEl = document.getElementById('n8n-log-console');
            const btn   = document.getElementById('btn-refresh-debug');
            if (!logEl) return;
            logEl.innerHTML = '<span style="color:var(--silver);">[System] Cargando logs de n8n...</span>';
            if (btn) { btn.disabled = true; btn.textContent = '⏳ Cargando...'; }
            try {
                const res = await authFetch(N8N_GET_DEBUG_LOG, { method: 'POST' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                let rows = [];
                try {
                    const txt = await res.text();
                    rows = txt ? JSON.parse(txt) : [];
                } catch(e) {
                    throw new Error('Respuesta no es JSON válido');
                }
                if (!Array.isArray(rows) || rows.length === 0) {
                    logEl.innerHTML = '<span style="color:var(--silver);">[System] Sin logs registrados aún. Los workflows deben ejecutarse para generar telemetría.</span>';
                    return;
                }
                // Mostrar errores en badge
                const errorCount = rows.filter(r => (r.estado || r.Estado || '').toUpperCase() === 'ERROR').length;
                const badge = document.getElementById('n8n-log-badge');
                if (badge) { badge.style.display = errorCount > 0 ? 'inline' : 'none'; badge.textContent = errorCount; }

                logEl.innerHTML = '';
                rows.forEach(r => {
                    const ts     = r.timestamp || r.Timestamp || '';
                    const nodo   = r.nodo       || r.Nodo      || '?';
                    const estado = (r.estado    || r.Estado    || 'OK').toUpperCase();
                    const error  = r.error      || r.Error     || '';
                    const extra  = r.datos_extra || r.Datos_extra || '';
                    const sid    = r.session_id  || r.Session_id  || '';

                    const isErr = estado === 'ERROR';
                    const line  = document.createElement('div');
                    line.style.cssText = `padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.71rem;color:${isErr ? '#ef4444' : '#94a3b8'};line-height:1.5;`;
                    line.innerHTML = `<span style="color:${isErr?'#ef4444':'#c5a059'};font-weight:700;">[${estado}]</span> <span style="color:#fff;">${nodo}</span> <span style="color:#475569;font-size:0.67rem;">${ts}</span>${error ? `<br><span style="color:#ef4444;padding-left:8px;">↳ ${error}</span>` : ''}${extra ? `<br><span style="color:#64748b;padding-left:8px;font-size:0.67rem;">${extra}</span>` : ''}${sid ? `<span style="color:#334155;font-size:0.63rem;float:right;">sid:${sid}</span>` : ''}`;
                    logEl.prepend(line);
                });
                logError(`✓ ${rows.length} logs de n8n cargados.`);
            } catch(e) {
                logEl.innerHTML = `<span style="color:#ef4444;">[Error] No se pudo cargar el Debug_Log: ${e.message}</span>`;
                logError(`Error cargando Debug_Log: ${e.message}`);
            } finally {
                if (btn) { btn.disabled = false; btn.textContent = '⟳ Cargar Logs n8n'; }
            }
        }

        async function pingEngine() {
            logError("Lanzando diagnóstico de sistema...");
            const nodes = ['web', 'gmail', 'sheet', 'ai'];
            nodes.forEach(n => document.getElementById(`h-${n}`).innerHTML = "⌛");
            try {
                const res = await authFetch(N8N_HEALTH_CHECK, { method: 'POST' });
                if (res.ok) {
                    const txt = await res.text();
                    const health = txt ? JSON.parse(txt) : {};
                    document.getElementById('h-web').innerHTML   = "🟢 OK";
                    document.getElementById('h-gmail').innerHTML = health.gmail ? "🟢 OK" : "🔴 ERROR";
                    document.getElementById('h-sheet').innerHTML = health.sheet ? "🟢 OK" : "🔴 ERROR";
                    document.getElementById('h-ai').innerHTML    = health.ai    ? "🟢 OK" : "🔴 ERROR";
                    logError("✓ Diagnóstico finalizado con éxito.");
                } else {
                    nodes.forEach(n => document.getElementById(`h-${n}`).innerHTML = "🔴 CAÍDO");
                    logError("❌ No se pudo conectar con el motor n8n.");
                }
            } catch(e) {
                nodes.forEach(n => document.getElementById(`h-${n}`).innerHTML = "🔴 ERR");
                logError(`❌ Error de diagnóstico: ${e.message}`);
            }
        }

        // F5-08: finish usa classList en vez de style.display en el overlay
        async function finish(caseToken) {
            const caseItem = db.find(c => c.token === caseToken && c.status === 'PENDIENTE');
            if (!caseItem) { showToast('Caso no encontrado. Recarga la página.', 'error'); return; }

            const lawyerName  = document.getElementById(`law-sel-${caseToken}`).value;
            const clientEmail = document.getElementById(`asig-email-${caseToken}`)?.value?.trim() || '';
            const clientNit   = document.getElementById(`asig-nit-${caseToken}`)?.value || caseItem.nit || '';
            const clientTel   = document.getElementById(`asig-tel-${caseToken}`)?.value || '';
            const clientNotas = document.getElementById(`asig-notas-${caseToken}`)?.value || '';
            const lawyerObj   = lawyers.find(l => l.name === lawyerName);
            // FIX BUG 1: definir clienteADefender FUERA del IIFE para que esté accesible en el setTimeout posterior
            // FIX V9: buscar radio en todo el documento, no solo en el scope del bloque
            const _cadRadioOuter = document.querySelector(`input[name="cad-${caseToken}"]:checked`)
                                || document.querySelector(`input[name="cad-${caseToken}"]`); // fallback al primero si ninguno checked
            let clienteADefender = '';
            if (_cadRadioOuter && _cadRadioOuter.value && _cadRadioOuter.value.trim()) {
                clienteADefender = _cadRadioOuter.value.trim();
            } else if (caseItem.cliente_a_defender && caseItem.cliente_a_defender.trim()) {
                clienteADefender = caseItem.cliente_a_defender.trim();
            } else {
                // último recurso: primera parte del campo Partes
                clienteADefender = (caseItem.partes || '').split(/[,;·\/]|vs\.?|contra/i)[0].trim() || caseItem.partes || '';
            }

            if (!lawyerObj)     { showToast('Abogado no encontrado en el directorio.', 'error'); return; }
            // FIX: email del cliente es opcional; solo valida formato si se ingresó algo
            if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
                showToast('El email del cliente no tiene un formato válido.', 'error'); return;
            }

            const overlay = document.getElementById('loader');
            const term    = document.getElementById('term');
            overlay.classList.add('visible');   // F5-08
            term.innerHTML = '';

            const log = (msg) => {
                const p = document.createElement('p'); p.className = 'terminal-line';
                p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
                term.appendChild(p);
            };

            log(`Iniciando despacho: ${caseItem.partes}...`);

            try {
                const response = await authFetch(N8N_ASSIGN_WEBHOOK, {
                    method: 'POST',
                    body: JSON.stringify((() => {
                        // B5: leer cliente a defender del radio seleccionado
                        // FIX BUG 1: usar clienteADefender definido FUERA del IIFE
                        return {
                            row_number:                  caseItem.row_number || parseInt(caseItem.token.replace('FLV-EX-', '')) || parseInt(caseItem.token) || 2,
                            'Nombre Cliente':            clienteADefender,
                            'Estado Alerta':             'ASIGNADO',
                            email_cliente:               clientEmail,
                            nombre_cliente:              clienteADefender,
                            nombre_cliente_identificado: clienteADefender,
                            cliente_a_defender:          clienteADefender,
                            'Cliente a defender':        clienteADefender,
                            nit_cliente:                 clientNit,
                            telefono_cliente:            clientTel,
                            notas_cliente:               clientNotas,
                            abogado_responsable:         lawyerName,
                            abogado_nombre:              lawyerName,
                            email_abogado:               lawyerObj.email,
                            asunto:                      `Asignación de Caso: ${caseItem.partes}`,
                            tipo_documento:              caseItem.tipo || caseItem.rama || 'General',
                            rama:                        caseItem.rama,
                            vencimiento:                 caseItem.venc,
                            'Fecha de Vencimiento':      caseItem.venc,
                            token:                       caseItem.token,
                            case_description:            caseItem.desc,
                            informe_html:                caseItem.informe_html || "<!--FLOOVU_AB_PLACEHOLDER-->",
                            messageId:                   caseItem.messageId || ''
                        };
                    })())
                });

                if (response.ok) {
                    const resText = await response.text();
                    let resData = {};
                    try { if (resText) resData = JSON.parse(resText); } catch(err) {}
                    log(`✓ n8n: recepción confirmada.`);
                    if (resData?.debug) log(`📡 ${resData.debug}`);
                    log(`✓ Informe enviado a ${lawyerObj.email}.`);

                    // AUTOMATIC CLIENT SAVE TO DIRECTORY
                    try {
                        log(`Guardando cliente en el directorio...`);
                        const clientRes = await authFetch(N8N_CLIENT_SAVE, {
                            method: 'POST',
                            body: JSON.stringify({
                                nombre: clienteADefender,
                                nit: clientNit,
                                email: clientEmail,
                                telefono: clientTel,
                                notas: clientNotas,
                                abogado: lawyerName,
                                token: caseItem.token
                            })
                        });
                        if (clientRes.ok) {
                            log(`✓ Cliente guardado en directorio exitosamente.`);
                        } else {
                            log(`⚠️ Aviso: Respuesta inesperada al guardar cliente (${clientRes.status}).`);
                        }
                    } catch(e) {
                        log(`⚠️ Aviso: No se pudo guardar cliente en directorio.`);
                    }

                    // AUTOMATIC OBSERVATION SAVE TO ANOTACIONES SHEET
                    if (clientNotas && clientNotas.trim() !== '') {
                        try {
                            log(`Guardando nota en Anotaciones...`);
                            const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                            await authFetch(WH.SAVE_OBS || WH.CLIENT_SAVE.replace('guardar-cliente', 'guardar-observacion'), {
                                method: 'POST',
                                body: JSON.stringify({
                                    token: caseItem.token,
                                    tipo: 'NOTA',
                                    texto: clientNotas,
                                    anotacion: clientNotas,
                                    visibilidad: 'Interno',
                                    operador: window.currentUser?.name || lawyerName || 'Asignador',
                                    fecha: new Date().toLocaleString('es-CO')
                                })
                            });
                            log(`✓ Nota guardada en hoja de Anotaciones.`);
                        } catch(e) {
                            log(`⚠️ Aviso: No se pudo registrar la nota de asignación.`);
                        }
                    }

                    log(`✓ Operación finalizada. Sincronizando datos...`);
                    setTimeout(() => {
                        overlay.classList.remove('visible');
                        // FIX: Hacer refresh REAL de los datos desde GS para sincronizar con W1B
                        // Timeout aumentado a 10s para dar tiempo al pipeline completo de n8n
                        loadRealData().then(() => {
                            loadClients();
                            showToast('Caso asignado y sincronizado correctamente.', 'success');
                        }).catch(err => {
                            logError(`Error al recargar datos: ${err.message}`);
                        });
                    }, 10000);
                } else {
                    throw new Error(`Error en n8n: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                log(`❌ ERROR: ${error.message}`);
                const btn = document.createElement('button');
                btn.innerText = "Cerrar";
                btn.style.cssText = "margin-top:10px;background:#333;border:1px solid #555;color:#fff;padding:6px 16px;border-radius:6px;cursor:pointer;";
                btn.onclick = () => overlay.classList.remove('visible');
                term.appendChild(btn);
            }
        }

        // ══════════════════════════════════════════
        // CLIENTES — Directorio unificado
        // Fuente 1: hoja CLIENTES (directorio manual)
        // Fuente 2: db (casos del Registro Legal)
        // ══════════════════════════════════════════

        // ══════════════════════════════════════════
        // GESTIÓN DE USUARIOS — Sheet como fuente
        // ══════════════════════════════════════════

        async function loadUsuariosAdmin() {
            const container = document.getElementById('usuarios-list-container');
            if (!container) return;
            container.innerHTML = '<p style="color:var(--silver);font-size:0.82rem;text-align:center;padding:2rem;">⏳ Cargando...</p>';
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.GET_USUARIOS, { method: 'POST' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const _txt2 = await res.text();
                let data = {};
                try { if (_txt2) data = JSON.parse(_txt2); } catch(_e) {}
                const lista = data.usuarios || [];
                if (!lista.length) {
                    container.innerHTML = '<p style="color:var(--silver);font-size:0.82rem;text-align:center;padding:2rem;">Sin usuarios en el Sheet aún.</p>';
                    return;
                }
                container.innerHTML = lista.map(u => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;">
                        <div>
                            <p style="font-weight:700;font-size:0.88rem;color:var(--white);margin:0;">@${u.username}</p>
                            <p style="font-size:0.72rem;color:var(--silver);margin:2px 0 0;">${u.nombre || '—'} · ${u.email || 'sin email'}</p>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.65rem;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;${u.rol==='admin' ? 'background:rgba(201,168,76,0.15);color:var(--gold);border:1px solid rgba(201,168,76,0.3);' : 'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.25);'}">${u.rol==='admin' ? 'Admin' : 'Operador'}</span>
                            <button onclick="eliminarUsuario('${u.username}')" style="background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.2);padding:4px 10px;border-radius:6px;font-size:0.7rem;cursor:pointer;" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.08)'">🗑</button>
                        </div>
                    </div>`).join('');
            } catch(e) {
                container.innerHTML = `<p style="color:#ef4444;font-size:0.82rem;padding:1rem;">Error cargando usuarios: ${e.message}</p>`;
            }
        }

        async function crearUsuario() {
            const nombre   = document.getElementById('nu-nombre')?.value?.trim();
            const username = document.getElementById('nu-username')?.value?.trim();
            const email    = document.getElementById('nu-email')?.value?.trim();
            const rol      = document.getElementById('nu-rol')?.value;
            const pass1    = document.getElementById('nu-pass')?.value;
            const pass2    = document.getElementById('nu-pass2')?.value;
            const msgEl    = document.getElementById('nu-msg');

            const showMsg = (txt, ok) => {
                msgEl.style.display = 'block';
                msgEl.style.background = ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
                msgEl.style.border = ok ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)';
                msgEl.style.color = ok ? '#22c55e' : '#ef4444';
                msgEl.textContent = txt;
            };

            if (!nombre || !username || !pass1) { showMsg('Completá nombre, usuario y contraseña.', false); return; }
            if (pass1 !== pass2) { showMsg('Las contraseñas no coinciden.', false); return; }
            if (pass1.length < 8) { showMsg('La contraseña debe tener al menos 8 caracteres.', false); return; }

            try {
                const hash = await sha256(pass1);
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.SAVE_USUARIO, {
                    method: 'POST',
                    body: JSON.stringify({ username, hash, nombre, email, rol })
                });
                const _txt3 = await res.text();
                let data = {};
                try { if (_txt3) data = JSON.parse(_txt3); } catch(_e) {}
                if (res.ok && data.ok) {
                    showMsg(`✅ Usuario @${username} creado correctamente.`, true);
                    ['nu-nombre','nu-username','nu-email','nu-pass','nu-pass2'].forEach(id => {
                        const el = document.getElementById(id); if (el) el.value = '';
                    });
                    document.getElementById('nu-rol').value = 'operator';
                    loadUsuariosAdmin();
                } else {
                    showMsg('Error: ' + (data.message || data.error || res.status), false);
                }
            } catch(e) { showMsg('Error de red: ' + e.message, false); }
        }

        async function eliminarUsuario(username) {
            if (!confirm(`¿Eliminar al usuario @${username}? Esta acción no se puede deshacer.`)) return;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.DEL_USUARIO, {
                    method: 'POST',
                    body: JSON.stringify({ username })
                });
                const _txt4 = await res.text();
                let data = {};
                try { if (_txt4) data = JSON.parse(_txt4); } catch(_e) {}
                if (res.ok && data.ok) {
                    showToast(`Usuario @${username} eliminado.`, 'ok');
                    loadUsuariosAdmin();
                } else {
                    showToast('Error al eliminar: ' + (data.error || res.status), 'error');
                }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        function checkNuStrength(val) {
            const bar = document.getElementById('nu-strength-bar');
            const lbl = document.getElementById('nu-strength-label');
            if (!bar || !lbl) return;
            const score = [val.length >= 8, /[A-Z]/.test(val), /[0-9]/.test(val), /[^a-zA-Z0-9]/.test(val)].filter(Boolean).length;
            const cfg = [{w:'25%',c:'#ef4444',t:'Débil'},{w:'50%',c:'#f97316',t:'Regular'},{w:'75%',c:'#eab308',t:'Buena'},{w:'100%',c:'#22c55e',t:'Fuerte'}];
            const s = cfg[score-1] || {w:'0%',c:'transparent',t:'—'};
            bar.style.width = s.w; bar.style.background = s.c; lbl.textContent = s.t; lbl.style.color = s.c;
        }

        async function loadClients() {
            const container = document.getElementById('client-list-container');
            if (container) container.innerHTML = '<p style="color:var(--silver);font-size:0.85rem;text-align:center;padding:2rem;">⏳ Cargando directorio...</p>';
            let manualClients = [];
            try {
                const res = await authFetch(N8N_GET_CLIENTS, { method: 'POST' });
                if (res.ok) {
                    let raw = [];
                    try { const txt = await res.text(); raw = txt ? JSON.parse(txt) : []; } catch(e) {}
                    manualClients = (Array.isArray(raw) ? raw : (raw ? [raw] : []))
                        .map(c => ({
                            nombre:   c.nombre   || c.Nombre   || c.NOMBRE   || '',
                            nit:      c.nit      || c.NIT      || c.nit_cedula || c.NIT_Cedula || c.nit_cliente || '',
                            email:    c.email    || c.Email    || c.EMAIL    || '',
                            telefono: c.telefono || c.Telefono || c.TELEFONO || c.phone || '',
                            notas:    c.notas    || c.Notas    || c.NOTAS    || '',
                            abogado:  c.abogado  || c.Abogado  || c['Abogado Asignado'] || c.abogado_asignado || '',
                            estado:   c.estado   || c.Estado   || 'DIRECTORIO',
                            _source:  'directorio'
                        }))
                        .filter(c => c.nombre && c.nombre.trim() !== '');
                }
            } catch(e) { logError(`Error cargando clientes: ${e.message}`); }

            // Combinar con casos del Registro Legal
            const casesAsClients = db
                .filter(c => {
                    const n = c.cliente_a_defender || (c.partes_array && c.partes_array[0]) || c.partes || '';
                    return n && n.trim() !== '' && n !== '—';
                })
                .map(c => {
                // Usar cliente_a_defender si existe, sino primera parte de "partes"
                const clienteName = c.cliente_a_defender || (c.partes_array && c.partes_array[0]) || c.partes || '—';
                const datosIncompletos = !c.nit || c.nit === 'DESCONOCIDO';
                const abogadoAsignado = c.lawyer && c.lawyer !== 'PENDIENTE' && c.lawyer !== 'Pendiente' ? c.lawyer : '';
                return {
                    nombre:   clienteName,
                    nit:      (c.nit && c.nit !== 'DESCONOCIDO') ? c.nit : '',
                    email:    '',
                    telefono: '',
                    notas:    `Caso: ${c.rama || ''} | Token: ${c.token || ''}`,
                    token:    c.token,
                    abogado:  abogadoAsignado,
                    venc:     c.venc     || 'S/D',
                    estado:   abogadoAsignado ? 'ASIGNADO' : (c.status || '—'),
                    _source:  'registro',
                    _incompleto: datosIncompletos
                };
            });

            // Unificar — los del directorio primero, luego casos sin match en directorio
            const nombresDirectorio = new Set(manualClients.map(c => (c.nombre || '').toLowerCase().trim()));
            const casesNuevos = casesAsClients.filter(c =>
                !nombresDirectorio.has((c.nombre || '').toLowerCase().trim())
            );

            clients = [...manualClients, ...casesNuevos];
            allClientRows = [...clients];
            renderClients(clients);
            logError(`✓ ${manualClients.length} del directorio + ${casesNuevos.length} del registro = ${clients.length} clientes.`);
        }

        function filterClients(query) {
            if (!query.trim()) { renderClients(allClientRows); return; }
            const q = query.toLowerCase();
            const filtered = allClientRows.filter(c =>
                (c.nombre || '').toLowerCase().includes(q) ||
                (c.nit    || '').toLowerCase().includes(q) ||
                (c.email  || '').toLowerCase().includes(q) ||
                (c.abogado|| '').toLowerCase().includes(q)
            );
            renderClients(filtered);
        }

        function renderClients(list) {
            const container = document.getElementById('client-list-container');
            if (!container) return;
            if (!list || !list.length) {
                container.innerHTML = `<div class="empty-state-svg no-bg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg><span>Sin clientes registrados.</span></div>`;
                return;
            }
            container.innerHTML = `
                <div class="table-scroll"><table>
                    <thead><tr>
                        <th>CLIENTE</th>
                        <th>NIT / CÉDULA</th>
                        <th>EMAIL</th>
                        <th>TELÉFONO</th>
                        <th>ABOGADO ASIGNADO</th>
                        <th>ESTADO</th>
                        <th>ORIGEN</th>
                        <th></th>
                    </tr></thead>
                    <tbody>
                        ${list.map((c, i) => `
                        <tr${c._incompleto ? ' style="border-left:3px solid #f59e0b;"' : ''}>
                            <td style="font-weight:600;color:var(--white);">
                                ${esc(c.nombre || '—')}
                                ${c._incompleto ? '<div style="font-size:0.68rem;color:#f59e0b;margin-top:3px;">⚠ Datos incompletos — actualizar</div>' : ''}
                            </td>
                            <td style="color:${!c.nit || c.nit === '—' ? '#f59e0b' : 'var(--silver)'};font-size:0.8rem;">${esc(c.nit || '—')}</td>
                            <td style="color:${!c.email || c.email === '—' ? '#f59e0b' : 'var(--silver)'};font-size:0.8rem;">${esc(c.email || '—')}</td>
                            <td style="color:${!c.telefono || c.telefono === '—' ? '#f59e0b' : 'var(--silver)'};font-size:0.8rem;">${esc(c.telefono || '—')}</td>
                            <td>
                                ${c._source === 'registro' && !c.abogado
                                    ? `<select id="cli-law-${allClientRows.indexOf(c)}" onchange="assignLawyerFromClients(${allClientRows.indexOf(c)}, this.value)"
                                        style="background:rgba(255,255,255,0.05);color:white;border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:0.78rem;width:100%;">
                                        <option value="">— Asignar —</option>
                                        ${lawyers.map(l => `<option value="${esc(l.name)}" ${c.abogado === l.name ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}
                                      </select>`
                                    : `<span style="color:${c.abogado ? 'var(--white)' : 'var(--silver)'};font-style:${c.abogado ? 'normal' : 'italic'};">${esc(c.abogado || '—')}</span>`
                                }
                            </td>
                            <td><span style="font-size:0.7rem;font-weight:700;color:${c.estado === 'ASIGNADO' ? '#22c55e' : c._source === 'directorio' ? 'var(--gold)' : 'var(--silver)'};">${esc(c.estado || (c._source === 'directorio' ? 'DIRECTORIO' : '—'))}</span></td>
                            <td><span style="font-size:0.68rem;padding:2px 8px;border-radius:20px;background:${c._source === 'directorio' ? 'rgba(197,160,89,0.15)' : 'rgba(255,255,255,0.05)'};color:${c._source === 'directorio' ? 'var(--gold)' : 'var(--silver)'};">${c._source === 'directorio' ? 'Directorio' : 'Registro'}</span></td>
                            <td style="display:flex;gap:6px;align-items:center;">
                            <button class="btn-outline" style="font-size:0.72rem;padding:0 10px;height:28px;" onclick="openClientModal(${allClientRows.indexOf(c)})" title="Editar">✏️</button>
                            ${c._source === 'directorio' ? `<button class="btn-outline" style="font-size:0.72rem;padding:0 10px;height:28px;color:#ef4444;border-color:#ef4444;" onclick="deleteClient(${allClientRows.indexOf(c)})" title="Eliminar">🗑</button>` : ''}
                        </td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
        }

        // ══════════════════════════════════════════
        // EXPORTAR CLIENTES — Excel y PDF
        // ══════════════════════════════════════════

        // ══════════════════════════════════════════
        // EXPORTAR — según perfil
        // Admin:    Panel de Agencia + Configuración
        // Operador: Todas sus pestañas
        // ══════════════════════════════════════════

        function exportClientsExcel() {
            var isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'AGENCIA' || currentUser.role === 'agencia');
            var NL = '\n', sep = ',';
            var q  = function(v) { return '"' + String(v||'').replace(/"/g,'""') + '"'; };
            var csv = '\uFEFF';
            var filename = '';

            if (isAdmin) {
                // ── ADMIN: Panel de Agencia + Configuración ──
                if (!db || !db.length) { showToast('Sin datos para exportar.', 'error'); return; }

                var total     = db.length;
                var asignados = db.filter(function(c){ return c.lawyer && c.lawyer !== 'Pendiente'; }).length;
                var scores    = db.filter(function(c){ return c.score > 0; }).map(function(c){ return c.score; });
                var avgScore  = scores.length ? (scores.reduce(function(a,b){return a+b;},0)/scores.length).toFixed(1) : 'N/A';
                var totalMin  = db.reduce(function(acc,c){ return acc+(c.ahorroMin||0); }, 0);
                var hrsStr    = totalMin > 0 ? (totalMin/60).toFixed(1)+'h' : '0h';
                var ramaCount = {};
                db.forEach(function(c){ var r=c.rama||'General'; ramaCount[r]=(ramaCount[r]||0)+1; });

                // KPIs
                csv += '=== PANEL DE AGENCIA — FLOOVU Legal AI PRO V8 ===' + NL;
                csv += 'Generado el: ' + new Date().toLocaleString('es-CO') + NL + NL;
                csv += '=== KPIs ===' + NL;
                csv += [q('Métrica'), q('Valor')].join(sep) + NL;
                csv += [q('Total de casos'),        q(total)].join(sep) + NL;
                csv += [q('Casos asignados'),        q(asignados)].join(sep) + NL;
                csv += [q('Casos pendientes'),       q(total - asignados)].join(sep) + NL;
                csv += [q('Score IA promedio'),      q(avgScore + '/10')].join(sep) + NL;
                csv += [q('Horas ahorradas por IA'), q(hrsStr)].join(sep) + NL + NL;

                // Distribución por rama
                csv += '=== DISTRIBUCIÓN POR RAMA ===' + NL;
                csv += [q('Rama'), q('Casos'), q('Porcentaje')].join(sep) + NL;
                Object.keys(ramaCount).forEach(function(r) {
                    csv += [q(r), q(ramaCount[r]), q(Math.round(ramaCount[r]/total*100)+'%')].join(sep) + NL;
                });
                csv += NL;

                // Registro completo de casos
                csv += '=== REGISTRO DE CASOS ===' + NL;
                csv += [q('Fecha'),q('Rama'),q('Tipo'),q('Abogado'),q('Vencimiento'),q('Score IA'),q('Estado'),q('Tiempo IA')].join(sep) + NL;
                db.forEach(function(c) {
                    csv += [
                        q(c.date), q(c.rama), q(c.tipo||'—'),
                        q(c.lawyer||'Pendiente'), q(c.venc||'—'),
                        q(c.score>0 ? c.score+'/10' : '—'),
                        q(c.status||'—'),
                        q(c.ahorroMin>0 ? Math.round(c.ahorroMin/60*10)/10+'h' : '—')
                    ].join(sep) + NL;
                });
                csv += NL;

                // Configuración: abogados del directorio
                csv += '=== DIRECTORIO DE ABOGADOS ===' + NL;
                csv += [q('Nombre'),q('Email'),q('Especialidad')].join(sep) + NL;
                if (lawyers && lawyers.length) {
                    lawyers.forEach(function(l) {
                        csv += [q(l.name||'—'), q(l.email||'—'), q(l.spec||l.especialidad||'—')].join(sep) + NL;
                    });
                } else {
                    csv += q('Sin abogados registrados') + NL;
                }

                filename = 'Floovu_Agencia_' + new Date().toISOString().slice(0,10) + '.csv';

            } else {
                // ── OPERADOR: todas sus pestañas ──
                var opName   = currentUser && currentUser.name;
                var opEmail  = currentUser && currentUser.email;
                var misCasos = db.filter(function(c){ return c.lawyer && c.lawyer === opName; });
                var misExpedientes = db.filter(function(c){ return c.lawyer && c.lawyer === opName; });

                csv += '=== REPORTE DE OPERADOR — FLOOVU Legal AI PRO V8 ===' + NL;
                csv += 'Operador: ' + (opName||'—') + ' | Email: ' + (opEmail||'—') + NL;
                csv += 'Generado el: ' + new Date().toLocaleString('es-CO') + NL + NL;

                // Resumen dashboard
                var scores2   = misCasos.filter(function(c){ return c.score>0; }).map(function(c){ return c.score; });
                var avgScore2 = scores2.length ? (scores2.reduce(function(a,b){return a+b;},0)/scores2.length).toFixed(1) : 'N/A';
                var totalMin2 = misCasos.reduce(function(acc,c){ return acc+(c.ahorroMin||0); },0);
                csv += '=== DASHBOARD — MIS MÉTRICAS ===' + NL;
                csv += [q('Métrica'),q('Valor')].join(sep) + NL;
                csv += [q('Casos asignados'), q(misCasos.length)].join(sep) + NL;
                csv += [q('Score IA promedio'), q(avgScore2+'/10')].join(sep) + NL;
                csv += [q('Horas ahorradas'), q(totalMin2>0?(totalMin2/60).toFixed(1)+'h':'0h')].join(sep) + NL + NL;

                // Expedientes / Registro Legal
                csv += '=== REGISTRO LEGAL — MIS CASOS ===' + NL;
                csv += [q('Token'),q('Fecha'),q('Rama'),q('Partes'),q('Tipo'),q('Vencimiento'),q('Score IA'),q('Estado'),q('Tiempo IA')].join(sep) + NL;
                misExpedientes.forEach(function(c) {
                    csv += [
                        q(c.token||'—'), q(c.date||'—'), q(c.rama||'—'),
                        q(c.partes||'—'), q(c.tipo||'—'), q(c.venc||'—'),
                        q(c.score>0?c.score+'/10':'—'), q(c.status||'—'),
                        q(c.ahorroMin>0?Math.round(c.ahorroMin/60*10)/10+'h':'—')
                    ].join(sep) + NL;
                });
                csv += NL;

                // Clientes asociados a sus casos
                csv += '=== MIS CLIENTES ===' + NL;
                csv += [q('Nombre'),q('Email'),q('Teléfono'),q('NIT / Cédula'),q('Estado'),q('Notas')].join(sep) + NL;
                var clientesVistos = {};
                misCasos.forEach(function(c) {
                    if (!allClientRows) return;
                    allClientRows.forEach(function(cl) {
                        if (cl.nombre && c.partes && c.partes.toLowerCase().includes(cl.nombre.toLowerCase()) && !clientesVistos[cl.nombre]) {
                            clientesVistos[cl.nombre] = true;
                            csv += [
                                q(cl.nombre||'—'), q(cl.email||'—'), q(cl.telefono||'—'),
                                q(cl.nit||'—'), q(cl.estado||'—'), q(cl.notas||'—')
                            ].join(sep) + NL;
                        }
                    });
                });
                csv += NL;

                // Agenda judicial de sus casos
                csv += '=== AGENDA JUDICIAL — MIS VENCIMIENTOS ===' + NL;
                csv += [q('Fecha'),q('Partes'),q('Rama'),q('Tipo'),q('Abogado'),q('Vencimiento')].join(sep) + NL;
                var conVenc = misCasos.filter(function(c){ return c.venc && c.venc !== 'S/D' && c.venc !== 'N/A'; });
                if (conVenc.length) {
                    conVenc.forEach(function(c) {
                        csv += [q(c.date||'—'),q(c.partes||'—'),q(c.rama||'—'),q(c.tipo||'—'),q(c.lawyer||'—'),q(c.venc||'—')].join(sep) + NL;
                    });
                } else {
                    csv += q('Sin vencimientos registrados') + NL;
                }

                filename = 'Floovu_Operador_' + (opName||'').replace(/\s+/g,'_') + '_' + new Date().toISOString().slice(0,10) + '.csv';
            }

            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
            showToast('✓ Exportado correctamente', 'ok');
        }

        function exportClientsPDF() {
            var isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'AGENCIA' || currentUser.role === 'agencia');
            var now     = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' });
            var G = '#C9A84C', D = '#060a14', S = '#7a8fa6';

            var css = '<style>*{margin:0;padding:0;box-sizing:border-box;}' +
                'body{font-family:Segoe UI,Arial,sans-serif;color:#111;font-size:11px;}' +
                '.cover{background:' + D + ';color:#fff;padding:40px;margin-bottom:20px;}' +
                '.cover h1{font-size:24px;font-weight:800;color:' + G + ';margin-bottom:4px;}' +
                '.cover p{font-size:11px;color:' + S + ';margin-top:4px;}' +
                '.sec{font-size:12px;font-weight:800;color:' + D + ';border-left:4px solid ' + G + ';padding-left:10px;margin:20px 0 10px;text-transform:uppercase;letter-spacing:1px;}' +
                'table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:10px;}' +
                'th{background:' + D + ';color:' + G + ';padding:7px 10px;text-align:left;font-size:9px;letter-spacing:1px;text-transform:uppercase;}' +
                'td{padding:6px 10px;border-bottom:1px solid #eee;}' +
                'tr:nth-child(even) td{background:#f9f9f9;}' +
                '.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}' +
                '.kpi{background:#f5f0e8;border-left:3px solid ' + G + ';padding:12px;border-radius:4px;}' +
                '.kpi-val{font-size:20px;font-weight:800;color:' + D + ';}' +
                '.kpi-lbl{font-size:9px;color:' + S + ';text-transform:uppercase;letter-spacing:1px;margin-top:2px;}' +
                '.badge-green{background:rgba(34,197,94,0.12);color:#166534;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;}' +
                '.badge-gold{background:rgba(201,168,76,0.12);color:#8a6a1a;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;}' +
                '.badge-grey{background:#f0f0f0;color:#555;padding:2px 8px;border-radius:20px;font-size:9px;}' +
                '.footer{margin-top:24px;padding-top:10px;border-top:1px solid #ddd;font-size:9px;color:' + S + ';text-align:center;}' +
                '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>';

            var body = '';

            if (isAdmin) {
                if (!db || !db.length) { showToast('Sin datos para exportar.', 'error'); return; }
                var total    = db.length;
                var asig     = db.filter(function(c){ return c.lawyer && c.lawyer !== 'Pendiente'; }).length;
                var scores   = db.filter(function(c){ return c.score>0; }).map(function(c){ return c.score; });
                var avg      = scores.length ? (scores.reduce(function(a,b){return a+b;},0)/scores.length).toFixed(1) : 'N/A';
                var totalMin = db.reduce(function(acc,c){ return acc+(c.ahorroMin||0); },0);
                var hrs      = totalMin>0?(totalMin/60).toFixed(1)+'h':'0h';
                var ramaCount = {};
                db.forEach(function(c){ var r=c.rama||'General'; ramaCount[r]=(ramaCount[r]||0)+1; });

                body += '<div class="cover"><h1>⚖ Floovu Legal AI PRO V8</h1>' +
                    '<p>Reporte de Agencia</p><p style="opacity:0.5;margin-top:8px;font-size:10px;">Generado el ' + now + '</p></div>';
                body += '<div style="padding:0 32px 32px;">';
                body += '<div class="sec">KPIs del Panel</div>';
                body += '<div class="kpi-grid">' +
                    '<div class="kpi"><div class="kpi-val">' + total + '</div><div class="kpi-lbl">Casos Procesados</div></div>' +
                    '<div class="kpi"><div class="kpi-val">' + avg + '/10</div><div class="kpi-lbl">Score IA Global</div></div>' +
                    '<div class="kpi"><div class="kpi-val">' + hrs + '</div><div class="kpi-lbl">Horas Ahorradas</div></div>' +
                    '<div class="kpi"><div class="kpi-val">' + asig + '/' + total + '</div><div class="kpi-lbl">Casos Asignados</div></div>' +
                    '</div>';

                body += '<div class="sec">Distribución por Rama</div>';
                body += '<table><thead><tr><th>Rama</th><th>Casos</th><th>Porcentaje</th></tr></thead><tbody>';
                Object.keys(ramaCount).forEach(function(r) {
                    body += '<tr><td>' + r + '</td><td>' + ramaCount[r] + '</td><td>' + Math.round(ramaCount[r]/total*100) + '%</td></tr>';
                });
                body += '</tbody></table>';

                body += '<div class="sec">Registro de Casos</div>';
                body += '<table><thead><tr><th>Fecha</th><th>Rama</th><th>Tipo</th><th>Abogado</th><th>Vencimiento</th><th>Score IA</th><th>Estado</th></tr></thead><tbody>';
                db.slice(0,50).forEach(function(c) {
                    var badge = c.status==='ASIGNADO' ? 'badge-green' : 'badge-grey';
                    body += '<tr><td>' + (c.date||'—') + '</td><td>' + (c.rama||'—') + '</td><td>' + (c.tipo||'—') + '</td>' +
                        '<td>' + (c.lawyer||'Pendiente') + '</td>' +
                        '<td style="color:' + (c.venc&&c.venc!=='S/D'?'#c0392b':'#555') + ';">' + (c.venc||'—') + '</td>' +
                        '<td style="font-weight:700;">' + (c.score>0?c.score+'/10':'—') + '</td>' +
                        '<td><span class="' + badge + '">' + (c.status||'—') + '</span></td></tr>';
                });
                body += '</tbody></table>';

                body += '<div class="sec">Directorio de Abogados</div>';
                body += '<table><thead><tr><th>Nombre</th><th>Email</th><th>Especialidad</th></tr></thead><tbody>';
                if (lawyers && lawyers.length) {
                    lawyers.forEach(function(l) {
                        body += '<tr><td>' + (l.name||'—') + '</td><td>' + (l.email||'—') + '</td><td>' + (l.spec||l.especialidad||'—') + '</td></tr>';
                    });
                } else { body += '<tr><td colspan="3" style="text-align:center;color:' + S + ';">Sin abogados registrados</td></tr>'; }
                body += '</tbody></table>';

            } else {
                // ── OPERADOR ──
                var opName  = currentUser && currentUser.name;
                var opEmail = currentUser && currentUser.email;
                var misCasos = db.filter(function(c){ return c.lawyer && c.lawyer === opName; });
                if (!misCasos.length) { showToast('No tenés casos asignados para exportar.', 'error'); return; }

                var scores2  = misCasos.filter(function(c){ return c.score>0; }).map(function(c){ return c.score; });
                var avg2     = scores2.length ? (scores2.reduce(function(a,b){return a+b;},0)/scores2.length).toFixed(1) : 'N/A';
                var totalMin2 = misCasos.reduce(function(acc,c){ return acc+(c.ahorroMin||0); },0);

                body += '<div class="cover"><h1>⚖ Floovu Legal AI PRO V8</h1>' +
                    '<p>Reporte de Operador — ' + (opName||'') + '</p>' +
                    '<p style="opacity:0.5;margin-top:8px;font-size:10px;">' + (opEmail||'') + ' · Generado el ' + now + '</p></div>';
                body += '<div style="padding:0 32px 32px;">';

                body += '<div class="sec">Mis Métricas</div>';
                body += '<div class="kpi-grid">' +
                    '<div class="kpi"><div class="kpi-val">' + misCasos.length + '</div><div class="kpi-lbl">Casos Asignados</div></div>' +
                    '<div class="kpi"><div class="kpi-val">' + avg2 + '/10</div><div class="kpi-lbl">Score IA Promedio</div></div>' +
                    '<div class="kpi"><div class="kpi-val">' + (totalMin2>0?(totalMin2/60).toFixed(1)+'h':'0h') + '</div><div class="kpi-lbl">Horas Ahorradas</div></div>' +
                    '</div>';

                body += '<div class="sec">Registro Legal — Mis Casos</div>';
                body += '<table><thead><tr><th>Fecha</th><th>Partes</th><th>Rama</th><th>Tipo</th><th>Vencimiento</th><th>Score IA</th><th>Estado</th></tr></thead><tbody>';
                misCasos.forEach(function(c) {
                    var badge = c.status==='ASIGNADO'?'badge-green':'badge-grey';
                    body += '<tr><td>' + (c.date||'—') + '</td><td style="font-weight:600;">' + (c.partes||'—') + '</td>' +
                        '<td>' + (c.rama||'—') + '</td><td>' + (c.tipo||'—') + '</td>' +
                        '<td style="color:' + (c.venc&&c.venc!=='S/D'?'#c0392b':'#555') + ';">' + (c.venc||'—') + '</td>' +
                        '<td style="font-weight:700;">' + (c.score>0?c.score+'/10':'—') + '</td>' +
                        '<td><span class="' + badge + '">' + (c.status||'—') + '</span></td></tr>';
                });
                body += '</tbody></table>';

                // Clientes asociados
                body += '<div class="sec">Mis Clientes</div>';
                body += '<table><thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>NIT / Cédula</th><th>Estado</th><th>Notas</th></tr></thead><tbody>';
                var vistos = {};
                var hayClientes = false;
                misCasos.forEach(function(c) {
                    if (!allClientRows) return;
                    allClientRows.forEach(function(cl) {
                        if (cl.nombre && c.partes && c.partes.toLowerCase().includes(cl.nombre.toLowerCase()) && !vistos[cl.nombre]) {
                            vistos[cl.nombre] = true;
                            hayClientes = true;
                            var badge2 = cl.estado==='ASIGNADO'?'badge-green':'badge-gold';
                            body += '<tr><td style="font-weight:600;">' + (cl.nombre||'—') + '</td><td>' + (cl.email||'—') + '</td>' +
                                '<td>' + (cl.telefono||'—') + '</td><td>' + (cl.nit||'—') + '</td>' +
                                '<td><span class="' + badge2 + '">' + (cl.estado||'—') + '</span></td>' +
                                '<td>' + (cl.notas||'—') + '</td></tr>';
                        }
                    });
                });
                if (!hayClientes) body += '<tr><td colspan="6" style="text-align:center;color:' + S + ';">Sin clientes asociados</td></tr>';
                body += '</tbody></table>';

                // Agenda judicial
                var conVenc = misCasos.filter(function(c){ return c.venc && c.venc !== 'S/D' && c.venc !== 'N/A'; });
                if (conVenc.length) {
                    body += '<div class="sec">Agenda Judicial — Mis Vencimientos</div>';
                    body += '<table><thead><tr><th>Fecha Caso</th><th>Partes</th><th>Rama</th><th>Tipo</th><th>Vencimiento</th></tr></thead><tbody>';
                    conVenc.forEach(function(c) {
                        body += '<tr><td>' + (c.date||'—') + '</td><td>' + (c.partes||'—') + '</td>' +
                            '<td>' + (c.rama||'—') + '</td><td>' + (c.tipo||'—') + '</td>' +
                            '<td style="color:#c0392b;font-weight:700;">' + c.venc + '</td></tr>';
                    });
                    body += '</tbody></table>';
                }
            }

            body += '<div class="footer">Floovu Legal AI PRO V8 · Reporte confidencial · ' + now + '</div></div>';

            var html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte Floovu</title>' + css + '</head><body>' + body + '</body></html>';
            var win = window.open('', '_blank');
            if (!win) { showToast('Habilitá las ventanas emergentes para exportar PDF.', 'error'); return; }
            win.document.write(html);
            win.document.close();
            win.onload = function() { win.focus(); win.print(); };
            showToast('✓ PDF listo para imprimir / guardar', 'ok');
        }


        async function addClient() {
            const nombre   = document.getElementById('new-cli-nombre').value.trim().replace(/[<>"'&]/g,'');
            const nit      = document.getElementById('new-cli-nit').value.trim().replace(/[<>"'&]/g,'');
            const email    = document.getElementById('new-cli-email').value.trim();
            const telefono = document.getElementById('new-cli-telefono').value.trim().replace(/[<>"'&]/g,'');
            const notas    = document.getElementById('new-cli-notas').value.trim().replace(/[<>"'&]/g,'');
            if (!nombre) { showToast('El nombre es obligatorio.', 'error'); return; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('El email no es válido.', 'error'); return; }
            logError(`Guardando cliente: ${nombre}...`);
            try {
                const res = await authFetch(N8N_CLIENT_SAVE, {
                    method: 'POST',
                    body: JSON.stringify({ nombre, nit, email, telefono, notas })
                });
                if (res.ok) {
                    showToast(`${nombre} guardado en el directorio.`, 'ok');
                    logError(`✓ Cliente guardado en Google Sheets.`);
                    ['new-cli-nombre','new-cli-nit','new-cli-email','new-cli-telefono','new-cli-notas'].forEach(id => {
                        document.getElementById(id).value = '';
                    });
                    await loadClients();
                } else {
                    showToast(`Error del servidor: ${esc(String(res.status))}`, 'error');
                }
            } catch(e) { showToast('No se pudo conectar con n8n.', 'error'); logError(`Error: ${e.message}`); }
        }

        function openClientModal(idx) {
            const c = allClientRows[idx];
            if (!c) return;
            document.getElementById('edit-client-idx').value    = idx;
            document.getElementById('edit-client-source').value = c._source || 'directorio';
            document.getElementById('edit-cli-nombre').value    = c.nombre   || '';
            document.getElementById('edit-cli-nit').value       = c.nit      || '';
            document.getElementById('edit-cli-email').value     = c.email    || '';
            document.getElementById('edit-cli-telefono').value  = c.telefono || '';
            document.getElementById('edit-cli-notas').value     = c.notas    || '';
            // Populate abogado dropdown with current lawyers list
            const sel = document.getElementById('edit-cli-abogado');
            if (sel) {
                sel.innerHTML = '<option value="">— Sin asignar —</option>' +
                    (lawyers || []).map(l =>
                        `<option value="${esc(l.name)}" ${(c.abogado || '') === l.name ? 'selected' : ''}>${esc(l.name)}</option>`
                    ).join('');
                sel.value = c.abogado || '';
            }
            document.getElementById('client-edit-modal').classList.add('visible');
            // Guardar nombre globalmente y cargar observaciones relacionadas
            window._currentClientModalName = c.nombre || '';
            loadClientModalObservaciones(c.nombre || '');
        }

        function closeClientModal() {
            document.getElementById('client-edit-modal').classList.remove('visible');
        }

        // ══════════════════════════════════════════
        // OBSERVACIONES EN PERFIL DEL CLIENTE
        // ══════════════════════════════════════════

        async function loadClientModalObservaciones(clienteNombre) {
            const listEl = document.getElementById('client-modal-obs-list');
            if (!listEl) return;
            listEl.innerHTML = '<p style="font-size:0.78rem;color:var(--silver);font-style:italic;text-align:center;padding:12px;">⏳ Cargando observaciones...</p>';

            // Buscar todos los tokens de casos asociados a este cliente
            const clientTokens = (db || [])
                .filter(c => (c.cliente_a_defender || c.partes || '').toLowerCase().trim() === (clienteNombre || '').toLowerCase().trim())
                .map(c => c.token)
                .filter(Boolean);

            if (!clientTokens.length) {
                listEl.innerHTML = '<p style="font-size:0.78rem;color:var(--silver);font-style:italic;text-align:center;padding:12px;">Sin casos en el Registro Legal asociados a este cliente.</p>';
                return;
            }

            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.GET_OBS, { method: 'POST', body: '{}' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const txt = await res.text();
                const data = txt ? JSON.parse(txt) : {};
                const todas = Array.isArray(data.anotaciones) ? data.anotaciones : [];
                const relacionadas = todas.filter(a => clientTokens.includes(a.Token || a.token));
                renderClientModalObservaciones(listEl, relacionadas);
            } catch(e) {
                listEl.innerHTML = `<p style="font-size:0.78rem;color:#ef4444;text-align:center;padding:12px;">Error cargando observaciones: ${esc(e.message)}</p>`;
            }
        }

        function renderClientModalObservaciones(listEl, list) {
            if (!list || !list.length) {
                listEl.innerHTML = '<p style="font-size:0.78rem;color:var(--silver);font-style:italic;text-align:center;padding:12px;">Sin observaciones registradas para este cliente.</p>';
                return;
            }
            listEl.innerHTML = list.map(a => {
                const id  = a.ID  || a.id  || '';
                const tok = a.Token || a.token || '';
                const vis = a.Visibilidad || a.visibilidad || 'Interno';
                const isPublic = vis === 'Público' || vis === 'Publico';
                const borderColor = isPublic ? 'rgba(34,197,94,0.45)' : 'rgba(201,168,76,0.3)';
                const safeId  = esc(id);
                const safeTok = esc(tok);
                return `
                <div id="cliobs-${safeId}" style="padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:8px;
                             border-left:3px solid ${borderColor};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
                        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            <span style="font-size:0.68rem;color:var(--gold);font-weight:700;font-family:monospace;">${safeTok}</span>
                            <span style="font-size:0.62rem;font-weight:700;padding:1px 6px;border-radius:4px;
                                         background:rgba(201,168,76,0.08);color:rgba(201,168,76,0.7);">${esc(a.Tipo || a.tipo || 'NOTA')}</span>
                            <span style="font-size:0.62rem;font-weight:700;color:${isPublic ? '#22c55e' : 'var(--silver)'};"
                                  title="${isPublic ? 'Visible en portal' : 'Solo interno'}">${isPublic ? '👁️ Portal' : '🔒 Interno'}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                            <span style="font-size:0.6rem;color:var(--silver);">${esc(a.Fecha || a.fecha || '')}</span>
                            ${id ? `
                            <button onclick="abrirEditarObsClienteModal('${safeId}','${safeTok}')" title="Editar"
                                style="background:none;border:1px solid rgba(201,168,76,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:var(--gold);font-size:0.7rem;line-height:1;
                                       transition:0.15s;" onmouseover="this.style.background='rgba(201,168,76,0.1)'"
                                       onmouseout="this.style.background='none'">✏️</button>
                            <button onclick="eliminarObsClienteModal('${safeId}','${safeTok}')" title="Eliminar"
                                style="background:none;border:1px solid rgba(239,68,68,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:#ef4444;font-size:0.7rem;line-height:1;
                                       transition:0.15s;" onmouseover="this.style.background='rgba(239,68,68,0.1)'"
                                       onmouseout="this.style.background='none'">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                    <p style="margin:0 0 4px;font-size:0.82rem;color:var(--silver-lt);line-height:1.5;">${esc(a.Texto || a.texto || '')}</p>
                    <p style="margin:0;font-size:0.62rem;color:var(--silver);opacity:0.5;">${esc(a.Operador || a.operador || a.Autor || a.autor || '')}</p>
                </div>`;
            }).join('');
        }

        function abrirEditarObsClienteModal(id, tok) {
            const div = document.getElementById(`cliobs-${id}`);
            const textoEl = div ? div.querySelector('p') : null;
            const textoActual = textoEl ? textoEl.textContent.trim() : '';
            const isPublic = div ? div.style.borderLeftColor.includes('34,197,94') : false;

            const modal = document.createElement('div');
            modal.id = 'modal-editar-cliobs';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:flex;align-items:center;justify-content:center;';
            modal.innerHTML = `
                <div style="background:#0c0f16;border:1px solid rgba(201,168,76,0.3);border-radius:12px;
                            padding:22px;width:90%;max-width:480px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <span style="color:var(--gold);font-weight:700;font-size:0.9rem;">✏️ Editar Observación</span>
                        <button onclick="document.getElementById('modal-editar-cliobs').remove()"
                            style="background:none;border:none;color:var(--silver);cursor:pointer;font-size:1.2rem;line-height:1;">✕</button>
                    </div>
                    <textarea id="modal-cliobs-texto" rows="4"
                        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);
                               border-radius:8px;color:var(--white);padding:10px 12px;font-size:0.85rem;
                               resize:vertical;font-family:inherit;box-sizing:border-box;"
                    >${textoActual}</textarea>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:12px;">
                        <input type="checkbox" id="modal-cliobs-vis" ${isPublic ? 'checked' : ''}
                            style="accent-color:var(--gold);width:15px;height:15px;cursor:pointer;">
                        <label for="modal-cliobs-vis" style="font-size:0.78rem;color:var(--silver);cursor:pointer;">
                            👁️ Visible en Portal del Cliente
                        </label>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
                        <button onclick="document.getElementById('modal-editar-cliobs').remove()"
                            style="padding:7px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;
                                   background:none;color:var(--silver);cursor:pointer;font-size:0.82rem;">Cancelar</button>
                        <button onclick="confirmarEditarObsClienteModal('${id}','${tok}')"
                            style="padding:7px 18px;border:none;border-radius:8px;background:var(--gold);
                                   color:#000;cursor:pointer;font-weight:700;font-size:0.82rem;">💾 Guardar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }

        async function confirmarEditarObsClienteModal(id, tok) {
            const texto = document.getElementById('modal-cliobs-texto')?.value?.trim();
            const cb    = document.getElementById('modal-cliobs-vis');
            const visibilidad = cb?.checked ? 'Público' : 'Interno';
            if (!texto) { showToast('El texto no puede estar vacío.', 'error'); return; }
            try {
                const WH  = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.EDIT_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, texto, visibilidad, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Observación actualizada.', 'ok');
                    document.getElementById('modal-editar-cliobs')?.remove();
                    loadClientModalObservaciones(window._currentClientModalName);
                } else { showToast(`Error al editar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function eliminarObsClienteModal(id, tok) {
            if (!confirm('¿Eliminar esta observación? Esta acción no se puede deshacer.')) return;
            try {
                const WH  = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.DELETE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Observación eliminada.', 'ok');
                    loadClientModalObservaciones(window._currentClientModalName);
                } else { showToast(`Error al eliminar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        function openPdfModal(url) {
            const modal = document.getElementById('pdf-modal');
            const content = document.getElementById('pdf-modal-content');
            if(url && url !== 'undefined') {
                content.innerHTML = `<iframe src="${url.replace('/view', '/preview')}" width="100%" height="100%" frameborder="0"></iframe>`;
            } else {
                content.innerHTML = `<p style="padding:20px;color:#333;text-align:center;">No hay documento adjunto válido.</p>`;
            }
            modal.classList.add('visible');
        }

        function closePdfModal() {
            document.getElementById('pdf-modal').classList.remove('visible');
            document.getElementById('pdf-modal-content').innerHTML = '';
        }

        async function saveClientEdit() {
            const idx      = parseInt(document.getElementById('edit-client-idx').value);
            const source   = document.getElementById('edit-client-source').value;
            const original = allClientRows[idx];
            const nombre   = document.getElementById('edit-cli-nombre').value.trim().replace(/[<>"'&]/g,'');
            const nit      = document.getElementById('edit-cli-nit').value.trim().replace(/[<>"'&]/g,'');
            const email    = document.getElementById('edit-cli-email').value.trim();
            const telefono = document.getElementById('edit-cli-telefono').value.trim().replace(/[<>"'&]/g,'');
            const notas    = document.getElementById('edit-cli-notas').value.trim().replace(/[<>"'&]/g,'');
            const abogado  = document.getElementById('edit-cli-abogado')?.value || '';
            if (!nombre) { showToast('El nombre es obligatorio.', 'error'); return; }
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Email inválido.', 'error'); return; }
            logError(`Actualizando: ${nombre}...`);
            try {
                // Unificar edición: siempre actualizar la hoja CLIENTES
                if (original.nit) {
                    await authFetch(N8N_CLIENT_DELETE, { method: 'POST', body: JSON.stringify({ nit: original.nit }) });
                }
                const res = await authFetch(N8N_CLIENT_SAVE, {
                    method: 'POST', body: JSON.stringify({ nombre, nit, email, telefono, notas, abogado })
                });
                if (!res.ok) { showToast(`Error: ${esc(String(res.status))}`, 'error'); return; }

                if (source !== 'directorio') {
                    const caseItem = db.find(c => c.token === original.token);
                    if (caseItem) caseItem.partes = nombre;
                }
                await loadClients();
                closeClientModal();
                showToast(`${nombre} actualizado correctamente.`, 'ok');
                logError('✓ Cliente actualizado.');
            } catch(e) { showToast('No se pudo conectar con n8n.', 'error'); logError(`Error: ${e.message}`); }
        }

        async function deleteClient(idx) {
            const c = allClientRows[idx];
            if (c._source !== 'directorio') { showToast('Solo se pueden eliminar clientes del directorio manual.', 'error'); return; }
            const ok = await floovuConfirm(`¿Eliminar a ${c.nombre} del directorio?`);
            if (!ok) return;
            logError(`Eliminando: ${c.nombre}...`);
            try {
                const res = await authFetch(N8N_CLIENT_DELETE, {
                    method: 'POST', body: JSON.stringify({ nit: c.nit })
                });
                if (res.ok) {
                    await loadClients();
                    showToast(`${c.nombre} eliminado.`, 'ok');
                    logError('✓ Cliente eliminado.');
                } else {
                    showToast(`Error: ${esc(String(res.status))}`, 'error');
                }
            } catch(e) { showToast('No se pudo conectar con n8n.', 'error'); logError(`Error: ${e.message}`); }
        }

        async function fetchClientMails(tok, clientName) {
            const panel = document.getElementById(`mails-panel-${tok}`);
            if (!panel) return;

            // Toggle: si ya está abierto, cerrar
            if (panel.style.display !== 'none') {
                panel.style.display = 'none';
                return;
            }

            // Buscar email del cliente: primero del nuevo campo asig-email, luego del directorio
            let clientEmail = (document.getElementById(`asig-email-${tok}`) || {}).value || '';
            if (!clientEmail) {
                const found = allClientRows.find(r =>
                    r.nombre && clientName &&
                    r.nombre.toLowerCase().trim() === clientName.toLowerCase().trim()
                );
                clientEmail = found ? (found.email || '') : '';
            }

            if (!clientEmail) {
                panel.style.display = 'block';
                panel.innerHTML = `<p style="margin:0;font-size:0.82rem;color:#f97316;">⚠️ Ingresá el email del cliente en el campo de arriba para buscar sus correos.</p>`;
                return;
            }

            panel.style.display = 'block';
            panel.innerHTML = `<p style="margin:0;font-size:0.82rem;color:var(--silver);">⏳ Buscando correos con PDF de <strong style="color:var(--gold);">${esc(clientEmail)}</strong>...</p>`;

            try {
                const res = await authFetch(N8N_GET_CLIENT_MAILS, {
                    method: 'POST',
                    body: JSON.stringify({ email: clientEmail, nombre: clientName })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const _txt5 = await res.text();
                let data = {};
                try { if (_txt5) data = JSON.parse(_txt5); } catch(_e) {}
                const mails = Array.isArray(data) ? data : (data.mails || data.emails || []);

                if (!mails.length) {
                    panel.innerHTML = `<p style="margin:0;font-size:0.82rem;color:var(--silver);">📭 No se encontraron correos con PDF de <strong>${esc(clientEmail)}</strong>.</p>`;
                    return;
                }

                // Mostrar lista y disparar procesamiento automático en paralelo
                panel.innerHTML = `
                    <p style="margin:0 0 10px;font-size:0.75rem;color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                        📧 ${mails.length} correo(s) encontrado(s) — procesando automáticamente...
                    </p>
                    ${mails.map(m => `
                        <div id="mail-row-${esc(m.messageId)}" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);gap:1rem;">
                            <div style="min-width:0;flex:1;">
                                <p style="margin:0;font-size:0.82rem;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">📄 ${esc(m.subject || '(Sin asunto)')}</p>
                                <p style="margin:2px 0 0;font-size:0.72rem;color:var(--silver);">📅 ${esc(m.date || '—')}${m.attachments ? ` · 📎 ${m.attachments} adjunto(s)` : ''}</p>
                            </div>
                            <span id="mail-status-${esc(m.messageId)}" style="font-size:0.72rem;color:var(--silver);flex-shrink:0;">⏳ Enviando...</span>
                        </div>`).join('')}`;

                // Procesar cada correo automáticamente sin esperar al anterior
                mails.forEach(async (m) => {
                    const statusEl = document.getElementById(`mail-status-${m.messageId}`);
                    try {
                        const r = await authFetch(N8N_FORCE_SYNC, {
                            method: 'POST',
                            body: JSON.stringify({
                                messageId:      m.messageId,
                                nombre_cliente: clientName,
                                email_cliente:  clientEmail,
                                fuente:         'perfil_cliente'
                            })
                        });
                        if (statusEl) {
                            if (r.ok) {
                                statusEl.textContent = '✅ Guardado';
                                statusEl.style.color = '#22c55e';
                            } else {
                                statusEl.textContent = `⚠️ Error ${r.status}`;
                                statusEl.style.color = '#f97316';
                            }
                        }
                    } catch(e) {
                        if (statusEl) { statusEl.textContent = '🔴 Falló'; statusEl.style.color = '#ef4444'; }
                        logError(`Error procesando correo ${m.messageId}: ${e.message}`);
                    }
                });

                showToast(`${mails.length} correo(s) de ${clientName} enviados al Registro Legal.`, 'ok');
                logError(`✓ ${mails.length} correos de ${clientEmail} procesados automáticamente.`);

            } catch(e) {
                panel.innerHTML = `<p style="margin:0;font-size:0.82rem;color:#ef4444;">🔴 Error al conectar con n8n: ${esc(e.message)}</p>`;
                logError(`Error buscando correos: ${e.message}`);
            }
        }

        async function assignLawyerFromClients(idx, lawyerName) {
            const c = allClientRows[idx];
            if (!c || c._source !== 'registro') return;
            if (!lawyerName) return;
            const caseItem = db.find(x => x.token === c.token);
            if (!caseItem) { showToast('Caso no encontrado en memoria.', 'error'); return; }
            const lawyerObj = lawyers.find(l => l.name === lawyerName);
            logError(`Asignando ${lawyerName} al caso ${c.token}...`);
            try {
                const res = await authFetch(N8N_ASSIGN_WEBHOOK, {
                    method: 'POST',
                    body: JSON.stringify({
                        token:               c.token,
                        row_number:          caseItem.row_number || null,
                        nombre_cliente:      c.nombre,
                        abogado_responsable: lawyerName,
                        email_abogado:       lawyerObj ? lawyerObj.email : '',
                        'Estado Alerta':     'ASIGNADO',
                        rama:                caseItem.rama,
                        vencimiento:         caseItem.venc,
                        'Fecha de Vencimiento': caseItem.venc,
                        case_description:    caseItem.desc,
                        informe_html:        caseItem.informe_html || '<!--FLOOVU_AB_PLACEHOLDER-->',
                        messageId:           caseItem.messageId || ''
                    })
                });
                if (res.ok) {
                    caseItem.lawyer = lawyerName;
                    c.abogado = lawyerName;
                    showToast(`${lawyerName} asignado a ${c.nombre}.`, 'ok');
                    logError(`✓ Asignación completada desde Directorio de Clientes.`);
                    await loadClients();
                } else {
                    showToast(`Error: ${esc(String(res.status))}`, 'error');
                }
            } catch(e) { showToast('No se pudo conectar con n8n.', 'error'); logError(`Error: ${e.message}`); }
        }

                // ══════════════════════════════════════════
        // GESTIÓN DE USUARIOS — solo para Admin
        // ══════════════════════════════════════════
        async function generateHashAdmin() {
            const pass  = document.getElementById('hash-pass').value;
            const pass2 = document.getElementById('hash-pass2').value;
            if (!pass) { showToast('Escribe una contraseña.', 'error'); return; }
            if (pass !== pass2) { showToast('Las contraseñas no coinciden.', 'error'); return; }
            const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
            const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
            document.getElementById('hash-value-admin').textContent = hash;
            document.getElementById('hash-result-admin').style.display = 'block';
            document.getElementById('hash-copied-admin').style.display = 'none';
        }

        async function copyHashAdmin() {
            const hash = document.getElementById('hash-value-admin').textContent;
            await navigator.clipboard.writeText(hash);
            const el = document.getElementById('hash-copied-admin');
            el.style.display = 'block';
            setTimeout(() => el.style.display = 'none', 2500);
        }

        function togglePassVisibility(inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
            }
        }

                function checkHashStrength(pass) {
            const fill  = document.getElementById('hash-strength-fill');
            const label = document.getElementById('hash-strength-label');
            if (!pass) { fill.style.width = '0%'; label.textContent = '—'; label.style.color = '#475569'; return; }
            let score = 0;
            if (pass.length >= 8)  score++;
            if (pass.length >= 12) score++;
            if (/[A-Z]/.test(pass)) score++;
            if (/[0-9]/.test(pass)) score++;
            if (/[^A-Za-z0-9]/.test(pass)) score++;
            const levels = [
                { w: '20%', c: '#ef4444', t: 'Muy débil' },
                { w: '40%', c: '#f97316', t: 'Débil' },
                { w: '60%', c: '#eab308', t: 'Regular' },
                { w: '80%', c: '#84cc16', t: 'Buena' },
                { w: '100%', c: '#22c55e', t: 'Excelente' },
            ];
            const l = levels[Math.min(score - 1, 4)] || levels[0];
            fill.style.width = l.w;
            fill.style.background = l.c;
            label.textContent = l.t;
            label.style.color = l.c;
        }

        function renderUsersAdmin() {
            const container = document.getElementById('users-list-admin');
            if (!container) return;
            const users = (window.FLOOVU_CONFIG && window.FLOOVU_CONFIG.USERS) || [];
            if (!users.length) {
                container.innerHTML = '<p style="color:var(--silver);font-size:0.8rem;">No hay usuarios configurados.</p>';
                return;
            }
            container.innerHTML = users.map(u => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;">
                    <div>
                        <p style="margin:0;font-size:0.82rem;font-weight:700;color:var(--white);">@${esc(u.username)}</p>
                        <p style="margin:0;font-size:0.72rem;color:var(--silver);">${esc(u.name)} · ${esc(u.email||'')}</p>
                    </div>
                    <span style="font-size:0.62rem;padding:3px 8px;border-radius:10px;font-weight:700;text-transform:uppercase;
                        background:${u.role==='admin' ? 'rgba(197,160,89,0.15)' : 'rgba(99,153,34,0.15)'};
                        color:${u.role==='admin' ? 'var(--gold)' : '#97C459'};">
                        ${u.role==='admin' ? 'Agencia' : 'Operador'}
                    </span>
                </div>`).join('');
        }

                // ══════════════════════════════════════════
        // DASHBOARD ADMIN — métricas de agencia
        // ══════════════════════════════════════════
        function showDashboardForRole(role) {
            const opDash    = document.getElementById('dashboard-operator');
            const adminDash = document.getElementById('dashboard-admin');
            const title     = document.getElementById('dashboard-title');
            if (role === 'admin') {
                if (opDash)    opDash.style.display    = 'none';
                if (adminDash) adminDash.style.display = 'block';
                if (title)     title.textContent        = 'Panel de Agencia';
                renderAdminDashboard();
                // Esperar que Firebase esté listo y mostrar sesiones
                waitForFirebaseAndRender();
            } else {
                if (opDash)    opDash.style.display    = '';
                if (adminDash) adminDash.style.display = 'none';
                if (title)     title.textContent        = 'Visión General';
            }
        }

        function waitForFirebaseAndRender() {
            let attempts = 0;
            function tryRender() {
                attempts++;
                // Si ya tenemos datos en caché (onValue los puso ahí)
                if (window._firebaseSessions !== undefined) {
                    renderActiveSessionsLive(window._firebaseSessions);
                    return;
                }
                // Si Firebase está listo podemos hacer get
                if (window.firebaseGetSessions) {
                    // Iniciar escucha en tiempo real
                    if (typeof window.fbWatchSessions === 'function') {
                        window.fbWatchSessions();
                    }
                    window.firebaseGetSessions().then(function(sessions) {
                        renderActiveSessionsLive(sessions || {});
                    }).catch(function() {
                        renderActiveSessionsLive({});
                    });
                    return;
                }
                // Todavía no está listo — reintentar hasta 10 veces
                if (attempts < 10) {
                    setTimeout(tryRender, 800);
                } else {
                    var container = document.getElementById('active-sessions-list');
                    if (container) container.innerHTML = '<p style="color:var(--silver);font-size:0.85rem;text-align:center;padding:1rem;opacity:0.5;">Firebase no disponible. Verificá tu conexión.</p>';
                }
            }
            setTimeout(tryRender, 600);
        }

        // ══════════════════════════════════════════
        // SESIONES ACTIVAS — lee Firebase en tiempo real
        // ══════════════════════════════════════════
        function renderActiveSessionsLive(sessions) {
            const container = document.getElementById('active-sessions-list');
            if (!container) return;
            const now = Date.now();

            if (!sessions || Object.keys(sessions).length === 0) {
                container.innerHTML = '<p style="color:var(--silver);font-size:0.78rem;opacity:0.5;text-align:center;padding:0.75rem;">No hay sesiones activas.</p>';
                return;
            }

            container.innerHTML = Object.entries(sessions).map(([username, data]) => {
                const lastSeenAgo = Math.round((now - data.lastSeen) / 1000);
                const isOnline    = lastSeenAgo < 30;
                const loginDate   = new Date(data.loginTime || data.lastSeen).toLocaleString('es-CO', { dateStyle:'short', timeStyle:'short' });
                const role        = data.role === 'admin' ? 'AGC' : 'OPR';
                const roleColor   = data.role === 'admin' ? 'var(--gold)' : '#97C459';
                const statusColor = isOnline ? '#22c55e' : 'var(--kpi-alert)';
                const statusDot   = isOnline ? '●' : '○';
                const statusTip   = isOnline ? 'En línea' : ('Hace ' + lastSeenAgo + 's');
                const ua          = data.userAgent || '';
                const devIcon     = ua.includes('Mobile') ? '📱' : '🖥️';

                return '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px;">' +
                    '<span style="font-size:0.85rem;flex-shrink:0;">' + (data.role === 'admin' ? '👑' : '👤') + '</span>' +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="display:flex;align-items:center;gap:6px;">' +
                            '<span style="font-size:0.75rem;font-weight:700;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(data.name || username) + '</span>' +
                            '<span style="font-size:0.6rem;font-weight:700;color:' + roleColor + ';letter-spacing:0.5px;background:rgba(201,168,76,0.08);padding:1px 5px;border-radius:4px;flex-shrink:0;">' + role + '</span>' +
                            '<span style="font-size:0.65rem;color:' + statusColor + ';font-weight:700;flex-shrink:0;" title="' + statusTip + '">' + statusDot + '</span>' +
                        '</div>' +
                        '<p style="margin:1px 0 0;font-size:0.62rem;color:var(--silver);opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(data.email || username) + ' · ' + devIcon + ' · ' + loginDate + '</p>' +
                    '</div>' +
                    '<button onclick="forceLogoutSession(\'' + esc(username) + '\')" style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);color:#ef4444;border-radius:6px;padding:4px 8px;font-size:0.62rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;" onmouseover="this.style.background=\'rgba(239,68,68,0.15)\'" onmouseout="this.style.background=\'rgba(239,68,68,0.06)\'">✕</button>' +
                '</div>';
            }).join('');
        }
        window.renderActiveSessionsLive = renderActiveSessionsLive;

        async function renderActiveSessions() {
            const container = document.getElementById('active-sessions-list');
            if (!container) return;
            container.innerHTML = '<p style="color:var(--silver);font-size:0.85rem;opacity:0.5;text-align:center;padding:1.5rem;">Cargando...</p>';

            // Usar cache en tiempo real si ya está disponible
            if (window._firebaseSessions !== undefined) {
                renderActiveSessionsLive(window._firebaseSessions);
                return;
            }

            // Fallback: cargar una sola vez
            if (!window.firebaseGetSessions) {
                container.innerHTML = '<p style="color:var(--silver);font-size:0.85rem;opacity:0.5;text-align:center;padding:1rem;">Conectando con Firebase...</p>';
                // Reintentar en 1 segundo
                setTimeout(renderActiveSessions, 1000);
                return;
            }
            try {
                const sessions = await window.firebaseGetSessions();
                renderActiveSessionsLive(sessions);
            } catch(e) {
                container.innerHTML = '<p style="color:#ef4444;font-size:0.85rem;text-align:center;padding:1rem;">Error: ' + e.message + '</p>';
            }
        }

        async function forceLogoutSession(username) {
            if (!window.firebaseForceLogout) return;
            if (!confirm(`¿Cerrar sesión de @${username}?`)) return;
            try {
                await window.firebaseForceLogout(username);
                showToast(`✓ Sesión de @${username} cerrada`, 'ok');
                renderActiveSessions();
            } catch(e) {
                showToast('Error al cerrar sesión: ' + e.message, 'error');
            }
        }

                function renderAdminDashboard() {
            // KPIs desde db (datos ya cargados)
            const total     = db.length;
            const asignados = db.filter(c => c.lawyer && c.lawyer !== 'Pendiente').length;
            const scores    = db.filter(c => c.score > 0).map(c => c.score);
            const avgScore  = scores.length ? (scores.reduce((a,b) => a+b,0) / scores.length).toFixed(1) : null;
            const totalMin  = db.reduce((acc,c) => acc + (c.ahorroMin || 0), 0);
            const totalHrs  = totalMin > 0 ? (totalMin / 60).toFixed(1) : '0';

            const set = id => v => { const el = document.getElementById(id); if (el) el.textContent = v; };
            set('admin-kpi-casos')(total || '0');
            set('admin-kpi-score')(avgScore ? `${avgScore}/10` : 'N/A');
            set('admin-kpi-hours')(`${totalHrs}h`);
            set('admin-kpi-asignados')(total ? `${asignados}/${total}` : '0/0');

            // Animar barras
            setTimeout(() => {
                const scoreBar = document.getElementById('admin-bar-score');
                const asigBar  = document.getElementById('admin-bar-asig');
                if (scoreBar && avgScore) scoreBar.style.width = `${Math.min(parseFloat(avgScore)/10*100,100)}%`;
                if (asigBar  && total)   asigBar.style.width  = `${Math.min(asignados/total*100,100)}%`;
            }, 100);

            // Trend badges admin — cálculo real últimos 7d vs 7d anteriores
            const adminTrends = calculateTrends(db);
            updateTrendBadge('admin-trend-cases', adminTrends.cases);
            updateTrendBadge('admin-trend-score', adminTrends.score);
            updateTrendBadge('admin-trend-hours', adminTrends.hours);
            updateTrendBadge('admin-trend-asig', adminTrends.assigned);

            // Tabla últimos casos (sin datos privados — solo métricas)
            const tbody = document.getElementById('admin-dash-rows');
            if (tbody) {
                if (!db.length) {
                    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Sin actividad reciente</td></tr>';
                } else {
                    tbody.innerHTML = db.slice(0,10).map(c => `<tr>
                        <td style="color:var(--silver);font-size:0.8rem;">${esc(c.date)}</td>
                        <td>${esc(c.rama)}</td>
                        <td style="color:var(--silver);font-size:0.8rem;">${esc(c.tipo||'—')}</td>
                        <td style="color:${c.score>0?'var(--gold)':'var(--silver)'};">${c.score > 0 ? c.score+'/10' : '—'}</td>
                        <td><span style="font-size:0.72rem;padding:2px 8px;border-radius:12px;background:${c.status==='ASIGNADO'?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.05)'};color:${c.status==='ASIGNADO'?'#22c55e':'var(--silver)'};">${esc(c.status||'—')}</span></td>
                        <td style="color:var(--silver);">${c.ahorroMin > 0 ? Math.round(c.ahorroMin/60*10)/10+'h' : '—'}</td>
                    </tr>`).join('');
                }
            }

            // Gráfico de ramas en admin-chart-area — canvas futurista
            const ramaCount = {};
            db.forEach(c => { const r = c.rama||'General'; ramaCount[r] = (ramaCount[r]||0)+1; });
            const ramaLabels = Object.keys(ramaCount);
            const ramaData   = Object.values(ramaCount);
            if (ramaLabels.length) {
                const adminChart = document.getElementById('admin-chart-area');
                if (adminChart) drawFuturisticDonut(adminChart, ramaLabels, ramaData);
            }
        }

                // ══════════════════════════════════════════
        // FONDO LOGIN — disruptivo futurista
        // ══════════════════════════════════════════
        window.addEventListener('load', function() {
        (function initLoginBg() {
            const canvas = document.getElementById('login-bg-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let W, H, raf, t = 0;

            function resize() {
                W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
                H = canvas.height = canvas.offsetHeight || window.innerHeight;
            }
            resize();
            window.addEventListener('resize', () => { resize(); });

            // ── 1. ANILLOS CONCÉNTRICOS GIRATORIOS ──
            // Varios anillos hexagonales/circulares que rotan a distintas velocidades
            const rings = [
                { r: 0.38, sides: 6, speed:  0.0004, width: 1.2, alpha: 0.18, phase: 0 },
                { r: 0.30, sides: 6, speed: -0.0007, width: 0.8, alpha: 0.12, phase: 1.0 },
                { r: 0.48, sides: 8, speed:  0.0003, width: 0.6, alpha: 0.09, phase: 0.5 },
                { r: 0.56, sides: 12,speed: -0.0002, width: 0.5, alpha: 0.06, phase: 0.2 },
                { r: 0.22, sides: 3, speed:  0.001,  width: 1.0, alpha: 0.14, phase: 2.1 },
                { r: 0.65, sides: 6, speed:  0.00015,width: 0.4, alpha: 0.05, phase: 1.5 },
            ];

            function drawRings() {
                const cx = W * 0.5, cy = H * 0.5;
                rings.forEach(ring => {
                    ring.phase += ring.speed;
                    const rad = Math.min(W, H) * ring.r;
                    const n   = ring.sides;
                    ctx.beginPath();
                    for (let i = 0; i <= n; i++) {
                        const a = ring.phase + (i / n) * Math.PI * 2;
                        const x = cx + Math.cos(a) * rad;
                        const y = cy + Math.sin(a) * rad;
                        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = `rgba(201,168,76,${ring.alpha})`;
                    ctx.lineWidth   = ring.width;
                    ctx.stroke();
                });
            }

            // ── 2. LÍNEAS DE ENERGÍA — rayos que emanan del centro ──
            const RAYS = 12;
            const rays = Array.from({length: RAYS}, (_, i) => ({
                angle:   (i / RAYS) * Math.PI * 2,
                speed:   0.0003 + Math.random() * 0.0004,
                len:     0.25 + Math.random() * 0.2,
                alpha:   0.06 + Math.random() * 0.1,
                pulse:   Math.random() * Math.PI * 2,
                pspeed:  0.02 + Math.random() * 0.015,
                width:   0.5 + Math.random() * 1,
                gold:    Math.random() < 0.6,
            }));

            function drawRays() {
                const cx = W * 0.5, cy = H * 0.5;
                rays.forEach(r => {
                    r.pulse += r.pspeed;
                    r.angle += r.speed;
                    const a = r.alpha * (0.4 + 0.6 * Math.sin(r.pulse));
                    const len = Math.min(W, H) * r.len;
                    const x1 = cx + Math.cos(r.angle) * Math.min(W,H) * 0.08;
                    const y1 = cy + Math.sin(r.angle) * Math.min(W,H) * 0.08;
                    const x2 = cx + Math.cos(r.angle) * len;
                    const y2 = cy + Math.sin(r.angle) * len;
                    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
                    const col  = r.gold ? `201,168,76` : `24,95,165`;
                    grad.addColorStop(0,   `rgba(${col},${a})`);
                    grad.addColorStop(0.6, `rgba(${col},${a * 0.4})`);
                    grad.addColorStop(1,   `rgba(${col},0)`);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth   = r.width;
                    ctx.stroke();
                });
            }

            // ── 3. NODOS ORBITANTES CON CONEXIONES ──
            const NODES = 7;
            const nodes = Array.from({length: NODES}, (_, i) => ({
                angle:  (i / NODES) * Math.PI * 2,
                speed:  (0.0008 + Math.random() * 0.0006) * (Math.random() < 0.5 ? 1 : -1),
                orbit:  0.28 + Math.random() * 0.16,
                r:      2.5 + Math.random() * 2.5,
                alpha:  0.5 + Math.random() * 0.4,
                pulse:  Math.random() * Math.PI * 2,
                pspeed: 0.03 + Math.random() * 0.02,
            }));

            function drawNodes() {
                const cx = W * 0.5, cy = H * 0.5;
                // Draw connections between close nodes
                const positions = nodes.map(n => {
                    n.angle += n.speed;
                    n.pulse += n.pspeed;
                    const orb = Math.min(W, H) * n.orbit;
                    return { x: cx + Math.cos(n.angle) * orb, y: cy + Math.sin(n.angle) * orb, n };
                });

                // Connections
                for (let i = 0; i < positions.length; i++) {
                    for (let j = i + 1; j < positions.length; j++) {
                        const dx = positions[i].x - positions[j].x;
                        const dy = positions[i].y - positions[j].y;
                        const d  = Math.sqrt(dx*dx + dy*dy);
                        const maxDist = Math.min(W, H) * 0.28;
                        if (d < maxDist) {
                            const opacity = (1 - d / maxDist) * 0.15;
                            ctx.beginPath();
                            ctx.moveTo(positions[i].x, positions[i].y);
                            ctx.lineTo(positions[j].x, positions[j].y);
                            ctx.strokeStyle = `rgba(201,168,76,${opacity})`;
                            ctx.lineWidth = 0.6;
                            ctx.stroke();
                        }
                    }
                }

                // Nodes
                positions.forEach(({ x, y, n }) => {
                    const a = n.alpha * (0.5 + 0.5 * Math.sin(n.pulse));
                    // Glow
                    const grd = ctx.createRadialGradient(x, y, 0, x, y, n.r * 4);
                    grd.addColorStop(0,   `rgba(201,168,76,${a * 0.6})`);
                    grd.addColorStop(1,   `rgba(201,168,76,0)`);
                    ctx.fillStyle = grd;
                    ctx.beginPath(); ctx.arc(x, y, n.r * 4, 0, Math.PI*2); ctx.fill();
                    // Core
                    ctx.beginPath(); ctx.arc(x, y, n.r, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(232,204,122,${a})`;
                    ctx.fill();
                });
            }

            // ── 4. BALANZA ESPECTRAL CENTRAL ──
            function drawScale() {
                const cx = W * 0.5, cy = H * 0.5;
                const arm = Math.min(W, H) * 0.2;
                const ang = Math.sin(t * 0.35) * 0.1;
                const A   = 0.09;

                ctx.save();
                ctx.strokeStyle = `rgba(201,168,76,${A})`;
                ctx.fillStyle   = `rgba(201,168,76,${A})`;
                ctx.lineWidth   = 1.5; ctx.lineCap = 'round';

                // Columna
                ctx.beginPath();
                ctx.moveTo(cx, cy + arm * 0.88);
                ctx.lineTo(cx, cy - arm * 0.28);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx - arm*0.2, cy + arm*0.88);
                ctx.lineTo(cx + arm*0.2, cy + arm*0.88);
                ctx.stroke();

                // Barra
                const lx = cx - Math.cos(-ang) * arm, ly = cy - Math.sin(-ang)*arm*0.3 - arm*0.04;
                const rx = cx + Math.cos(-ang) * arm, ry = cy + Math.sin(-ang)*arm*0.3 - arm*0.04;
                ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(rx,ry); ctx.stroke();
                ctx.beginPath(); ctx.arc(cx, cy - arm*0.04, arm*0.04, 0, Math.PI*2); ctx.fill();

                // Cuerdas + platos
                [[lx, ly],[rx, ry]].forEach(([px,py]) => {
                    const cLen = arm * 0.48;
                    ctx.globalAlpha = A * 0.7;
                    [-arm*0.15, 0, arm*0.15].forEach(off => {
                        ctx.beginPath();
                        ctx.moveTo(px, py); ctx.lineTo(px+off, py+cLen); ctx.stroke();
                    });
                    ctx.globalAlpha = A;
                    ctx.beginPath();
                    ctx.ellipse(px, py+cLen+arm*0.04, arm*0.17, arm*0.04, 0, 0, Math.PI*2);
                    ctx.stroke();
                });
                ctx.restore();
            }

            // ── 5. ORBES ATMOSFÉRICOS ──
            const orbs = [
                { rx:0.12, ry:0.45, sz:0.45, r:201, g:168, b:76,  a:0.07, t:0,   sp:0.0007 },
                { rx:0.88, ry:0.55, sz:0.40, r:20,  g:55,  b:160, a:0.09, t:2.1, sp:0.0005 },
                { rx:0.5,  ry:0.05, sz:0.30, r:201, g:168, b:76,  a:0.04, t:4.3, sp:0.0009 },
            ];
            function drawOrbs() {
                orbs.forEach(o => {
                    o.t += o.sp;
                    const cx2 = W * o.rx + Math.sin(o.t * 1.4) * W * 0.04;
                    const cy2 = H * o.ry + Math.cos(o.t) * H * 0.03;
                    const rad = Math.min(W,H) * o.sz;
                    const g   = ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,rad);
                    g.addColorStop(0,   `rgba(${o.r},${o.g},${o.b},${o.a})`);
                    g.addColorStop(0.5, `rgba(${o.r},${o.g},${o.b},${o.a*0.25})`);
                    g.addColorStop(1,   `rgba(${o.r},${o.g},${o.b},0)`);
                    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
                });
            }

            // ── 6. POLVO DE LUZ ──
            const dust = Array.from({length:55}, () => ({
                x: Math.random(), y: Math.random(),
                r: 0.4+Math.random()*1.4,
                vx:(Math.random()-0.5)*0.00018,
                vy:-(0.00006+Math.random()*0.00015),
                a: 0.07+Math.random()*0.28,
                ph:Math.random()*Math.PI*2,
                ps:0.016+Math.random()*0.02,
                gold:Math.random()<0.65,
            }));
            function drawDust() {
                dust.forEach(d => {
                    d.x+=d.vx; d.y+=d.vy; d.ph+=d.ps;
                    if (d.y<-0.02){d.y=1.02;d.x=Math.random();}
                    const a = d.a*(0.45+0.55*Math.sin(d.ph));
                    ctx.beginPath(); ctx.arc(d.x*W,d.y*H,d.r,0,Math.PI*2);
                    ctx.fillStyle = d.gold?`rgba(201,168,76,${a})`:`rgba(120,160,210,${a*0.5})`;
                    ctx.fill();
                });
            }

            function loop() {
                t += 0.016;
                ctx.clearRect(0,0,W,H);
                drawOrbs();
                drawRings();
                drawRays();
                drawNodes();
                drawDust();
                raf = requestAnimationFrame(loop);
            }
            loop();

            const loginEl = document.getElementById('login-overlay');
            if (loginEl) {
                new MutationObserver(() => {
                    if (loginEl.classList.contains('hidden')) cancelAnimationFrame(raf);
                }).observe(loginEl, { attributes:true, attributeFilter:['class'] });
            }
        })();
        }); // end window load

                // ══════════════════════════════════════════
        // DONUT CHART FUTURISTA — canvas nativo
        // ══════════════════════════════════════════
        function drawFuturisticDonut(container, labels, data) {
            container.innerHTML = '';
            const W = container.clientWidth || 380;
            const H = 180;
            const canvas = document.createElement('canvas');
            canvas.width  = W * window.devicePixelRatio;
            canvas.height = H * window.devicePixelRatio;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            container.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            const PALETTE = [
                '#C9A84C', '#e8cc7a', '#185FA5', '#639922',
                '#7c5cbf', '#0F6E56', '#993C1D', '#3a7ebf'
            ];
            const total = data.reduce((a, b) => a + b, 0);
            if (!total) return;

            const cx = W / 2;
            const cy = H * 0.44;
            const outerR = Math.min(W, H) * 0.30;
            const innerR = outerR * 0.58;
            const gapAngle = 0.035;

            // ── Draw glow backdrop ──
            const glowGrad = ctx.createRadialGradient(cx, cy, innerR * 0.5, cx, cy, outerR * 1.3);
            glowGrad.addColorStop(0,   'rgba(201,168,76,0.07)');
            glowGrad.addColorStop(0.5, 'rgba(201,168,76,0.02)');
            glowGrad.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, outerR * 1.3, 0, Math.PI * 2);
            ctx.fill();

            // ── Draw segments ──
            let startAngle = -Math.PI / 2;
            const segments = [];
            data.forEach((val, i) => {
                const sweep = (val / total) * (Math.PI * 2) - gapAngle;
                const midAngle = startAngle + sweep / 2;
                const color = PALETTE[i % PALETTE.length];
                segments.push({ startAngle, sweep, midAngle, color, val, label: labels[i] });

                // Outer glow
                ctx.shadowColor = color;
                ctx.shadowBlur  = 14;

                // Segment
                ctx.beginPath();
                ctx.moveTo(
                    cx + Math.cos(startAngle + gapAngle / 2) * innerR,
                    cy + Math.sin(startAngle + gapAngle / 2) * innerR
                );
                ctx.arc(cx, cy, outerR, startAngle + gapAngle / 2, startAngle + sweep);
                ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle + gapAngle / 2, true);
                ctx.closePath();

                // Gradient fill per segment
                const gx1 = cx + Math.cos(midAngle) * innerR;
                const gy1 = cy + Math.sin(midAngle) * innerR;
                const gx2 = cx + Math.cos(midAngle) * outerR;
                const gy2 = cy + Math.sin(midAngle) * outerR;
                const segGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
                segGrad.addColorStop(0, color + 'cc');
                segGrad.addColorStop(1, color);
                ctx.fillStyle = segGrad;
                ctx.fill();

                ctx.shadowBlur = 0;
                startAngle += sweep + gapAngle;
            });

            // ── Inner ring (decorative) ──
            ctx.beginPath();
            ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(201,168,76,0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // ── Center text ──
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.font         = `800 ${Math.round(outerR * 0.38)}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle    = '#e8cc7a';
            ctx.shadowColor  = 'rgba(201,168,76,0.5)';
            ctx.shadowBlur   = 16;
            ctx.fillText(total, cx, cy - outerR * 0.1);
            ctx.shadowBlur = 0;
            ctx.font       = `600 ${Math.round(outerR * 0.18)}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle  = 'rgba(168,189,208,0.5)';
            ctx.fillText('CASOS', cx, cy + outerR * 0.18);

            // ── Legend ──
            const legendY   = cy + outerR + 14;
            const itemW     = 100;
            const perRow    = Math.floor(W / itemW);
            const rows      = Math.ceil(labels.length / perRow);
            const legendH   = rows * 18;
            // expand canvas if needed
            if (legendY + legendH > H - 4) {
                canvas.height = (legendY + legendH + 12) * window.devicePixelRatio;
                canvas.style.height = (legendY + legendH + 12) + 'px';
                // redraw needed — just draw legend after
            }

            ctx.textBaseline = 'middle';
            ctx.textAlign    = 'left';
            segments.forEach((s, i) => {
                const col   = i % perRow;
                const row   = Math.floor(i / perRow);
                const totalW = Math.min(perRow, labels.length) * itemW;
                const offsetX = (W - totalW) / 2;
                const lx = offsetX + col * itemW;
                const ly = legendY + row * 18;

                // Dot
                ctx.beginPath();
                ctx.arc(lx + 7, ly, 4, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.shadowColor = s.color;
                ctx.shadowBlur  = 6;
                ctx.fill();
                ctx.shadowBlur  = 0;

                // Label
                ctx.font      = `600 10px "Plus Jakarta Sans", sans-serif`;
                ctx.fillStyle = 'rgba(168,189,208,0.8)';
                const pct = Math.round(s.val / total * 100);
                ctx.fillText(`${s.label} ${pct}%`, lx + 16, ly);
            });
        }

        async function pingEngineAdmin() {
            const ids = ['admin-h-web','admin-h-gmail','admin-h-sheet','admin-h-ai'];
            const set = (id, txt, color) => {
                const el = document.getElementById(id);
                if (el) { el.textContent = txt; el.style.color = color; }
            };
            ids.forEach(id => set(id, '⏳ Verificando...', 'var(--silver)'));
            try {
                const res = await authFetch(N8N_HEALTH_CHECK, { method: 'POST' });
                if (res.ok) {
                    // n8n responde 200 = el workflow y todos los servicios conectados están operativos
                    ids.forEach(id => set(id, '● Activo', '#22c55e'));
                    logError('✓ Health check: todos los servicios operativos');
                } else {
                    // Respuesta con error HTTP = n8n activo pero algo falla internamente
                    set('admin-h-web',   '● Activo', '#22c55e');
                    set('admin-h-gmail', '⚠ Revisar', '#f97316');
                    set('admin-h-sheet', '⚠ Revisar', '#f97316');
                    set('admin-h-ai',    '⚠ Revisar', '#f97316');
                    logError(`⚠️ Health check respondió ${res.status} — revisar servicios en n8n`);
                }
            } catch(e) {
                // Sin respuesta = n8n caído o sin conexión
                ids.forEach(id => set(id, '✗ Sin conexión', '#ef4444'));
                logError(`✗ Health check falló: ${e.message}`);
            }
        }

                function getLawyerEmail(lawyerName) {
            if (!lawyerName) return '';
            const l = lawyers.find(x => x.name === lawyerName);
            return l ? l.email : '';
        }

        // ══════════════════════════════════════════
        // V8: OBSERVACIONES
        // ══════════════════════════════════════════

        async function loadObservaciones() {
            const WH = window.FLOOVU_CONFIG.WEBHOOKS;
            try {
                // 1. Cargar tokens de casos para el selector (desde Registro Legal)
                const res = await authFetch(N8N_GET_DATA, { method: 'POST', body: '{}' });
                if (res.ok) {
                    const txt = await res.text();
                    const data = txt ? JSON.parse(txt) : [];
                    const casos = Array.isArray(data) ? data : [];
                    const sel = document.getElementById('obs-token');
                    if (sel) {
                        sel.innerHTML = '<option value="">— Seleccionar caso —</option>';
                        casos.forEach(c => {
                            const tok = c.token || c.Token || '';
                            const partes = c.Partes || c.partes || '';
                            if (tok) sel.innerHTML += `<option value="${esc(tok)}">${esc(tok)} — ${esc(partes).slice(0,50)}</option>`;
                        });
                    }
                }
                // 2. Cargar TODAS las observaciones en 1 request (bulk)
                observacionesData = [];
                const obsRes = await authFetch(WH.GET_OBS, { method: 'POST', body: '{}' });
                if (obsRes.ok) {
                    const obsTxt = await obsRes.text();
                    const obsData = obsTxt ? JSON.parse(obsTxt) : {};
                    observacionesData = obsData.anotaciones || [];
                }
            } catch(e) { logError('Error cargando observaciones: ' + e.message); }
            renderObservaciones(observacionesData);
        }

        function renderObservaciones(list) {
            const tbody = document.getElementById('obs-rows');
            if (!tbody) return;
            if (!list || list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay observaciones registradas</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(o => {
                const vis = o.Visibilidad || o.visibilidad || 'Interno';
                const isPublic = vis === 'Público' || vis === 'Publico';
                const eyeIcon = isPublic ? '<span title="Visible por el cliente">👁️</span>' : '<span title="Nota Interna Privada">🔒</span>';
                const obsId = o.ID || o.id || '';
                const obsTok = o.Token || o.token || '';
                return `<tr>
                <td style="font-size:0.75rem;">${esc(o.Fecha || o.fecha || '')}</td>
                <td><span style="color:var(--gold);font-weight:600;font-size:0.8rem;">${esc(obsTok)}</span></td>
                <td><span style="background:rgba(201,168,76,0.1);padding:2px 8px;border-radius:4px;font-size:0.75rem;">${esc(o.Tipo || o.tipo || 'NOTA')}</span></td>
                <td>
                    <div style="display:flex;align-items:flex-start;gap:8px;">
                        <div style="font-size:1.1rem;margin-top:2px;opacity:0.9;">${eyeIcon}</div>
                        <div>
                            <div style="font-size:0.65rem;color:${isPublic ? '#22c55e' : 'var(--silver)'};font-weight:700;letter-spacing:1px;margin-bottom:2px;">${isPublic ? 'PÚBLICO' : 'INTERNO'}</div>
                            <span style="font-size:0.85rem;color:var(--white);">${esc(o.Texto || o.texto || o.Descripcion || o.descripcion || o.Observacion || '')}</span>
                        </div>
                    </div>
                </td>
                <td style="font-size:0.8rem;color:var(--silver);">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span>${esc(o.Operador || o.operador || o.Autor || o.autor || currentUser?.name || 'Sistema')}</span>
                        ${obsId ? `<button onclick="eliminarObsGlobal('${obsId}','${obsTok}')" title="Eliminar"
                            style="background:none;border:1px solid rgba(239,68,68,0.3);border-radius:4px;
                                   padding:2px 5px;cursor:pointer;color:#ef4444;font-size:0.7rem;line-height:1;">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>`;
            }).join('');
        }

        function filtrarObservaciones() {
            const q = (document.getElementById('obs-buscar')?.value || '').toLowerCase();
            if (!q) { renderObservaciones(observacionesData); return; }
            const filtered = observacionesData.filter(o => {
                const txt = JSON.stringify(o).toLowerCase();
                return txt.includes(q);
            });
            renderObservaciones(filtered);
        }

        async function guardarObservacion(event) {
            const token = document.getElementById('obs-token')?.value;
            const tipo = document.getElementById('obs-tipo')?.value || 'NOTA';
            const texto = document.getElementById('obs-texto')?.value?.trim();
            const cb = document.getElementById('obs-visibilidad');
            const visibilidad = (cb && cb.checked) ? 'Público' : 'Interno';
            if (!token) { showToast('Seleccione un caso', 'error'); return; }
            if (!texto) { showToast('Escriba una observacion', 'error'); return; }
            try {
                let btn = null;
                let oldText = '';
                if(event && event.target) {
                    btn = event.target;
                    oldText = btn.innerHTML;
                    btn.innerHTML = '⏳ Guardando...';
                }
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.SAVE_OBS || WH.CLIENT_SAVE.replace('guardar-cliente', 'guardar-observacion') || N8N_GET_DATA, {
                    method: 'POST',
                    body: JSON.stringify({
                        token, tipo,
                        texto: texto,
                        anotacion: texto,
                        visibilidad: visibilidad,
                        operador: currentUser?.name || 'Operador',
                        fecha: new Date().toLocaleString('es-CO')
                    })
                });
                if (res.ok) {
                    showToast('Observacion guardada correctamente', 'success');
                    document.getElementById('obs-texto').value = '';
                    if (cb) cb.checked = false;
                    loadObservaciones();
                }
                if(btn) btn.innerHTML = oldText;
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        // ══════════════════════════════════════════
        // V8: BANDEJA GMAIL
        // ══════════════════════════════════════════

        async function loadBandejaGmail() {
            try {
                const res = await authFetch(N8N_GET_DATA, { method: 'POST', body: '{}' });
                if (res.ok) {
                    const txt = await res.text();
                    const data = txt ? JSON.parse(txt) : [];
                    bandejaData = Array.isArray(data) ? data : [];
                    updateBandejaKPIs(bandejaData);
                    renderBandeja(bandejaData);
                }
            } catch(e) { logError('Error cargando bandeja: ' + e.message); }
        }

        function updateBandejaKPIs(data) {
            const el = id => document.getElementById(id);
            el('bandeja-total') && (el('bandeja-total').textContent = data.length);
            el('bandeja-alta') && (el('bandeja-alta').textContent = data.filter(d => (d.Prioridad || d.prioridad) === 'ALTA').length);
            el('bandeja-asignados') && (el('bandeja-asignados').textContent = data.filter(d => {
                const ab = d['Abogado asignado'] || d.abogado_asignado || '';
                return ab && ab !== 'PENDIENTE';
            }).length);
            el('bandeja-pendientes') && (el('bandeja-pendientes').textContent = data.filter(d => {
                const ab = d['Abogado asignado'] || d.abogado_asignado || '';
                return !ab || ab === 'PENDIENTE';
            }).length);
        }

        function renderBandeja(list) {
            const tbody = document.getElementById('bandeja-rows');
            if (!tbody) return;
            if (!list || list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" style="padding:0;border:none;"><div class="empty-state-svg no-bg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><span>No hay emails procesados</span></div></td></tr>';
                return;
            }
            // Ordenar por fecha DESC
            const sorted = [...list].sort((a, b) => {
                const fA = a.Fecha || a.fecha || '';
                const fB = b.Fecha || b.fecha || '';
                return fB.localeCompare(fA);
            });
            tbody.innerHTML = sorted.map(r => {
                const prioridad = r.Prioridad || r.prioridad || 'MEDIA';
                const estado = r['Estado Alerta'] || r.estado_alerta || '';
                const abogado = r['Abogado asignado'] || r.abogado_asignado || '';
                const partes = r.Partes || r.partes || '';
                // "Quien defender" — el cliente identificado por el sistema
                const clienteDefender = r['Cliente a Defender'] || r.nombre_cliente || partes.split(' vs ')[1] || partes.split(' VS ')[1] || '—';
                const prioColor = prioridad === 'ALTA' ? '#ef4444' : prioridad === 'MEDIA' ? '#f97316' : '#22c55e';
                const estadoColor = estado === 'ASIGNADO' ? '#22c55e' : '#f97316';
                return `<tr>
                    <td><span style="color:var(--gold);font-weight:600;font-size:0.82rem;">${esc(r.token || r.Token || '')}</span></td>
                    <td>${esc(r.Fecha || r.fecha || '')}</td>
                    <td>${esc(r.mail_destino || r['mail_destino'] || '')}</td>
                    <td>${esc(r.asunto || r.Asunto || '').slice(0, 40)}</td>
                    <td><span style="background:rgba(201,168,76,0.1);padding:2px 6px;border-radius:4px;font-size:0.75rem;">${esc(r.Rama || r.rama || '')}</span></td>
                    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;">${esc(partes)}</td>
                    <td><strong style="color:var(--gold-bright);">${esc(clienteDefender)}</strong></td>
                    <td>${abogado && abogado !== 'PENDIENTE' ? esc(abogado) : '<span style="color:#f97316;font-weight:600;">PENDIENTE</span>'}</td>
                    <td><span style="color:${prioColor};font-weight:700;font-size:0.82rem;">${esc(prioridad)}</span></td>
                    <td>${esc(r['Fecha de Vencimiento'] || r.fecha_vencimiento || '')}</td>
                    <td><span style="color:${estadoColor};font-weight:600;font-size:0.82rem;">${esc(estado || 'PENDIENTE')}</span></td>
                </tr>`;
            }).join('');
        }

        function filtrarBandeja() {
            const q = (document.getElementById('bandeja-buscar')?.value || '').toLowerCase();
            const rama = document.getElementById('bandeja-rama')?.value || '';
            const prioridad = document.getElementById('bandeja-prioridad')?.value || '';
            const estado = document.getElementById('bandeja-estado')?.value || '';
            let filtered = bandejaData;
            if (q) filtered = filtered.filter(r => JSON.stringify(r).toLowerCase().includes(q));
            if (rama) filtered = filtered.filter(r => (r.Rama || r.rama || '') === rama);
            if (prioridad) filtered = filtered.filter(r => (r.Prioridad || r.prioridad || '') === prioridad);
            if (estado) filtered = filtered.filter(r => (r['Estado Alerta'] || r.estado_alerta || '').includes(estado));
            updateBandejaKPIs(filtered);
            renderBandeja(filtered);
        }

                // ══════════════════════════════════════════
        // REGISTRO LEGAL — agrupado por cliente + badge NUEVO
        // FASE 3
        // ══════════════════════════════════════════

        let _expAllData = [];
        const _anotacionesCache = {};
        // Set de tokens marcados como vistos en esta sesión
        const _casosVistos = new Set();

        function renderExpedientesCards(list) {
            _expAllData = list || [];
            const container = document.getElementById('exp-cards-container');
            if (!container) return;
            if (!list || list.length === 0) {
                container.innerHTML = `<div class="empty-state-svg no-bg"><svg fill="none" stroke="var(--gold)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg><span>No hay casos asignados aún.</span></div>`;
                return;
            }

            // Badge global de nuevos (fecha hoy o marcados como es_nuevo_caso)
            const badge = document.getElementById('exp-new-badge');
            if (badge) {
                const nuevos = list.filter(c => c.es_nuevo_caso && !_casosVistos.has(c.token));
                if (nuevos.length > 0) {
                    badge.style.display = 'inline';
                    badge.textContent = `⚡ ${nuevos.length} NUEVO${nuevos.length > 1 ? 'S' : ''}`;
                } else {
                    badge.style.display = 'none';
                }
            }

            // Agrupar por cliente
            const grupos = {};
            list.forEach(c => {
                const key = (c.cliente_a_defender || c.partes || 'Sin cliente').trim();
                if (!grupos[key]) grupos[key] = [];
                grupos[key].push(c);
            });

            // Ordenar grupos: primero los que tienen algún caso nuevo
            const gruposOrdenados = Object.entries(grupos).sort(([, casosA], [, casosB]) => {
                const tieneNuevoA = casosA.some(c => c.es_nuevo_caso && !_casosVistos.has(c.token)) ? 1 : 0;
                const tieneNuevoB = casosB.some(c => c.es_nuevo_caso && !_casosVistos.has(c.token)) ? 1 : 0;
                return tieneNuevoB - tieneNuevoA;
            });

            container.innerHTML = gruposOrdenados.map(([clienteNombre, casos]) => {
                const tieneNuevo = casos.some(c => c.es_nuevo_caso && !_casosVistos.has(c.token));
                const badgeNuevo = tieneNuevo
                    ? `<span style="background:#f97316;color:#fff;font-size:0.6rem;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:1px;margin-left:8px;">⚡ NUEVO</span>`
                    : '';

                // Último vencimiento del grupo (más próximo con color)
                const vencimientos = casos
                    .map(c => c.venc)
                    .filter(v => v && v !== 'S/D' && v !== 'N/A');

                const totalCasos = casos.length;
                const abogado = casos[0]?.lawyer || 'Sin abogado';

                // Cards de casos del cliente
                const casosHTML = casos.map((c, idx) => renderCasoCard(c, clienteNombre, idx)).join('');

                const grupoId = `grupo-${clienteNombre.replace(/[^a-z0-9]/gi, '_')}`;

                // Registrar metadatos del grupo para las funciones globales
                window._grupoMeta = window._grupoMeta || {};
                window._grupoMeta[grupoId] = { clienteNombre, tokens: casos.map(c => c.token).filter(Boolean) };

                return `
                <div class="cliente-grupo" style="margin-bottom:1.5rem;">
                    <!-- Header del cliente (clickable) -->
                    <div class="cliente-grupo-header" onclick="toggleGrupo('${grupoId}')"
                         style="display:flex;align-items:center;justify-content:space-between;
                                background:linear-gradient(90deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02));
                                border:1px solid rgba(201,168,76,0.2);border-radius:10px 10px 0 0;
                                padding:12px 16px;cursor:pointer;user-select:none;
                                transition:background 0.2s;">
                        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                            <span style="font-size:1.1rem;">👤</span>
                            <span style="font-size:0.95rem;font-weight:700;color:var(--white);
                                         white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                ${esc(clienteNombre)}
                            </span>
                            <span style="font-size:0.75rem;color:var(--silver);background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;white-space:nowrap;margin-left:5px;">
                                ${casos.map(c => c.token).filter(Boolean).join(' / ')}
                            </span>
                            ${badgeNuevo}
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
                            <span style="font-size:0.72rem;color:var(--silver);">
                                👨‍⚖️ ${esc(abogado)}
                            </span>
                            <span style="font-size:0.72rem;color:rgba(201,168,76,0.7);
                                         background:rgba(201,168,76,0.1);padding:2px 10px;
                                         border-radius:20px;font-weight:700;">
                                ${totalCasos} caso${totalCasos !== 1 ? 's' : ''}
                            </span>
                            <span id="chevron-${grupoId}"
                                  style="color:var(--gold);font-size:0.8rem;transition:transform 0.2s;">▼</span>
                        </div>
                    </div>

                    <!-- Barra de acciones del cliente (siempre visible) -->
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;
                                padding:8px 16px;
                                background:rgba(0,0,0,0.25);
                                border:1px solid rgba(201,168,76,0.15);border-top:none;
                                border-radius:0 0 10px 10px;"
                         onclick="event.stopPropagation()">
                        <button class="btn-outline" style="font-size:0.73rem;height:28px;padding:0 12px;"
                                onclick="toggleGroupPanel('gseg-${grupoId}','${grupoId}'); event.stopPropagation()">
                            📝 Seguimiento
                        </button>
                        <button class="btn-outline" style="font-size:0.73rem;height:28px;padding:0 12px;"
                                onclick="toggleGroupPanel('ghist-${grupoId}','${grupoId}'); event.stopPropagation()">
                            📧 Historial Emails
                        </button>
                        <button class="btn-outline" style="font-size:0.73rem;height:28px;padding:0 12px;
                                       margin-left:auto;border-color:rgba(201,168,76,0.5);color:var(--gold);"
                                onclick="exportarClientePDF('${grupoId}'); event.stopPropagation()">
                            📥 Exportar PDF
                        </button>
                    </div>

                    <!-- Panel Seguimiento del cliente -->
                    <div id="gseg-${grupoId}" class="exp-panel"
                         style="border-radius:8px;margin-top:4px;"></div>

                    <!-- Panel Historial del cliente -->
                    <div id="ghist-${grupoId}" class="exp-panel"
                         style="border-radius:8px;margin-top:4px;"></div>

                    <!-- Casos del cliente (colapsables) -->
                    <div id="${grupoId}" style="margin-top:8px;padding-left:12px;
                                                 border-left:2px solid rgba(201,168,76,0.15);">
                        ${casosHTML}
                    </div>
                </div>`;
            }).join('');
        }

        function toggleGrupo(grupoId) {
            const el = document.getElementById(grupoId);
            const chevron = document.getElementById(`chevron-${grupoId}`);
            if (!el) return;
            const isOpen = el.style.display !== 'none';
            el.style.display = isOpen ? 'none' : 'block';
            if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
        }

        function getDictamenHTML(c) {
            if (!c.dictamen) return c.desc || '<em>Sin resumen disponible.</em>';
            try {
                const d = typeof c.dictamen === 'string' ? JSON.parse(c.dictamen) : c.dictamen;
                if (!d || (!d.analisis_documento && !d.estrategia_tactica)) return c.desc || '<em>Sin resumen disponible.</em>';

                const section = (title, items, color) => {
                    let content = '';
                    const entries = Object.entries(items);
                    if (entries.length === 0) return '';
                    
                    for (const [key, val] of entries) {
                        if (val && val !== 'N/A' && val !== 'null' && val !== 'NINGUNA' && val !== 'NO APLICAN') {
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            content += `<p style="margin:4px 0;"><strong>${label}:</strong> ${esc(String(val))}</p>`;
                        }
                    }
                    if (!content && title.includes('ANALISIS')) return ''; // Skip empty analysis
                    if (!content) content = '<p style="margin:4px 0;font-style:italic;opacity:0.6;">Sin hallazgos relevantes.</p>';

                    return `
                        <div style="margin-bottom:12px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;border-left:4px solid ${color};">
                            <h4 style="margin:0 0 10px;color:${color};font-size:0.85rem;text-transform:uppercase;letter-spacing:0.5px;">${title}</h4>
                            <div style="font-size:0.8rem;color:var(--silver-lt);font-family:inherit;">${content}</div>
                        </div>`;
                };

                return `
                    <div style="margin-bottom:15px;padding:10px;background:rgba(201,168,76,0.05);border-radius:8px;border:1px dashed rgba(201,168,76,0.2);">
                        <p style="margin:0;font-size:0.75rem;color:var(--gold);"><strong>Abogado Responsable:</strong> ${esc(c.lawyer || 'PENDIENTE DE ASIGNACIÓN')}</p>
                    </div>
                    ${section('1. ANÁLISIS DEL DOCUMENTO', d.analisis_documento || {}, 'var(--gold)')}
                    ${section('2. NULIDADES Y EXCEPCIONES', d.nulidades_excepciones || {}, '#ef4444')}
                    ${section('3. ANÁLISIS DEL CASO', d.analisis_caso || {}, '#22c55e')}
                    ${section('4. ESTRATEGIA TÁCTICA', d.estrategia_tactica || {}, '#3b82f6')}
                    ${section('5. ALERTA DE VACÍOS', d.alerta_vacios || {}, '#f39c12')}
                    ${section('6. VENCIMIENTO PROCESAL', d.calculo_vencimiento_procesal || {}, '#9b59b6')}
                `;
            } catch (e) {
                console.error("Error parsing dictamen for", c.token, e);
                return c.desc || '<em>Sin resumen disponible.</em>';
            }
        }

        function marcarComoVisto(tok, cardId) {
            _casosVistos.add(tok);
            // Quitar badge de la tarjeta específica (usando cardId único)
            const badge = document.getElementById(`nuevo-badge-${cardId || tok}`);
            if (badge) badge.style.display = 'none';
            // Recalcular badge global
            const nuevosRestantes = _expAllData.filter(c => c.es_nuevo_caso && !_casosVistos.has(c.token));
            const globalBadge = document.getElementById('exp-new-badge');
            if (globalBadge) {
                if (nuevosRestantes.length > 0) {
                    globalBadge.style.display = 'inline';
                    globalBadge.textContent = `⚡ ${nuevosRestantes.length} NUEVO${nuevosRestantes.length > 1 ? 'S' : ''}`;
                } else {
                    globalBadge.style.display = 'none';
                }
            }
        }

        function renderCasoCard(c, clienteNombre, idx) {
            const tok = esc(c.token);
            // ID único por tarjeta (evita colisiones si dos casos tienen el mismo token)
            const cardId = `${tok}_${idx}`;
            const esNuevo = c.es_nuevo_caso && !_casosVistos.has(c.token);

            const vencColor = (() => {
                if (!c.venc || c.venc === 'S/D' || c.venc === 'N/A') return 'var(--silver)';
                const m = c.venc.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (!m) return 'var(--silver)';
                const diff = Math.ceil((new Date(parseInt(m[3]), parseInt(m[2])-1, parseInt(m[1])) - new Date()) / 86400000);
                return diff <= 3 ? '#ef4444' : diff <= 10 ? '#f97316' : '#22c55e';
            })();

            const vencLabel = (() => {
                if (!c.venc || c.venc === 'S/D' || c.venc === 'N/A') return 'Sin vencimiento';
                const m = c.venc.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                if (!m) return esc(c.venc);
                const diff = Math.ceil((new Date(parseInt(m[3]), parseInt(m[2])-1, parseInt(m[1])) - new Date()) / 86400000);
                const suffix = diff < 0 ? `⚠ vencido` : diff === 0 ? `¡hoy!` : `en ${diff}d`;
                return `${esc(c.venc)} <span style="font-size:0.7rem;opacity:0.8;">(${suffix})</span>`;
            })();

            const prioColor = c.priority === 'ALTA' ? '#ef4444' : c.priority === 'MEDIA' ? '#f97316' : '#22c55e';

            const badgeNuevo = esNuevo
                ? `<span id="nuevo-badge-${cardId}" style="background:#f97316;color:#fff;font-size:0.6rem;
                            font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:1px;">⚡ NUEVO</span>`
                : `<span id="nuevo-badge-${cardId}" style="display:none;"></span>`;

            return `
            <div class="exp-card" id="exp-card-${cardId}" style="margin-bottom:10px;">

                <!-- Franja superior: Tipo + fecha -->
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
                    <div style="min-width:0;flex:1;">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
                            <!-- Tipo de documento (principal diferenciador) -->
                            <span style="font-size:1rem;font-weight:800;color:var(--white);
                                         white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                📄 ${esc(c.tipo || c.rama || 'Documento legal')}
                            </span>
                            ${badgeNuevo}
                        </div>
                        <!-- Categoría y prioridad como chips secundarios -->
                        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                            <span style="font-size:0.7rem;text-transform:uppercase;font-weight:700;
                                         letter-spacing:0.8px;color:rgba(201,168,76,0.7);
                                         background:rgba(201,168,76,0.08);padding:2px 8px;
                                         border-radius:20px;">${esc(c.rama || 'General')}</span>
                            <span style="font-size:0.7rem;font-weight:700;color:${prioColor};
                                         background:${prioColor}18;padding:2px 8px;border-radius:20px;">
                                ⚡ ${esc(c.priority || 'MEDIA')}
                            </span>
                        </div>
                        <!-- Partes -->
                        <p style="margin:0;font-size:0.78rem;color:var(--silver);line-height:1.4;">
                            ${esc(c.partes || '—')}
                        </p>
                    </div>
                    <!-- Fechas (columna derecha) -->
                    <div style="text-align:right;flex-shrink:0;min-width:110px;">
                        <div style="font-size:0.7rem;color:var(--silver);margin-bottom:4px;">
                            🗓 ${esc(c.date || '—')}
                        </div>
                        <div style="font-size:0.76rem;font-weight:700;color:${vencColor};">
                            📅 ${vencLabel}
                        </div>
                    </div>
                </div>

                <!-- Meta chips inferiores -->
                <div class="exp-card-meta" style="margin-top:8px;">
                    <span class="exp-meta-chip">👨‍⚖️ ${esc(c.lawyer || 'Sin abogado')}</span>
                    ${c.nit ? `<span class="exp-meta-chip">🪪 ${esc(c.nit)}</span>` : ''}
                </div>

                <!-- Botones de acción -->
                <div class="exp-panel-btns">
                    <button class="btn-outline" style="font-size:0.76rem;height:32px;padding:0 12px;"
                            onclick="toggleExpPanel('res-${cardId}', '${cardId}'); marcarComoVisto('${tok}','${cardId}')">
                        📊 Resumen IA
                    </button>
                    ${c.archivo_url ? `
                    <button class="btn-premium" style="font-size:0.76rem;height:32px;padding:0 12px;"
                            onclick="openPdfModal('${esc(c.archivo_url)}'); marcarComoVisto('${tok}','${cardId}')">
                        📄 Ver Documento
                    </button>` : ''}
                </div>

                <!-- Panel Resumen IA -->
                <div id="res-${cardId}" class="exp-panel">
                    <p style="font-size:0.72rem;font-weight:700;color:var(--gold);text-transform:uppercase;
                               letter-spacing:1px;margin:0 0 12px;">📊 Resumen Detallado (Dictamen IA)</p>
                    <div style="line-height:1.6;">
                        ${getDictamenHTML(c)}
                    </div>
                </div>

            </div>`;
        }

        function toggleExpPanel(panelId, cardId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const isOpen = panel.classList.contains('open');
            // Cerrar todos los paneles de la misma tarjeta
            const id = cardId || panelId.split('-').slice(1).join('-');
            ['res','doc'].forEach(prefix => {
                const p = document.getElementById(`${prefix}-${id}`);
                if (p) p.classList.remove('open');
            });
            if (!isOpen) panel.classList.add('open');
        }

        async function cargarAnotaciones(tok) {
            const list = document.getElementById(`seg-list-${tok}`);
            if (!list) return;
            if (_anotacionesCache[tok]) { renderAnotaciones(tok, _anotacionesCache[tok]); return; }
            list.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">⏳ Cargando...</p>`;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.GET_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ token: tok })
                });
                if (res.ok) {
                    const txt = await res.text();
                    const data = txt ? JSON.parse(txt) : {};
                    const todas = Array.isArray(data.anotaciones) ? data.anotaciones : [];
                    const relacionadas = todas.filter(a => (a.Token || a.token) === tok);
                    _anotacionesCache[tok] = relacionadas;
                    renderAnotaciones(tok, relacionadas);
                } else {
                    list.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin anotaciones aún.</p>`;
                }
            } catch(e) {
                list.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin anotaciones aún.</p>`;
            }
        }

        function renderAnotaciones(tok, list) {
            const el = document.getElementById(`seg-list-${tok}`);
            if (!el) return;
            if (!list || !list.length) {
                el.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin anotaciones aún. Agregá la primera.</p>`;
                return;
            }
            el.innerHTML = list.map(a => {
                const id = a.ID || a.id || '';
                const vis = a.Visibilidad || a.visibilidad || 'Interno';
                const isPublic = vis === 'Público' || vis === 'Publico';
                const visLabel = isPublic
                    ? `<span style="font-size:0.65rem;font-weight:700;color:#22c55e;letter-spacing:0.5px;">👁️ Portal</span>`
                    : `<span style="font-size:0.65rem;font-weight:700;color:var(--silver);letter-spacing:0.5px;">🔒 Interno</span>`;
                const borderColor = isPublic ? 'rgba(34,197,94,0.4)' : 'rgba(201,168,76,0.3)';
                return `
                <div id="ant-${esc(id)}" style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:6px;
                             margin-bottom:6px;border-left:2px solid ${borderColor};">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.68rem;color:var(--gold);font-weight:700;">
                                ${esc(a.Autor || a.autor || a.Operador || a.operador || currentUser?.name || 'Operador')}
                            </span>
                            ${visLabel}
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:0.65rem;color:var(--silver);">${esc(a.Fecha || a.fecha || '')}</span>
                            ${id ? `
                            <button onclick="abrirEditarAnotacion('${esc(id)}','${tok}')" title="Editar"
                                style="background:none;border:1px solid rgba(201,168,76,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:var(--gold);font-size:0.7rem;line-height:1;">✏️</button>
                            <button onclick="eliminarAnotacion('${esc(id)}','${tok}')" title="Eliminar"
                                style="background:none;border:1px solid rgba(239,68,68,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:#ef4444;font-size:0.7rem;line-height:1;">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                    <p id="ant-txt-${esc(id)}" style="margin:0;font-size:0.8rem;color:var(--silver-lt);line-height:1.5;">
                        ${esc(a.Texto || a.texto || '')}
                    </p>
                </div>`;
            }).join('');
        }

        function abrirEditarAnotacion(id, tok) {
            const anotacion = (_anotacionesCache[tok] || []).find(a => (a.ID || a.id) === id);
            if (!anotacion) return;
            const textoActual = anotacion.Texto || anotacion.texto || '';
            const visActual = anotacion.Visibilidad || anotacion.visibilidad || 'Interno';
            const isPublic = visActual === 'Público' || visActual === 'Publico';
            const modal = document.createElement('div');
            modal.id = 'modal-editar-ant';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
            modal.innerHTML = `
                <div style="background:#1a1a1a;border:1px solid rgba(201,168,76,0.3);border-radius:10px;padding:20px;width:90%;max-width:480px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <span style="color:var(--gold);font-weight:700;font-size:0.9rem;">✏️ Editar Anotación</span>
                        <button onclick="document.getElementById('modal-editar-ant').remove()"
                            style="background:none;border:none;color:var(--silver);cursor:pointer;font-size:1.1rem;">✕</button>
                    </div>
                    <textarea id="modal-ant-texto" rows="4"
                        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);
                               border-radius:6px;color:var(--white);padding:8px;font-size:0.85rem;resize:vertical;box-sizing:border-box;"
                    >${textoActual}</textarea>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
                        <input type="checkbox" id="modal-ant-vis" ${isPublic ? 'checked' : ''}
                            style="accent-color:var(--gold);width:14px;height:14px;cursor:pointer;">
                        <label for="modal-ant-vis" style="font-size:0.78rem;color:var(--silver);cursor:pointer;">
                            👁️ Visible en Portal del Cliente
                        </label>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
                        <button onclick="document.getElementById('modal-editar-ant').remove()"
                            style="padding:6px 14px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;
                                   background:none;color:var(--silver);cursor:pointer;font-size:0.8rem;">Cancelar</button>
                        <button onclick="confirmarEditarAnotacion('${id}','${tok}')"
                            style="padding:6px 14px;border:none;border-radius:6px;background:var(--gold);
                                   color:#000;cursor:pointer;font-weight:700;font-size:0.8rem;">Guardar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }

        async function confirmarEditarAnotacion(id, tok) {
            const texto = document.getElementById('modal-ant-texto')?.value?.trim();
            const cb = document.getElementById('modal-ant-vis');
            const visibilidad = cb?.checked ? 'Público' : 'Interno';
            if (!texto) { showToast('El texto no puede estar vacío.', 'error'); return; }
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.EDIT_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, texto, visibilidad, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Anotación actualizada.', 'ok');
                    document.getElementById('modal-editar-ant')?.remove();
                    delete _anotacionesCache[tok];
                    cargarAnotaciones(tok);
                } else { showToast(`Error al editar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function eliminarObsGlobal(id, tok) {
            if (!confirm('¿Eliminar esta observación? Esta acción no se puede deshacer.')) return;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.DELETE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Observación eliminada.', 'ok');
                    // Recargar lista global
                    observacionesData = observacionesData.filter(o => (o.ID || o.id) !== id);
                    renderObservaciones(observacionesData);
                } else { showToast(`Error al eliminar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function eliminarAnotacion(id, tok) {
            if (!confirm('¿Eliminar esta anotación? Esta acción no se puede deshacer.')) return;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.DELETE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Anotación eliminada.', 'ok');
                    delete _anotacionesCache[tok];
                    cargarAnotaciones(tok);
                } else { showToast(`Error al eliminar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function guardarSeguimiento(tok) {
            const input = document.getElementById(`seg-input-${tok}`);
            const texto = input?.value?.trim();
            const cb = document.getElementById(`seg-vis-${tok}`);
            const visibilidad = cb?.checked ? 'Público' : 'Interno';
            if (!texto) { showToast('Escribí una anotación primero.', 'error'); return; }
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.SAVE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({
                        token: tok,
                        tipo: 'SEGUIMIENTO',
                        texto: texto,
                        anotacion: texto,
                        visibilidad: visibilidad,
                        operador: currentUser?.name || 'Operador',
                        fecha: new Date().toLocaleString('es-CO')
                    })
                });
                if (res.ok) {
                    showToast('Anotación guardada.', 'ok');
                    input.value = '';
                    if (cb) cb.checked = false;
                    delete _anotacionesCache[tok];
                    cargarAnotaciones(tok);
                } else {
                    showToast(`Error al guardar: ${res.status}`, 'error');
                }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function loadExpedienteEmails(tok, clienteNombre) {
            const container = document.getElementById(`hist-list-${tok}`);
            if (!container) return;
            container.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">⏳ Cargando historial...</p>`;
            try {
                const mismasCausas = db.filter(c =>
                    (c.cliente_a_defender || c.partes || '').toLowerCase().trim() ===
                    (clienteNombre || '').toLowerCase().trim()
                );
                if (!mismasCausas.length) {
                    container.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin historial de emails para este cliente.</p>`;
                    return;
                }
                container.innerHTML = mismasCausas.map(c => `
                    <div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;
                                 margin-bottom:6px;border-left:2px solid rgba(201,168,76,0.2);">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;
                                     gap:8px;flex-wrap:wrap;">
                            <div style="min-width:0;flex:1;">
                                <p style="margin:0;font-size:0.8rem;color:var(--white);font-weight:600;
                                           white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                    📄 ${esc(c.tipo || c.rama || 'Documento legal')}
                                </p>
                                <p style="margin:2px 0 0;font-size:0.72rem;color:var(--silver);">
                                    📅 ${esc(c.date)} ${c.venc && c.venc !== 'S/D' ? `• Vence: ${esc(c.venc)}` : ''}
                                </p>
                                ${c.messageId ? `
                                <button class="btn-outline" style="font-size:0.65rem;height:24px;padding:0 8px;margin-top:6px;border-color:rgba(201,168,76,0.3);color:var(--gold);"
                                        onclick="window.open('https://mail.google.com/mail/u/0/#inbox/${esc(c.messageId)}', '_blank')">
                                    📎 Ver Documento (Gmail)
                                </button>` : ''}
                            </div>
                            <span style="font-family:monospace;font-size:0.7rem;color:var(--gold);
                                          background:rgba(201,168,76,0.1);padding:2px 7px;
                                          border-radius:4px;flex-shrink:0;">${esc(c.token)}</span>
                        </div>
                    </div>`).join('');
            } catch(e) {
                container.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Error cargando historial.</p>`;
            }
        }

        // ══════════════════════════════════════════
        // ACCIONES DE GRUPO (nivel cliente)
        // ══════════════════════════════════════════

        function toggleGroupPanel(panelId, grupoId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const isOpen = panel.classList.contains('open');
            // Cerrar todos los paneles del grupo
            ['gseg-', 'ghist-'].forEach(prefix => {
                const p = document.getElementById(prefix + grupoId);
                if (p) p.classList.remove('open');
            });
            if (!isOpen) {
                panel.classList.add('open');
                if (panelId.startsWith('gseg-')) loadGroupSeguimiento(panelId, grupoId);
                if (panelId.startsWith('ghist-')) loadGroupHistorial(panelId, grupoId);
            }
        }

        async function loadGroupSeguimiento(panelId, grupoId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const meta = (window._grupoMeta || {})[grupoId] || {};
            const tokens = meta.tokens || [];
            const clienteNombre = meta.clienteNombre || '';

            panel.innerHTML = `
                <p style="font-size:0.72rem;font-weight:700;color:var(--gold);text-transform:uppercase;
                           letter-spacing:1px;margin:0 0 10px;">📝 Seguimiento — ${esc(clienteNombre)}</p>
                <div id="${panelId}-list" style="margin-bottom:12px;max-height:260px;overflow-y:auto;">
                    <p style="font-size:0.78rem;color:var(--silver);font-style:italic;">⏳ Cargando...</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:1.5rem;align-items:stretch;
                            background:rgba(255,255,255,0.02);padding:1rem;border-radius:10px;
                            border:1px solid rgba(255,255,255,0.04);">
                    ${tokens.length > 1 ? `
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <label style="font-size:0.7rem;color:var(--silver);">Caso</label>
                        <select id="${panelId}-token"
                                style="height:32px;padding:0 8px;background:rgba(255,255,255,0.04);
                                       border:1px solid rgba(255,255,255,0.08);border-radius:6px;
                                       color:var(--white);font-size:0.78rem;">
                            ${tokens.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
                        </select>
                    </div>` : `<input type="hidden" id="${panelId}-token" value="${esc(tokens[0] || '')}">`}
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <label style="font-size:0.7rem;color:var(--silver);">Nueva anotación</label>
                        <textarea id="${panelId}-input" rows="2" placeholder="Escribí una anotación..."
                                  style="padding:8px 12px;background:rgba(255,255,255,0.04);
                                         border:1px solid rgba(255,255,255,0.08);border-radius:8px;
                                         color:var(--white);font-size:0.82rem;resize:vertical;
                                         font-family:inherit;width:100%;"></textarea>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <input type="checkbox" id="${panelId}-vis"
                               style="accent-color:var(--gold);width:14px;height:14px;cursor:pointer;">
                        <label for="${panelId}-vis" style="font-size:0.75rem;color:var(--silver);cursor:pointer;">
                            👁️ Portal &nbsp;<span style="color:rgba(255,255,255,0.3);">/ 🔒 Interno por defecto</span>
                        </label>
                    </div>
                    <button class="btn-premium" style="align-self:flex-start;height:32px;font-size:0.78rem;padding:0 20px;"
                            onclick="guardarGroupSeguimiento('${panelId}','${grupoId}')">
                        💾 Guardar
                    </button>
                </div>`;

            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.GET_OBS, { method: 'POST', body: '{}' });
                const listEl = document.getElementById(`${panelId}-list`);
                if (!listEl) return;
                if (res.ok) {
                    const txt = await res.text();
                    const data = txt ? JSON.parse(txt) : {};
                    const todas = Array.isArray(data.anotaciones) ? data.anotaciones : [];
                    const relacionadas = todas.filter(a => tokens.includes(a.Token || a.token));
                    renderGroupAnotaciones(listEl, relacionadas, panelId, grupoId);
                } else {
                    listEl.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin anotaciones aún.</p>`;
                }
            } catch(e) {
                const listEl = document.getElementById(`${panelId}-list`);
                if (listEl) listEl.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Error al cargar.</p>`;
                logError('Error cargando seguimiento grupo: ' + e.message);
            }
        }

        function renderGroupAnotaciones(listEl, list, panelId, grupoId) {
            if (!list || !list.length) {
                listEl.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin anotaciones aún. Agregá la primera.</p>`;
                return;
            }
            listEl.innerHTML = list.map(a => {
                const id = a.ID || a.id || '';
                const vis = a.Visibilidad || a.visibilidad || 'Interno';
                const isPublic = vis === 'Público' || vis === 'Publico';
                const borderColor = isPublic ? 'rgba(34,197,94,0.4)' : 'rgba(201,168,76,0.3)';
                const visLabel = isPublic
                    ? `<span style="font-size:0.62rem;font-weight:700;color:#22c55e;">👁️ Portal</span>`
                    : `<span style="font-size:0.62rem;font-weight:700;color:var(--silver);">🔒 Interno</span>`;
                return `
                <div id="gant-${esc(id)}" style="padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:6px;
                             margin-bottom:6px;border-left:2px solid ${borderColor};">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.68rem;color:var(--gold);font-weight:700;">
                                ${esc(a.Autor || a.autor || a.Operador || a.operador || 'Operador')}
                                <span style="opacity:0.55;font-weight:400;"> • ${esc(a.Token || a.token || '')}</span>
                            </span>
                            ${visLabel}
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:0.65rem;color:var(--silver);">${esc(a.Fecha || a.fecha || '')}</span>
                            ${id ? `
                            <button onclick="abrirEditarGroupAnotacion('${esc(id)}','${esc(panelId)}','${esc(grupoId)}')" title="Editar"
                                style="background:none;border:1px solid rgba(201,168,76,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:var(--gold);font-size:0.7rem;line-height:1;">✏️</button>
                            <button onclick="eliminarGroupAnotacion('${esc(id)}','${esc(panelId)}','${esc(grupoId)}')" title="Eliminar"
                                style="background:none;border:1px solid rgba(239,68,68,0.3);border-radius:4px;
                                       padding:2px 6px;cursor:pointer;color:#ef4444;font-size:0.7rem;line-height:1;">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                    <p style="margin:0;font-size:0.8rem;color:var(--silver-lt);line-height:1.5;">
                        ${esc(a.Texto || a.texto || '')}
                    </p>
                </div>`;
            }).join('');
        }

        function abrirEditarGroupAnotacion(id, panelId, grupoId) {
            // Reconstruir lista desde el DOM para obtener datos actuales
            const allDivs = document.querySelectorAll(`#${panelId}-list [id^="gant-"]`);
            const div = document.getElementById(`gant-${id}`);
            if (!div) return;
            const textoActual = div.querySelector('p')?.textContent?.trim() || '';
            const isPublic = div.style.borderLeftColor.includes('34,197,94');
            const modal = document.createElement('div');
            modal.id = 'modal-editar-gant';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
            modal.innerHTML = `
                <div style="background:#1a1a1a;border:1px solid rgba(201,168,76,0.3);border-radius:10px;padding:20px;width:90%;max-width:480px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <span style="color:var(--gold);font-weight:700;font-size:0.9rem;">✏️ Editar Anotación</span>
                        <button onclick="document.getElementById('modal-editar-gant').remove()"
                            style="background:none;border:none;color:var(--silver);cursor:pointer;font-size:1.1rem;">✕</button>
                    </div>
                    <textarea id="modal-gant-texto" rows="4"
                        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(201,168,76,0.3);
                               border-radius:6px;color:var(--white);padding:8px;font-size:0.85rem;resize:vertical;box-sizing:border-box;"
                    >${textoActual}</textarea>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
                        <input type="checkbox" id="modal-gant-vis" ${isPublic ? 'checked' : ''}
                               style="accent-color:var(--gold);width:14px;height:14px;cursor:pointer;">
                        <label for="modal-gant-vis" style="font-size:0.78rem;color:var(--silver);cursor:pointer;">
                            👁️ Visible en Portal del Cliente
                        </label>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
                        <button onclick="document.getElementById('modal-editar-gant').remove()"
                            style="padding:6px 14px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;
                                   background:none;color:var(--silver);cursor:pointer;font-size:0.8rem;">Cancelar</button>
                        <button onclick="confirmarEditarGroupAnotacion('${id}','${panelId}','${grupoId}')"
                            style="padding:6px 14px;border:none;border-radius:6px;background:var(--gold);
                                   color:#000;cursor:pointer;font-weight:700;font-size:0.8rem;">Guardar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }

        async function confirmarEditarGroupAnotacion(id, panelId, grupoId) {
            const texto = document.getElementById('modal-gant-texto')?.value?.trim();
            const cb = document.getElementById('modal-gant-vis');
            const visibilidad = cb?.checked ? 'Público' : 'Interno';
            if (!texto) { showToast('El texto no puede estar vacío.', 'error'); return; }
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const meta = (window._grupoMeta || {})[grupoId] || {};
                const tok = meta.tokens?.[0] || '';
                const res = await authFetch(WH.EDIT_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, texto, visibilidad, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Anotación actualizada.', 'ok');
                    document.getElementById('modal-editar-gant')?.remove();
                    loadGroupSeguimiento(panelId, grupoId);
                } else { showToast(`Error al editar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function eliminarGroupAnotacion(id, panelId, grupoId) {
            if (!confirm('¿Eliminar esta anotación? Esta acción no se puede deshacer.')) return;
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const meta = (window._grupoMeta || {})[grupoId] || {};
                const tok = meta.tokens?.[0] || '';
                const res = await authFetch(WH.DELETE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({ id, token: tok, operador: currentUser?.name || 'Operador' })
                });
                if (res.ok) {
                    showToast('Anotación eliminada.', 'ok');
                    loadGroupSeguimiento(panelId, grupoId);
                } else { showToast(`Error al eliminar: ${res.status}`, 'error'); }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        async function guardarGroupSeguimiento(panelId, grupoId) {
            const tok = document.getElementById(`${panelId}-token`)?.value;
            const input = document.getElementById(`${panelId}-input`);
            const texto = input?.value?.trim();
            const cb = document.getElementById(`${panelId}-vis`);
            const visibilidad = cb?.checked ? 'Público' : 'Interno';
            if (!tok) { showToast('Sin caso seleccionado', 'error'); return; }
            if (!texto) { showToast('Escribí una anotación primero.', 'error'); return; }
            try {
                const WH = window.FLOOVU_CONFIG.WEBHOOKS;
                const res = await authFetch(WH.SAVE_OBS, {
                    method: 'POST',
                    body: JSON.stringify({
                        token: tok,
                        tipo: 'SEGUIMIENTO',
                        texto,
                        anotacion: texto,
                        visibilidad,
                        operador: currentUser?.name || 'Operador',
                        fecha: new Date().toLocaleString('es-CO')
                    })
                });
                if (res.ok) {
                    showToast('Anotación guardada.', 'ok');
                    if (input) input.value = '';
                    if (cb) cb.checked = false;
                    loadGroupSeguimiento(panelId, grupoId);
                } else {
                    showToast(`Error al guardar: ${res.status}`, 'error');
                }
            } catch(e) { showToast('Error: ' + e.message, 'error'); }
        }

        function loadGroupHistorial(panelId, grupoId) {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const meta = (window._grupoMeta || {})[grupoId] || {};
            const clienteNombre = meta.clienteNombre || '';

            panel.innerHTML = `<p style="font-size:0.72rem;font-weight:700;color:var(--gold);text-transform:uppercase;
                                          letter-spacing:1px;margin:0 0 10px;">📧 Historial de Emails — ${esc(clienteNombre)}</p>
                               <div id="${panelId}-list"><p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Cargando...</p></div>`;

            const mismasCausas = _expAllData.filter(c =>
                (c.cliente_a_defender || c.partes || '').toLowerCase().trim() ===
                clienteNombre.toLowerCase().trim()
            );
            const listEl = document.getElementById(`${panelId}-list`);
            if (!listEl) return;
            if (!mismasCausas.length) {
                listEl.innerHTML = `<p style="font-size:0.78rem;color:var(--silver);font-style:italic;">Sin historial de emails para este cliente.</p>`;
                return;
            }
            listEl.innerHTML = mismasCausas.map(c => `
                <div style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:8px;
                             margin-bottom:8px;border-left:2px solid rgba(201,168,76,0.2);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
                        <div style="min-width:0;flex:1;">
                            <p style="margin:0;font-size:0.82rem;color:var(--white);font-weight:600;">
                                📄 ${esc(c.tipo || c.rama || 'Documento legal')}
                            </p>
                            <p style="margin:3px 0 0;font-size:0.72rem;color:var(--silver);">
                                📅 ${esc(c.date)}${c.venc && c.venc !== 'S/D' ? ` &nbsp;•&nbsp; Vence: <strong style="color:#f97316;">${esc(c.venc)}</strong>` : ''}
                            </p>
                            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
                                ${c.archivo_url ? `<button class="btn-outline" style="font-size:0.7rem;height:26px;padding:0 10px;"
                                    onclick="openPdfModal('${esc(c.archivo_url)}')">📄 Ver Documento</button>` : ''}
                            </div>
                        </div>
                        <span style="font-family:monospace;font-size:0.72rem;color:var(--gold);
                                      background:rgba(201,168,76,0.1);padding:2px 8px;
                                      border-radius:4px;flex-shrink:0;">${esc(c.token)}</span>
                    </div>
                </div>`).join('');
        }

        function exportarClientePDF(grupoId) {
            const meta = (window._grupoMeta || {})[grupoId] || {};
            const clienteNombre = meta.clienteNombre || 'Cliente';
            const casos = _expAllData.filter(c =>
                (c.cliente_a_defender || c.partes || '').trim() === clienteNombre.trim()
            );
            const abogado = casos[0]?.lawyer || 'Por asignar';
            const fecha = new Date().toLocaleString('es-CO');

            const casosHTML = casos.map(c => {
                let resumenHTML = '';
                if (c.dictamen) {
                    try {
                        const d = typeof c.dictamen === 'string' ? JSON.parse(c.dictamen) : c.dictamen;
                        if (d && d.analisis_documento) {
                                resumenHTML = Object.entries(d.analisis_documento)
                                    .filter(([k, v]) => v && v !== 'N/A' && v !== 'null')
                                    .map(([k, v]) => `<p style="margin:3px 0;"><strong style="text-transform: capitalize;">${k.replace(/_/g,' ')}:</strong> ${v}</p>`)
                                    .join('');
                        }
                    } catch(e) {}
                }
                const prioColor = c.priority === 'ALTA' ? '#c0392b' : c.priority === 'MEDIA' ? '#e67e22' : '#27ae60';
                return `
                <div style="border:1px solid #ddd;border-radius:8px;padding:18px;margin-bottom:20px;break-inside:avoid;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <span style="background:#f5f0e0;color:#c9a84c;padding:3px 10px;border-radius:5px;
                                     font-weight:700;font-size:0.9em;">${c.token || ''}</span>
                        <span style="font-size:0.8em;color:#888;">${c.date || ''}</span>
                    </div>
                    <p style="margin:5px 0;"><strong>Tipo:</strong> ${c.tipo || c.rama || 'N/A'}</p>
                    <p style="margin:5px 0;"><strong>Partes:</strong> ${c.partes || 'N/A'}</p>
                    <p style="margin:5px 0;"><strong>Vencimiento:</strong>
                        <span style="color:${c.venc && c.venc !== 'S/D' ? '#c0392b' : '#888'};
                                     font-weight:${c.venc && c.venc !== 'S/D' ? '700' : '400'}">
                            ${c.venc && c.venc !== 'S/D' ? c.venc : 'Sin vencimiento'}
                        </span>
                    </p>
                    <p style="margin:5px 0;"><strong>Prioridad:</strong>
                        <span style="color:${prioColor};font-weight:700;">${c.priority || 'MEDIA'}</span>
                    </p>
                    ${resumenHTML ? `
                    <div style="margin-top:12px;padding:12px;background:#fafaf7;border-radius:6px;border-left:4px solid #c9a84c;">
                        <p style="margin:0 0 8px;font-weight:700;color:#c9a84c;font-size:0.85em;
                                   text-transform:uppercase;">🤖 Análisis IA</p>
                        <div style="font-size:0.83em;color:#444;">${resumenHTML}</div>
                    </div>` : ''}
                </div>`;
            }).join('');

            const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Expediente Legal — ${clienteNombre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; color: #222; padding: 32px; max-width: 820px; margin: 0 auto; }
  h1 { color: #c9a84c; border-bottom: 3px solid #c9a84c; padding-bottom: 10px; margin-bottom: 6px; font-size: 1.6em; }
  h2 { color: #333; font-size: 1.15em; margin-bottom: 20px; }
  .meta-row { display: flex; gap: 24px; margin-bottom: 24px; font-size: 0.9em; color: #555; }
  .meta-item strong { color: #222; }
  .section-title { font-size: 1em; font-weight: 700; text-transform: uppercase;
                   letter-spacing: 1px; color: #666; margin: 24px 0 12px; }
  @media print { body { padding: 16px; } @page { margin: 2cm; } }
</style>
</head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
    <div>
        <h1>📋 Expediente Legal</h1>
        <h2>${clienteNombre}</h2>
    </div>
    <div style="text-align:right;font-size:0.8em;color:#888;">
        <p>Generado: ${fecha}</p>
    </div>
</div>
<div class="meta-row">
    <div class="meta-item"><strong>Total casos:</strong> ${casos.length}</div>
    <div class="meta-item"><strong>Abogado:</strong> ${abogado}</div>
    <div class="meta-item"><strong>Tokens:</strong> ${casos.map(c => c.token).filter(Boolean).join(', ')}</div>
</div>
<div class="section-title">Casos</div>
${casosHTML}
</body></html>`;

            const win = window.open('', '_blank');
            if (win) {
                win.document.write(html);
                win.document.close();
                win.addEventListener('load', () => win.print());
            } else {
                showToast('Habilitá las ventanas emergentes para exportar.', 'error');
            }
        }

        function filtrarExpedientes(q) {
            if (!q || !q.trim()) { renderExpedientesCards(_expAllData); return; }
            const query = q.toLowerCase();
            const filtered = _expAllData.filter(c =>
                String(c.token || '').toLowerCase().includes(query) ||
                String(c.cliente_a_defender || c.partes || '').toLowerCase().includes(query) ||
                String(c.nit || c.nit_cedula || '').toLowerCase().includes(query) ||
                String(c.lawyer || '').toLowerCase().includes(query) ||
                String(c.tipo || '').toLowerCase().includes(query) ||
                String(c.rama || '').toLowerCase().includes(query)
            );
            renderExpedientesCards(filtered);
        }

        // FIN REGISTRO LEGAL


        function init() {
            // Fase 1: abogados primero — los casos necesitan el array lawyers listo
            loadLawyers().catch(e => logError('Error cargando abogados: ' + e)).finally(() => {
                // Fase 2: cargar casos, bandeja y observaciones en paralelo
                Promise.allSettled([
                    loadRealData(),
                    loadBandejaGmail(),
                    loadObservaciones()
                ]).then(results => {
                    results.forEach((r, i) => {
                        if (r.status === 'rejected') {
                            logError(`Error en carga inicial [${ ['casos','bandeja','observaciones'][i]}]: ${r.reason}`);
                        }
                    });
                    // Fase 3: clientes después de que db esté lleno
                    loadClients().catch(e => logError('Error cargando clientes: ' + e));
                    // Dashboard admin
                    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'AGENCIA' || currentUser.role === 'agencia')) {
                        renderAdminDashboard();
                        pingEngineAdmin();
                    }
                });
            });
        }

        // Auto-refresh: verificar servicios cada 60s si es admin
        let _healthInterval = null;
        function startHealthAutoRefresh() {
            if (_healthInterval) clearInterval(_healthInterval);
            _healthInterval = setInterval(() => {
                if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'AGENCIA' || currentUser.role === 'agencia')) pingEngineAdmin();
            }, 60000);
        }

        // ── Expose functions to global scope ──
        window.abrirEditarAnotacion = abrirEditarAnotacion;
        window.abrirEditarGroupAnotacion = abrirEditarGroupAnotacion;
        window.addClient = addClient;
        window.addLawyer = addLawyer;
        window.applyRoleUI = applyRoleUI;
        window.cargarAnotaciones = cargarAnotaciones;
        window.closeClientModal = closeClientModal;
        window.closePdfModal = closePdfModal;
        window.confirmarEditarAnotacion = confirmarEditarAnotacion;
        window.confirmarEditarGroupAnotacion = confirmarEditarGroupAnotacion;
        window.crearUsuario = crearUsuario;
        window.deleteClient = deleteClient;
        window.deleteLawyer = deleteLawyer;
        window.doLogin = doLogin;
        window.doLogout = doLogout;
        window.eliminarAnotacion = eliminarAnotacion;
        window.eliminarGroupAnotacion = eliminarGroupAnotacion;
        window.eliminarUsuario = eliminarUsuario;
        window.exportClientsExcel = exportClientsExcel;
        window.exportClientsPDF = exportClientsPDF;
        window.exportarClientePDF = exportarClientePDF;
        window.fetchClientMails = fetchClientMails;
        window.finish = finish;
        window.forceGmailSync = forceGmailSync;
        window.forceLogoutSession = forceLogoutSession;
        window.guardarGroupSeguimiento = guardarGroupSeguimiento;
        window.guardarObservacion = guardarObservacion;
        window.guardarSeguimiento = guardarSeguimiento;
        window.init = init;
        window.loadBandejaGmail = loadBandejaGmail;
        window.loadClients = loadClients;
        window.loadDebugLog = loadDebugLog;
        window.loadGroupHistorial = loadGroupHistorial;
        window.loadGroupSeguimiento = loadGroupSeguimiento;
        window.loadObservaciones = loadObservaciones;
        window.loadRealData = loadRealData;
        window.loadUsuariosAdmin = loadUsuariosAdmin;
        window.openClientModal = openClientModal;
        window.openPdfModal = openPdfModal;
        window.pingEngineAdmin = pingEngineAdmin;
        window.renderActiveSessions = renderActiveSessions;
        window.renderAnotaciones = renderAnotaciones;
        window.renderGroupAnotaciones = renderGroupAnotaciones;
        window.saveClientEdit = saveClientEdit;
        window.startHealthAutoRefresh = startHealthAutoRefresh;
        window.switchDebugTab = switchDebugTab;
        window.toggleDesc = toggleDesc;
        window.toggleExpPanel = toggleExpPanel;
        window.toggleGroupPanel = toggleGroupPanel;
        window.toggleGrupo = toggleGrupo;
        window.togglePassVisibility = togglePassVisibility;
        window.loadClientModalObservaciones  = loadClientModalObservaciones;
        window.renderClientModalObservaciones = renderClientModalObservaciones;
        window.abrirEditarObsClienteModal    = abrirEditarObsClienteModal;
        window.confirmarEditarObsClienteModal = confirmarEditarObsClienteModal;
        window.eliminarObsClienteModal       = eliminarObsClienteModal;

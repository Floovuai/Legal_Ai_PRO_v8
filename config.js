// ============================================================
// FLOOVU LEGAL AI PRO v8 — Archivo de Configuración
// ============================================================
// INSTRUCCIONES:
// 1. Reemplaza BASE_URL con la URL base de tu instancia de n8n
//    Ejemplo: 'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook'
// 2. Reemplaza el API_SECRET con el mismo valor que tienes en
//    todos los nodos "Validar Auth" de n8n (actualmente: Hangar89*)
// 3. Reemplaza ACCOUNT_EMAIL con el email de la cuenta activa
// ============================================================

window.FLOOVU_CONFIG = {

    // ── Autenticación ──────────────────────────────────────
    API_SECRET: 'Hangar89*',

    // ── Email de la cuenta activa (se muestra en el sidebar) ──
    ACCOUNT_EMAIL: 'chvaldiviezo@gmail.com',

    // ── Webhooks ───────────────────────────────────────────
    // Reemplaza BASE_URL con tu URL base de n8n
    WEBHOOKS: (function() {
        const BASE_URL = 'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook';
        return {
            // Procesamiento de Gmail
            FORCE_SYNC:     BASE_URL + '/floovu-force-sync',

            // Datos del Registro Legal
            GET_DATA:       BASE_URL + '/floovu-get-data',

            // Asignación de casos
            ASSIGN:         BASE_URL + '/floovu-asignar-cliente',

            // Abogados
            GET_LAWYERS:    BASE_URL + '/floovu-get-abogados',
            LAWYER_SAVE:    BASE_URL + '/floovu-guardar-abogado',
            LAWYER_DELETE:  BASE_URL + '/floovu-eliminar-abogado',

            // Clientes
            GET_CLIENTS:    BASE_URL + '/floovu-get-clientes',
            CLIENT_SAVE:    BASE_URL + '/floovu-guardar-cliente',
            CLIENT_DELETE:  BASE_URL + '/floovu-eliminar-cliente',

            // Sistema
            HEALTH_CHECK:   BASE_URL + '/floovu-health-check',
        };
    })()
};

// ============================================
// FLOOVU Legal AI - Configuración TEMPLATE
// ============================================
// Este archivo es un TEMPLATE que GitHub Actions
// completa con valores desde GitHub Secrets.
// Los valores reales (config.js) se generan en el build.
// ============================================

window.FLOOVU_ENV = {
    // Base de n8n (sin trailing slash).
    // Todos los webhooks se construyen a partir de esto.
    N8N_BASE: '{{N8N_BASE}}',

    // Email de la cuenta operativa principal
    ACCOUNT_EMAIL: '{{ACCOUNT_EMAIL}}',

    // Configuración de Firebase
    // (para control de sesión multi-dispositivo)
    FIREBASE: {
        apiKey:            "{{FIREBASE_API_KEY}}",
        authDomain:        "{{FIREBASE_AUTH_DOMAIN}}",
        databaseURL:       "{{FIREBASE_DB_URL}}",
        projectId:         "{{FIREBASE_PROJECT_ID}}",
        storageBucket:     "{{FIREBASE_STORAGE_BUCKET}}",
        messagingSenderId: "{{FIREBASE_SENDER_ID}}",
        appId:             "{{FIREBASE_APP_ID}}"
    }
};

// ============================================
// FLOOVU Legal AI - Plantilla de configuración
// ============================================
// Para instalar el sistema:
// 1. Copiar este archivo como "config.js" (sin .example)
// 2. Rellenar con los valores reales de esta instalación
// 3. Nunca subir el config.js a un repositorio público
// ============================================

window.FLOOVU_ENV = {
    // Base de n8n (sin trailing slash). Ej: https://tu-n8n.com/webhook
    N8N_BASE: 'https://TU-N8N.EJEMPLO.COM/webhook',

    // Email de la cuenta operativa principal
    ACCOUNT_EMAIL: 'admin@tudominio.com',

    // Configuración de Firebase (crear proyecto en https://console.firebase.google.com)
    FIREBASE: {
        apiKey:            "TU_FIREBASE_API_KEY",
        authDomain:        "TU-PROYECTO.firebaseapp.com",
        databaseURL:       "https://TU-PROYECTO-default-rtdb.firebaseio.com",
        projectId:         "TU-PROYECTO",
        storageBucket:     "TU-PROYECTO.firebasestorage.app",
        messagingSenderId: "000000000000",
        appId:             "1:000000000000:web:XXXXXXXXXXXXXXXXXXXXXX"
    }
};

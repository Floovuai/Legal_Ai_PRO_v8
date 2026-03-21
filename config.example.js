// ══════════════════════════════════════════════════════════════
// FLOOVU Legal AI PRO v8 — Archivo de configuración
// ══════════════════════════════════════════════════════════════
//
// ⚠️  INSTRUCCIONES:
//  1. Copia este archivo y renómbralo a: config.js
//  2. Rellena cada valor con tus datos reales
//  3. El config.js está en .gitignore — NUNCA se sube a GitHub
//  4. Para generar los hash de contraseñas usa: hash-generator.html
//
// ══════════════════════════════════════════════════════════════

window.FLOOVU_CONFIG = {

  // ── Cuenta principal ──────────────────────────────────────
  ACCOUNT_EMAIL: 'tu@email.com',

  // ── Secret de autenticación con n8n ───────────────────────
  // Debe coincidir con el valor en el JSON de n8n (x-floovu-secret)
  API_SECRET: 'TU_SECRET_SEGURO_AQUI',

  // ── Usuarios del sistema ──────────────────────────────────
  // Genera los hash con hash-generator.html
  // NUNCA escribas la contraseña en texto plano aquí
  //
  // Roles disponibles:
  //   'admin'    → ve Configuración, Debug y detalles técnicos
  //   'operator' → ve Dashboard, Casos, Clientes, Abogados, Agenda
  //
  USERS: [
    {
      username: 'agencia',
      hash: 'HASH_SHA256_DE_TU_CONTRASEÑA',
      role: 'admin',
      name: 'FLOOVU Agencia',
      email: 'agencia@floovu.com'
    },
    {
      username: 'cliente1',
      hash: 'HASH_SHA256_DE_CONTRASEÑA_CLIENTE',
      role: 'operator',
      name: 'Nombre del Cliente',
      email: 'cliente@empresa.com'
    }
    // Para agregar más clientes, duplica el bloque anterior
  ],

  // ── Webhooks de n8n ───────────────────────────────────────
  WEBHOOKS: {
    FORCE_SYNC:    'https://TU_N8N/webhook/floovu-force-sync',
    GET_DATA:      'https://TU_N8N/webhook/floovu-get-data',
    ASSIGN:        'https://TU_N8N/webhook/floovu-asignar-cliente',
    GET_LAWYERS:   'https://TU_N8N/webhook/floovu-get-abogados',
    LAWYER_SAVE:   'https://TU_N8N/webhook/floovu-guardar-abogado',
    LAWYER_DELETE: 'https://TU_N8N/webhook/floovu-eliminar-abogado',
    GET_CLIENTS:   'https://TU_N8N/webhook/floovu-get-clientes',
    CLIENT_SAVE:   'https://TU_N8N/webhook/floovu-guardar-cliente',
    CLIENT_DELETE: 'https://TU_N8N/webhook/floovu-eliminar-cliente',
    HEALTH_CHECK:  'https://TU_N8N/webhook/floovu-health-check'
  }

};

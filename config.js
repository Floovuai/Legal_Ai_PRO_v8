// ============================================================
//  FLOOVU — Configuración de conexión
//  ⚠️  Este archivo NO debe subirse a GitHub.
//      Asegúrate de que esté en .gitignore
// ============================================================

window.FLOOVU_CONFIG = {

  // Email de la cuenta administradora (se muestra en el sidebar)
  ACCOUNT_EMAIL: 'tu_email@dominio.com',

  // Token secreto compartido con n8n
  // En n8n: valida este valor en el primer nodo Code de cada webhook:
  //   if ($json.headers['x-floovu-secret'] !== 'TU_TOKEN') throw new Error('Unauthorized');
  API_SECRET: 'CAMBIA_ESTE_TOKEN_POR_UNO_SEGURO',

  // Los abogados se cargan automáticamente desde Google Sheets al iniciar.
  // No hace falta configurarlos aquí — agrégalos desde la sección Abogados del panel.

  // Endpoints de n8n
  WEBHOOKS: {
    ASSIGN:        'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-asignar-cliente',
    LAWYER_SAVE:   'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-guardar-abogado',
    LAWYER_DELETE: 'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-eliminar-abogado',
    FORCE_SYNC:    'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-force-sync',
    GET_DATA:      'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-get-data',
    HEALTH_CHECK:  'https://automatizaciones-vs1-n8n.h5jpeh.easypanel.host/webhook/floovu-health-check',
  }

};

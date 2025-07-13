// --- Función para enviar el Webhook a n8n ---
const triggerSnapshotWebhook = async (bounty) => {
  const n8nWebhookUrl = 'http://localhost:5678/webhook-test/e32ed92a-fc53-4cc5-ad05-b0ab4a31b7c0'; // <-- URL de prueba local actualizada

  if (!n8nWebhookUrl.startsWith('http')) {
    console.warn('⚠️  URL de Webhook para n8n no configurada. Saltando trigger de Snapshot.');
    return;
  }

  // ... existing code ...
} 
const axios = require('axios');

const testWebhook = async () => {
  const url = 'http://localhost:5678/webhook-test/e32ed92a-fc53-4cc5-ad05-b0ab4a31b7c0';
  const payload = {
    message: 'Esta es una prueba directa desde un script de Node.js',
    timestamp: new Date()
  };

  console.log(`🚀 Intentando enviar un webhook de prueba a: ${url}`);

  try {
    const response = await axios.post(url, payload);
    console.log('✅ ¡Webhook de prueba enviado con éxito!');
    console.log('Respuesta del servidor:', response.status, response.statusText);
  } catch (error) {
    console.error('❌ Error al enviar el webhook de prueba:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testWebhook(); 
# Integración x402 - Stream Summaries

## 🎯 Concepto Simple

- Último resumen **GRATIS** (siempre)
- Resúmenes antiguos: **0.05 USDC**
- Usuario elige red (Optimism, Base, Polygon, Avalanche, Celo)
- Usa MetaMask + ethers.js (que ya tienes)

## 📦 Archivos Agregados

1. `src/hooks/useX402Payment.js` - Hook de pagos con ethers.js
2. `src/components/PaywallModal.jsx` - Modal de pago
3. `src/components/NetworkSelector.jsx` - Selector de redes

## 🔧 Integración en StreamSummaries.js

### 1. Importar componentes

```javascript
import { useState } from 'react';
import PaywallModal from '../components/PaywallModal';
import useX402Payment from '../hooks/useX402Payment';
```

### 2. Cambiar URL del API

```javascript
// ANTES (S3 directo):
const S3_BASE_URL = 'https://ultravioletadao.s3.us-east-1.amazonaws.com';

// DESPUÉS (Lambda API):
const API_BASE_URL = process.env.REACT_APP_STREAM_SUMMARIES_API ||
  'TU_URL_DEL_TERRAFORM_AQUI'; // La URL que te da terraform apply
```

### 3. Agregar estado para paywall

```javascript
const [showPaywall, setShowPaywall] = useState(false);
const [paywallData, setPaywallData] = useState(null);
const { markAsPaid } = useX402Payment();
```

### 4. Modificar fetch de índice

```javascript
// En streamSummariesService.js - método fetchIndex()

const apiUrl = `${API_BASE_URL}/summaries?lang=${language}`;
const response = await fetch(apiUrl);

if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status}`);
}

const { success, data } = await response.json();

// Transformar al formato existente
return {
  ultima_actualizacion: data.ultima_actualizacion,
  total_resumenes: data.total_streams,
  streamers: data.streamers,
  resumenes: data.streams
};
```

### 5. Modificar fetch de resumen individual

```javascript
// En streamSummariesService.js - método fetchSummary()

const apiUrl = `${API_BASE_URL}/summaries/${videoId}?lang=${language}`;
const response = await fetch(apiUrl);

// Si es 402 Payment Required
if (response.status === 402) {
  // Mostrar paywall
  throw new Error('PAYMENT_REQUIRED');
}

if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status}`);
}

const { success, data } = await response.json();
return data;
```

### 6. Manejar error de pago en componente

```javascript
// En el componente que llama fetchSummary

try {
  const summary = await streamSummariesService.fetchSummary(streamer, videoId, fecha);
  // Mostrar resumen
} catch (error) {
  if (error.message === 'PAYMENT_REQUIRED') {
    // Abrir paywall
    setPaywallData({
      videoId,
      title: `Resumen - ${streamer}`,
      price: '0.05',
      receivingWallet: '0x52110a2Cc8B6bBf846101265edAAe34E753f3389'
    });
    setShowPaywall(true);
  } else {
    // Otro error
    console.error(error);
  }
}
```

### 7. Callback después del pago

```javascript
const handlePaymentSuccess = async (paymentProof) => {
  try {
    // Reintentar fetch con proof de pago
    const apiUrl = `${API_BASE_URL}/summaries/${paywallData.videoId}?lang=${language}`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-PAYMENT': JSON.stringify(paymentProof)
      }
    });

    if (!response.ok) {
      throw new Error('Failed after payment');
    }

    const { data } = await response.json();

    // Marcar como pagado
    markAsPaid(paywallData.videoId, paymentProof);

    // Mostrar resumen
    setCurrentSummary(data);
    setShowPaywall(false);

  } catch (error) {
    console.error('Error loading paid content:', error);
    alert('Error cargando el contenido. Intenta de nuevo.');
  }
};
```

### 8. Renderizar modal

```javascript
return (
  <>
    {/* Tu contenido existente */}
    <main>
      {/* ... */}
    </main>

    {/* Paywall Modal */}
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      content={paywallData}
      onPaymentSuccess={handlePaymentSuccess}
    />
  </>
);
```

## 🚀 Deployment

### 1. Deploy Backend (Lambda)

```bash
cd z:\ultravioleta\code\web\uvd-backend\environments\prod
terraform init
terraform apply
```

Anota la URL que muestra terraform (ej: `https://xxx.execute-api.us-east-2.amazonaws.com/prod`)

### 2. Configurar Frontend

Agrega a `.env`:
```
REACT_APP_STREAM_SUMMARIES_API=https://tu-url-del-terraform
```

### 3. Hacer S3 Privado

**Solo después de verificar que funciona:**

```bash
aws s3api put-public-access-block \
  --bucket ultravioletadao \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## 🧪 Testing

1. **Resumen gratis**: Ir al último resumen - debe abrir sin pago
2. **Paywall**: Ir a resumen antiguo - debe mostrar modal
3. **Pago**: Conectar MetaMask, seleccionar red, pagar 0.05 USDC
4. **Verificar**: Después del pago debe mostrar el resumen completo

## ⚙️ Configuración

- **Facilitator**: `facilitator.ultravioletadao.xyz` (ya configurado)
- **Wallet**: `0x52110a2Cc8B6bBf846101265edAAe34E753f3389`
- **Precio**: 0.05 USDC
- **Redes**: Optimism, Base, Polygon, Avalanche, Celo

## 🔐 Seguridad

✅ S3 bucket privado
✅ Solo Lambda puede leer resúmenes
✅ x402 verifica pagos on-chain
✅ Facilitator valida transacciones

Listo!

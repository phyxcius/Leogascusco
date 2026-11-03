const express = require('express');
const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Endpoint Webhook para Yape
app.post('/api/webhook/yape', async (req, res) => {
  try {
    const { monto, remitente } = req.body;

    // 1. Validar que los datos no estén vacíos
    if (!monto || !remitente) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan datos obligatorios (monto o remitente).' 
      });
    }

    // 2. Estructurar el pago recibido
    const nuevoPagoYape = {
      monto: parseFloat(monto),
      remitente: remitente.trim(),
      metodo: 'Yape (Automático)',
      timestamp: Date.now(),
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    };

    // 3. Guardar en Firebase Realtime Database
    const pagoRef = db.ref('pagosYapeRecibidos').push();
    await pagoRef.set(nuevoPagoYape);

    console.log(`✅ [YAPE] Cobro registrado: S/ ${monto} de ${remitente}`);

    // Responder éxito al celular
    return res.status(200).json({ 
      success: true, 
      message: 'Pago de Yape registrado correctamente en caja.' 
    });

  } catch (error) {
    console.error('❌ Error en webhook de Yape:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
  }
});

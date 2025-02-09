const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');

// Validaciones
const validateApplication = [
  body('email')
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .trim()
    .toLowerCase(),
  
  body('twitter')
    .matches(/^@/)
    .withMessage('El usuario de Twitter debe comenzar con @')
    .trim(),
  
  body('telegram')
    .matches(/^@/)
    .withMessage('El usuario de Telegram debe comenzar con @')
    .trim(),
  
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('La dirección de wallet debe ser válida')
    .trim(),
  
  body('experience')
    .notEmpty()
    .withMessage('La experiencia es requerida')
    .trim(),
  
  body(['fullName', 'twitch', 'references'])
    .trim()
    .optional()
];

router.post('/', validateApplication, async (req, res) => {
  try {
    console.log('📝 Nueva aplicación recibida:', req.body.email);
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Crear nueva aplicación usando Mongoose
    const application = new Application({
      fullName: req.body.fullName,
      email: req.body.email,
      twitter: req.body.twitter,
      telegram: req.body.telegram,
      twitch: req.body.twitch,
      walletAddress: req.body.walletAddress,
      experience: req.body.experience,
      references: req.body.references
    });

    await application.save();
    console.log('✅ Aplicación guardada exitosamente:', req.body.email);

    res.status(201).json({
      success: true,
      message: 'Aplicación recibida correctamente'
    });

  } catch (error) {
    console.error('❌ Error guardando aplicación:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una aplicación con este email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para actualizar el estado de una aplicación
router.put('/status/update/:email', async (req, res) => {
  try {
    console.log('🔄 Actualizando estado para:', req.params.email);
    const { email } = req.params;
    const { status, message } = req.body;

    // Validar que el estado sea uno de los permitidos
    const validStatuses = ['pending', 'review', 'approved', 'waitlist', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const application = await Application.findOne({ email });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la aplicación'
      });
    }

    // Actualizar el estado y la fecha
    application.status = status;
    application.statusMessage = message || '';
    application.statusUpdatedAt = new Date();

    await application.save();
    console.log('✅ Estado actualizado:', req.params.email, status);

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: {
        status: application.status,
        updatedAt: application.statusUpdatedAt,
        message: application.statusMessage
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para verificar estado de aplicación
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const application = await Application.findOne({ email });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la aplicación'
      });
    }

    const responseData = {
      status: application.status || 'pending',
      updatedAt: application.statusUpdatedAt || application.createdAt,
      message: application.statusMessage || ''
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error consultando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar el estado'
    });
  }
});

module.exports = router; 
const express = require('express');
const Application = require('../models/Application');

const router = express.Router();

// POST /apply - Crear nueva aplicación
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      twitter,
      telegram,
      twitch,
      walletAddress,
      story,
      purpose,
      references,
      timestamp
    } = req.body;

    // Validaciones básicas
    if (!fullName || !email || !twitter || !telegram || !walletAddress || !story || !purpose) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados' });
    }

    if (story.length < 55) {
      return res.status(400).json({ error: 'La historia debe tener al menos 55 caracteres' });
    }

    if (purpose.length < 55) {
      return res.status(400).json({ error: 'El propósito debe tener al menos 55 caracteres' });
    }

    // Verificar si ya existe una aplicación con este email
    const existingApplication = await Application.findOne({ email: email.toLowerCase() });
    if (existingApplication) {
      return res.status(400).json({ error: 'Ya existe una aplicación con este email' });
    }

    // Crear nueva aplicación
    const application = new Application({
      fullName,
      email: email.toLowerCase(),
      twitter,
      telegram,
      twitch,
      walletAddress,
      story,
      purpose,
      references,
      timestamp: timestamp || Math.floor(Date.now() / 1000)
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Aplicación enviada exitosamente',
      data: {
        id: application._id,
        status: application.status,
        email: application.email
      }
    });

  } catch (error) {
    console.error('Error creando aplicación:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe una aplicación con este email' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /apply/status/:email - Consultar estado de aplicación
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const application = await Application.findOne({ email: email.toLowerCase() });

    if (!application) {
      return res.status(404).json({ error: 'No se encontró una aplicación con este email' });
    }

    res.json({
      success: true,
      data: {
        status: application.status,
        message: application.message,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error consultando estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /apply - Obtener todas las aplicaciones (solo para admins, implementar autenticación)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /apply/:id/status - Actualizar estado de aplicación (solo para admins)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, message } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    application.status = status;
    if (message) {
      application.message = message;
    }

    await application.save();

    res.json({
      success: true,
      message: 'Estado de aplicación actualizado exitosamente',
      data: {
        id: application._id,
        status: application.status,
        message: application.message
      }
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 
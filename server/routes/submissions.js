const express = require('express');
const Submission = require('../models/Submission');
const Bounty = require('../models/Bounty');
const { authenticateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/bounties/:bountyId/submissions - Crear una nueva entrega para una bounty (ahora accesible para todos)
router.post('/bounties/:bountyId/submissions', async (req, res) => {
  try {
    const { bountyId } = req.params;
    const { submissionContent, submissionType, submitterName } = req.body;

    if (!submissionContent) {
      return res.status(400).json({ error: 'El contenido de la entrega es requerido' });
    }

    const bounty = await Bounty.findById(bountyId);
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty no encontrada' });
    }

    // Determinar submittedBy (si está logueado) y submitterName
    let submittedBy = null;
    // Opcional: Si deseas que el usuario autenticado también tenga su nombre en submitterName, puedes poblarlo aquí
    // if (req.user) {
    //   submittedBy = req.user._id;
    //   submitterName = req.user.username; // o email, según prefieras
    // }

    // Si no hay usuario logueado y no se proporciona nombre/email, rechazar
    if (!req.user && (!submitterName || submitterName.trim() === '')) {
      return res.status(400).json({ error: 'Se requiere un nombre o email para entregas anónimas' });
    }

    // DESACTIVADA: La verificación de existencia de entrega por el mismo usuario
    // if (req.user) {
    //   const existingSubmission = await Submission.findOne({ bounty: bountyId, submittedBy: req.user._id });
    //   if (existingSubmission) {
    //     return res.status(400).json({ error: 'Ya has enviado una tarea para esta bounty' });
    //   }
    //   submittedBy = req.user._id;
    // }
    if (req.user) {
        submittedBy = req.user._id;
    }

    const submission = new Submission({
      bounty: bountyId,
      submittedBy, // Será null si no hay usuario logueado
      submitterName: submitterName || (req.user ? req.user.username : null), // Usa el nombre proporcionado o el del usuario logueado
      submissionContent,
      submissionType: submissionType || 'url',
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Tarea enviada exitosamente',
      data: submission,
    });

  } catch (error) {
    console.error('Error al crear entrega de tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/bounties/:bountyId/submissions - Obtener todas las entregas para una bounty específica
router.get('/bounties/:bountyId/submissions', async (req, res) => {
  try {
    const { bountyId } = req.params;

    const submissions = await Submission.find({ bounty: bountyId })
      .populate('submittedBy', 'username email') // Popula la información del usuario que envió
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions,
    });

  } catch (error) {
    console.error('Error al obtener entregas de tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 
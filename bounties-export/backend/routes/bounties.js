const express = require('express');
const Bounty = require('../models/Bounty');
const Submission = require('../models/Submission');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth');
const http = require('http');

const router = express.Router();

// --- Función para enviar el Webhook a n8n ---
const triggerSnapshotWebhook = async (bounty) => {
  try {
    const payload = {
      bounty: {
        id: bounty._id.toString(),
        title: bounty.title,
        description: bounty.description,
        reward: bounty.reward,
      },
      submissions: await Submission.find({ bounty: bounty._id }).select('submitterName submissionContent').lean(),
    };
    
    const dataString = JSON.stringify(payload);

    const webhookUrl = new URL('http://localhost:5678/webhook/e32ed92a-fc53-4cc5-ad05-b0ab4a31b7c0');

    const options = {
      hostname: webhookUrl.hostname,
      port: webhookUrl.port || (webhookUrl.protocol === 'https' ? 443 : 80),
      path: webhookUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };

    console.log('🚀 Intentando enviar webhook con el módulo http nativo...');

    const req = http.request(options, (res) => {
      console.log(`✅ Webhook enviado. n8n respondió con status: ${res.statusCode}`);
      res.on('data', (chunk) => {
        console.log(`Respuesta de n8n: ${chunk}`);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error enviando el webhook con http.request:', error);
    });

    req.write(dataString);
    req.end();

  } catch (error) {
    console.error(`❌ Error preparando los datos para el webhook: ${error.message}`);
  }
};

// GET /bounties - Obtener todas las bounties (público) con conteo de entregas
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    let matchFilter = { isActive: true };
    if (status) {
      matchFilter.status = status;
    }

    // --- Automatizar cambio de estado: 'todo' -> 'in_review' si expiró ---
    const now = new Date();
    const expiredBounties = await Bounty.find({ status: 'todo', endDate: { $lte: now } });
    for (const bounty of expiredBounties) {
      bounty.status = 'in_review';
      await bounty.save();
      await triggerSnapshotWebhook(bounty);
    }
    // --- Fin automatización ---

    // Pipeline de agregación para obtener bounties con conteo de entregas y creador populado
    const bounties = await Bounty.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'bounty',
          as: 'submissionsData'
        }
      },
      {
        $addFields: {
          submissionsCount: { $size: '$submissionsData' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByData'
        }
      },
      {
        $unwind: {
          path: '$createdByData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          reward: 1,
          status: 1,
          assignedTo: 1,
          startDate: 1,
          endDate: 1,
          priority: 1,
          tags: 1,
          requirements: 1,
          deliverables: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          submissionsCount: 1,
          'createdBy.username': '$createdByData.username',
          'createdBy.email': '$createdByData.email'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parsedLimit }
    ]);

    const total = await Bounty.countDocuments(matchFilter);

    res.json({
      success: true,
      data: bounties,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo bounties (aggregation):', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /bounties/:id - Obtener una bounty específica (público)
router.get('/:id', async (req, res) => {
  try {
    let bounty = await Bounty.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!bounty) {
      return res.status(404).json({ error: 'Bounty no encontrada' });
    }

    // --- Automatizar cambio de estado: 'todo' -> 'in_review' si expiró ---
    const now = new Date();
    if (bounty.status === 'todo' && bounty.endDate && bounty.endDate <= now) {
      bounty.status = 'in_review';
      await bounty.save();
      await triggerSnapshotWebhook(bounty);
    }
    // --- Fin automatización ---

    // 🚩 NUEVO: Traer submissions asociadas a la bounty
    const submissions = await Submission.find({ bounty: bounty._id });

    res.json({
      success: true,
      data: {
        ...bounty.toObject(),
        submissions // <-- agrega las entregas aquí
      }
    });

  } catch (error) {
    console.error('Error obteniendo bounty:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /bounties - Crear nueva bounty (solo admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, reward, status, priority, tags, requirements, deliverables, endDate } = req.body;

    if (!title || !description || !reward) {
      return res.status(400).json({ error: 'Título, descripción y recompensa son requeridos' });
    }

    const bounty = new Bounty({
      title,
      description,
      reward,
      status: status || 'todo',
      priority: priority || 'medium',
      tags: tags || [],
      requirements,
      deliverables,
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user._id
    });

    await bounty.save();

    const populatedBounty = await Bounty.findById(bounty._id)
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Bounty creada exitosamente',
      data: populatedBounty
    });

  } catch (error) {
    console.error('Error creando bounty:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /bounties/:id - Actualizar bounty (solo admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, reward, status, priority, tags, requirements, deliverables, endDate, assignedTo } = req.body;

    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty no encontrada' });
    }

    // Actualizar campos
    if (title) bounty.title = title;
    if (description) bounty.description = description;
    if (reward) bounty.reward = reward;
    if (status) bounty.status = status;
    if (priority) bounty.priority = priority;
    if (tags) bounty.tags = tags;
    if (requirements !== undefined) bounty.requirements = requirements;
    if (deliverables !== undefined) bounty.deliverables = deliverables;
    if (endDate) bounty.endDate = new Date(endDate);
    if (assignedTo !== undefined) bounty.assignedTo = assignedTo;

    await bounty.save();

    const updatedBounty = await Bounty.findById(bounty._id)
      .populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Bounty actualizada exitosamente',
      data: updatedBounty
    });

  } catch (error) {
    console.error('Error actualizando bounty:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /bounties/:id - Eliminar bounty (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty no encontrada' });
    }

    // Soft delete - marcar como inactiva
    bounty.isActive = false;
    await bounty.save();

    res.json({
      success: true,
      message: 'Bounty eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando bounty:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /bounties/:id/status - Cambiar estado de bounty (solo admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }

    const bounty = await Bounty.findById(req.params.id);
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty no encontrada' });
    }

    bounty.status = status;
    await bounty.save();

    const updatedBounty = await Bounty.findById(bounty._id)
      .populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Estado de bounty actualizado exitosamente',
      data: updatedBounty
    });

  } catch (error) {
    console.error('Error actualizando estado de bounty:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 
const express = require('express');
const Wallet = require('../models/Wallet');

const router = express.Router();

// POST /wallets - Validar y guardar wallet
router.post('/', async (req, res) => {
  try {
    const { username, wallet } = req.body;

    if (!username || !wallet) {
      return res.status(400).json({ error: 'Username y wallet son requeridos' });
    }

    // Validación básica de dirección Ethereum (puedes mejorar esto)
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(wallet);
    
    if (!isValidAddress) {
      return res.status(400).json({ error: 'Dirección de wallet inválida' });
    }

    // Verificar si ya existe esta wallet
    const existingWallet = await Wallet.findOne({ wallet: wallet.toLowerCase() });
    if (existingWallet) {
      return res.status(200).json({
        success: true,
        message: 'Wallet ya registrada',
        data: {
          username: existingWallet.username,
          wallet: existingWallet.wallet,
          isValid: existingWallet.isValid
        }
      });
    }

    // Crear nueva entrada de wallet
    const walletEntry = new Wallet({
      username,
      wallet: wallet.toLowerCase(),
      isValid: true
    });

    await walletEntry.save();

    res.status(201).json({
      success: true,
      message: 'Wallet registrada exitosamente',
      data: {
        username: walletEntry.username,
        wallet: walletEntry.wallet,
        isValid: walletEntry.isValid
      }
    });

  } catch (error) {
    console.error('Error registrando wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /wallets - Obtener todas las wallets (solo para admins)
router.get('/', async (req, res) => {
  try {
    const { username, isValid, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }
    if (isValid !== undefined) {
      filter.isValid = isValid === 'true';
    }

    const wallets = await Wallet.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Wallet.countDocuments(filter);

    res.json({
      success: true,
      data: wallets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo wallets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /wallets/:wallet - Verificar si una wallet existe
router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;

    const walletEntry = await Wallet.findOne({ wallet: wallet.toLowerCase() });

    if (!walletEntry) {
      return res.status(404).json({ error: 'Wallet no encontrada' });
    }

    res.json({
      success: true,
      data: {
        username: walletEntry.username,
        wallet: walletEntry.wallet,
        isValid: walletEntry.isValid,
        validationDate: walletEntry.validationDate
      }
    });

  } catch (error) {
    console.error('Error verificando wallet:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 
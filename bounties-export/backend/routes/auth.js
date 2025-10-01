const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    message: 'Token válido',
    user: req.user.toPublicJSON()
  });
});

// Logout (opcional, el frontend puede simplemente eliminar el token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

// Crear usuario admin (solo para desarrollo)
router.post('/create-admin', async (req, res) => {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'No permitido en producción' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    // Crear usuario admin
    const adminUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      message: 'Usuario admin creado exitosamente',
      user: adminUser.toPublicJSON()
    });

  } catch (error) {
    console.error('Error creando admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router; 
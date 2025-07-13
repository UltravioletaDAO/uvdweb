const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB (opcional para desarrollo)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ultravioleta_dao');
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.warn('⚠️  No se pudo conectar a MongoDB:', err.message);
    console.log('💡 Para usar todas las funcionalidades, instala MongoDB o usa MongoDB Atlas');
  }
};

connectDB();

// Importar rutas
const applicationRoutes = require('./routes/applications');
const bountyRoutes = require('./routes/bounties');
const walletRoutes = require('./routes/wallets');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

// Usar rutas
app.use('/apply', applicationRoutes);
app.use('/bounties', bountyRoutes);
app.use('/wallets', walletRoutes);
app.use('/auth', authRoutes);
app.use('/api', submissionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'UltraVioleta DAO API', 
    version: '1.0.0',
    status: 'running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
}); 
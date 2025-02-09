require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const applicationRoutes = require('./routes/applications');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));

// Conexión a MongoDB usando Mongoose con mejor manejo de errores
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado exitosamente a MongoDB Atlas');
  console.log('📁 Base de datos:', mongoose.connection.db.databaseName);
  console.log('📑 Colección:', 'applications');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
  process.exit(1);
});

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas
app.use('/apply', applicationRoutes);

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log('✨ URL del servidor:', `http://localhost:${PORT}`);
})
.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} está en uso. Por favor:`);
    console.error('1. Cierra otros procesos que puedan estar usando este puerto');
    console.error('2. O usa un puerto diferente modificando la variable PORT en .env');
    process.exit(1);
  } else {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
});

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB desconectado por cierre de app');
    await server.close();
    console.log('Servidor HTTP cerrado');
    process.exit(0);
  } catch (err) {
    console.error('Error al cerrar la aplicación:', err);
    process.exit(1);
  }
}); 
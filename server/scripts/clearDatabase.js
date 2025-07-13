const mongoose = require('mongoose');
const Bounty = require('../models/Bounty');
const Submission = require('../models/Submission');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/ultravioleta_dao', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function clearDatabase() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Eliminar todas las bounties
    const bountyResult = await Bounty.deleteMany({});
    console.log(`✅ Eliminadas ${bountyResult.deletedCount} bounties`);
    
    // Eliminar todas las submissions
    const submissionResult = await Submission.deleteMany({});
    console.log(`✅ Eliminadas ${submissionResult.deletedCount} submissions`);
    
    console.log('🎉 Base de datos limpiada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

clearDatabase(); 
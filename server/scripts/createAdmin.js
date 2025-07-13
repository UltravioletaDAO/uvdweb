const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ultravioleta_dao');
    console.log('✅ Conectado a MongoDB');

    // Datos del admin (cambiar estos valores)
    const adminData = {
      username: 'admin',
      email: 'admin@ultravioletadao.xyz',
      password: 'admin123456', // Cambiar por una contraseña segura
      role: 'admin'
    };

    // Verificar si ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email: adminData.email }, { username: adminData.username }] 
    });

    if (existingUser) {
      console.log('❌ Ya existe un usuario con ese email o username');
      process.exit(1);
    }

    // Crear usuario admin
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log('✅ Usuario admin creado exitosamente:');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n🔐 Credenciales de acceso:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createAdminUser(); 
# UltraVioleta DAO - Backend Server

Backend API para UltraVioleta DAO con funcionalidades de aplicaciones, bounties y autenticación.

## 🚀 Características

- **Aplicaciones**: Gestión de aplicaciones de usuarios a la DAO
- **Bounties**: Sistema de tareas y recompensas con administración
- **Autenticación**: JWT para usuarios y administradores
- **Wallets**: Validación y registro de direcciones de wallet
- **MongoDB**: Base de datos NoSQL para almacenamiento

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas

## 📦 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
```

3. **Editar .env con tus configuraciones:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ultravioleta_dao
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

4. **Instalar MongoDB** (si no lo tienes):
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - O usar MongoDB Atlas (cloud)

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 👤 Crear Usuario Administrador

1. **Ejecutar el script de creación:**
```bash
node scripts/createAdmin.js
```

2. **Credenciales por defecto:**
   - Email: `admin@ultravioletadao.xyz`
   - Password: `admin123456`

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer login.

## 📡 Endpoints API

### Autenticación
- `POST /auth/login` - Login de usuario
- `POST /auth/logout` - Logout
- `GET /auth/verify` - Verificar token

### Aplicaciones
- `POST /apply` - Crear aplicación
- `GET /apply/status/:email` - Consultar estado
- `GET /apply` - Listar aplicaciones (admin)
- `PUT /apply/:id/status` - Actualizar estado (admin)

### Bounties
- `GET /bounties` - Listar bounties (público)
- `GET /bounties/:id` - Obtener bounty específica
- `POST /bounties` - Crear bounty (admin)
- `PUT /bounties/:id` - Actualizar bounty (admin)
- `DELETE /bounties/:id` - Eliminar bounty (admin)
- `PATCH /bounties/:id/status` - Cambiar estado (admin)

### Wallets
- `POST /wallets` - Validar y registrar wallet
- `GET /wallets` - Listar wallets (admin)
- `GET /wallets/:wallet` - Verificar wallet

## 🔐 Autenticación

Para endpoints protegidos, incluir el header:
```
Authorization: Bearer <JWT_TOKEN>
```

## 📊 Base de Datos

### Colecciones
- **applications** - Aplicaciones de usuarios
- **bounties** - Tareas y recompensas
- **users** - Usuarios y administradores
- **wallets** - Direcciones de wallet validadas

## 🛡️ Seguridad

- Contraseñas encriptadas con bcrypt
- JWT para autenticación
- Validación de roles (admin/user)
- CORS configurado
- Validación de datos de entrada

## 🔧 Desarrollo

### Estructura del Proyecto
```
server/
├── models/          # Modelos de MongoDB
├── routes/          # Rutas de la API
├── middleware/      # Middlewares (auth, etc.)
├── scripts/         # Scripts de utilidad
├── index.js         # Archivo principal
└── package.json     # Dependencias
```

### Variables de Entorno
- `PORT` - Puerto del servidor (default: 5000)
- `NODE_ENV` - Entorno (development/production)
- `MONGO_URI` - URL de conexión a MongoDB
- `JWT_SECRET` - Clave secreta para JWT
- `CLIENT_URL` - URL del frontend
- `CORS_ORIGIN` - Origen permitido para CORS

## 📝 Licencia

Este proyecto es privado y de uso exclusivo para UltraVioleta DAO. 
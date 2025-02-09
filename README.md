# UltraVioleta DAO

Plataforma de aplicación y gestión para UltraVioleta DAO, la élite de Web3 en Latinoamérica.

## 🚀 Características

- Formulario de aplicación con validación
- Sistema de verificación de estado de aplicaciones
- Links a redes sociales y recursos
- Diseño responsivo y animaciones fluidas
- Integración con MongoDB para gestión de datos

## 🛠️ Tecnologías

- **Frontend**
  - React
  - TailwindCSS
  - Framer Motion
  - React Router
  - Heroicons

- **Backend**
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/ultravioleta-dao.git
cd ultravioleta-dao
```

2. Instala las dependencias del frontend:

```bash
npm install
```

3. Instala las dependencias del backend:
```bash
cd server
npm install
```

4. Crea los archivos de variables de entorno:
   - Copia `.env.example` a `.env` en la raíz
   - Copia `server/.env.example` a `server/.env`
   - Actualiza las variables con tus valores

5. Inicia el servidor de desarrollo:
```bash

# Terminal 1: Frontend
npm start

# Terminal 2: Backend
cd server
npm start
```

## 🔧 Variables de Entorno

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

### Backend (server/.env)
```env
MONGO_URI=mongodb+srv://[usuario]:[password]@[cluster].mongodb.net/[database]
CLIENT_URL=http://localhost:3000
PORT=5000
```

## 📝 Licencia

Este proyecto es privado y de uso exclusivo para UltraVioleta DAO.

## 👥 Contribuciones

Para contribuir al proyecto:

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🌐 Enlaces

- [X](https://x.com/UltravioletaDAO)

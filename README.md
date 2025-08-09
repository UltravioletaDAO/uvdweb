# UltraVioleta DAO

Plataforma de aplicación y gestión para UltraVioleta DAO, la élite de Web3 en Latinoamérica.

## 🎯 SEO Optimización Completa (Enero 2025)

### 📈 Mejoras SEO Implementadas
- **React Helmet Async**: Meta tags dinámicos para cada página con títulos y descripciones optimizadas
- **Datos Estructurados (JSON-LD)**: Schema markup para Organization, Website, FAQs, Events, y Articles
- **Open Graph & Twitter Cards**: Meta tags completos para compartir en redes sociales
- **Sitemap XML**: Generación automática de sitemap con soporte multi-idioma
- **Robots.txt**: Control de rastreo de bots con directivas optimizadas
- **Lazy Loading de Imágenes**: Componente OptimizedImage con carga diferida para mejor rendimiento
- **URLs Canónicas**: Prevención de contenido duplicado con canonical URLs
- **Hreflang Tags**: Soporte completo para 4 idiomas (ES, EN, PT, FR)
- **Utilidades SEO**: Helper functions para generar metadata, schemas, y optimización de contenido

### 🌐 Características Multi-idioma
- Soporte completo para 4 idiomas con hreflang tags
- Meta descriptions traducidas para cada idioma
- URLs alternativas para cada versión de idioma en el sitemap

### 🚀 Scripts de Generación
- `npm run generate:sitemap`: Genera sitemap.xml automáticamente
- `npm run prebuild`: Ejecuta generación de sitemap antes del build

## 🚀 Características Actuales

### 📊 Dashboard y Métricas
- **Dashboard Principal**: Página de inicio con sección hero, resumen de métricas y información de la comunidad
- **Dashboard de Métricas** (`/metrics`): Panel analítico completo con métricas detalladas del DAO
- **DAO Storyteller**: Análisis del DAO impulsado por IA usando OpenAI GPT-3.5 con interpretación de métricas en tiempo real

### 🗳️ Gobernanza y Votación
- **Integración con Snapshot** (`/snapshot`):
  - Visualización de propuestas de gobernanza
  - Votación con integración de MetaMask
  - Poder de voto, quórum y estados de propuestas
  - Soporte para múltiples espacios de Snapshot
  - Ranking de principales votantes
  - Historial de votaciones
- **Sistema de Delegaciones** (`/delegations`): Funcionalidad de staking de validadores en Beam Network

### 💰 Tesorería y Finanzas
- **Gestión de Tesorería**: Integración con Safe multisig en Avalanche
- **Safe Stats** (`/safestats`):
  - Estadísticas y rankings de multifirmantes
  - Análisis del historial de transacciones
  - Filtrado por rango de fechas
  - Seguimiento de porcentaje de actividad
- **Gestión de Fondos**:
  - Seguimiento del balance de la bóveda comunitaria
  - Display del balance de tesorería en USD
  - Requisitos de umbral de multifirmantes

### 🪙 Características del Token
- **Página del Token** (`/token`):
  - Información y métricas del token UVD
  - Integración con gráfico de Dexscreener
  - Funcionalidad de swap de tokens
  - Capacidades de wrapping/unwrapping de tokens
- **Widget de Swap**: Integración DEX usando Arena Router
- **Métricas del Token**:
  - Seguimiento de precio (USD/AVAX)
  - Conteo de holders e historial de transacciones
  - Información del pool de liquidez
  - Gráficos de evolución del precio

### 👥 Comunidad y Membresía
- **Sistema de Aplicación** (`/aplicar`):
  - Formulario de aplicación multi-paso para membresía del DAO
  - Recolección de información personal, redes sociales y experiencia
  - Validación y envío de formularios
- **Estado de Aplicación** (`/status`): Verificación del estado de aplicación
- **Gestión de Miembros**:
  - Sistema de purga (`/purge`) para usuarios inactivos
  - Estadísticas y seguimiento de actividad de miembros
- **Redes Sociales** (`/links`): Enlaces comunitarios y redes sociales

### 📚 Educación y Contenido
- **Cursos** (`/courses`): Contenido educativo y cursos
- **Sistema de Blog** (`/blog`):
  - Listado de publicaciones
  - Páginas individuales de blog (`/blog/:slug`)
- **Sistema de Eventos**: Display de próximos eventos comunitarios

### 🎮 Características Interactivas
- **Rueda UVD** (`/wheel`):
  - Rueda de premios/decisiones con segmentos personalizables
  - Sistema de gestión de participantes
  - Resultados basados en probabilidad
  - Funcionalidad de exportación de resultados
  - Integración con Twitch para recompensas

### 🔗 Integraciones
- **Integración con Twitch**:
  - Autenticación OAuth
  - Gestión de recompensas
  - Manejo de callbacks (`/twitch-callback`)
- **Integraciones Web3**:
  - Conexión de wallet MetaMask
  - Integración con Thirdweb
  - Soporte para múltiples wallets (MetaMask, Rabby, Core)
- **Integración con Snapshot.js**: Integración oficial de Snapshot Labs
- **Integración con Safe**: Gnosis Safe para gestión de tesorería

### 🌐 Características Técnicas
- **Soporte Multi-idioma**: Internacionalización completa (i18n) con traducciones en inglés y español
- **Modo Oscuro**: Cambio de tema de interfaz de usuario
- **Diseño Responsivo**: Layout mobile-first responsivo
- **Animaciones con Framer Motion**: Transiciones e interacciones fluidas
- **Sistema de Notificaciones**: Sistema de feedback con toast notifications
- **Manejo de Errores**: Gestión elegante de errores y fallbacks
- **Caché de Datos**: Múltiples capas de caché para respuestas de API
- **Optimización de Performance**: Lazy loading y code splitting

### 🔧 Servicios y APIs
- **Servicio de Métricas de Token**: Obtención de datos de token en tiempo real
- **Servicio de Evolución de Precio**: Seguimiento histórico de precios
- **Servicio de Snapshot**: Gestión de datos de gobernanza
- **Servicio de Safe**: Gestión de transacciones y propietarios multisig
- **Servicio de Eventos**: Gestión de eventos comunitarios
- **Servicio de Cursos**: Gestión de contenido educativo

### 🔄 Funcionalidades en Desarrollo (TODO)
- Mostrar últimas propuestas en carrusel en la sección de métricas
- Scroll automático para top votantes
- Ocultar multisigs con balance menor a 1 USD

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

## 📝 Cambios Recientes

### Sección de Contribuidores (Contributors)
- **Eliminada**: Página de purga de usuarios inactivos (`/purge`)
- **Agregada**: Nueva página de Contribuidores (`/contributors`) que muestra:
  - Lista completa de los 122 miembros actuales del DAO
  - Búsqueda en tiempo real de miembros
  - Estadísticas de miembros totales, activos y nuevos
  - Filtros para ver todos, activos o nuevos miembros
  - Integración con API para obtener aplicaciones aprobadas pendientes
- **Actualizada**: Navegación reemplazando "Purge" con "Contributors"
- **Mejorado**: Dashboard de métricas ahora incluye sección de contribuidores
- **Traducciones**: Agregadas traducciones completas en español e inglés

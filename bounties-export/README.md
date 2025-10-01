# Bounties Module Export

This package contains all the files needed to integrate the Bounties feature into another project.

## 📁 Structure

```
bounties-export/
├── frontend/
│   ├── pages/
│   │   └── Bounties.js           # Main Bounties page component
│   ├── components/
│   │   ├── BountyForm.js         # Form to create bounties (admin)
│   │   ├── SubmissionList.js     # List of submissions for each bounty
│   │   ├── AdminLoginModal.js    # Admin authentication modal
│   │   ├── WalletConnect.js      # Web3 wallet connection
│   │   └── Modal.js              # Generic modal component
│   └── i18n/
│       ├── en.json               # English translations
│       └── es.json               # Spanish translations
└── backend/
    ├── routes/
    │   ├── bounties.js           # Bounty CRUD endpoints
    │   ├── submissions.js        # Submission endpoints
    │   └── auth.js               # Authentication endpoints
    ├── models/
    │   ├── Bounty.js             # Bounty database model
    │   ├── Submission.js         # Submission database model
    │   └── User.js               # User/Admin model
    └── middleware/
        └── auth.js               # JWT authentication middleware
```

## 🔧 Frontend Integration

### 1. Install Dependencies

```bash
npm install react react-router-dom framer-motion ethers web3modal react-i18next @heroicons/react date-fns ethereum-blockies-base64
```

### 2. Add Route to your App.js

```javascript
import Bounties from './pages/Bounties';

// In your Routes:
<Route path="/bounties" element={<Bounties />} />
```

### 3. Environment Variables

Add to your `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Translation Setup

Merge the translation keys from `i18n/en.json` and `i18n/es.json` into your existing i18n configuration.

## 🔧 Backend Integration

### 1. Install Dependencies

```bash
npm install express mongoose cors dotenv jsonwebtoken bcryptjs
```

### 2. Add to your server index.js

```javascript
const bountyRoutes = require('./routes/bounties');
const submissionRoutes = require('./routes/submissions');
const authRoutes = require('./routes/auth');

app.use('/bounties', bountyRoutes);
app.use('/api', submissionRoutes);
app.use('/auth', authRoutes);
```

### 3. Environment Variables

Add to your `.env` file:
```
MONGO_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

### 4. Database Setup

The models will automatically create the necessary collections in MongoDB.

## 📡 API Endpoints

### Public Endpoints
- `GET /bounties` - List all bounties
- `GET /bounties/:id` - Get specific bounty
- `GET /api/bounties/:bountyId/submissions` - Get submissions for a bounty
- `POST /api/bounties/:bountyId/submissions` - Submit work for a bounty

### Admin Endpoints (require JWT)
- `POST /bounties` - Create new bounty
- `PUT /bounties/:id` - Update bounty
- `DELETE /bounties/:id` - Delete bounty (soft delete)
- `PATCH /bounties/:id/status` - Change bounty status

### Auth Endpoints
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/verify` - Verify token
- `POST /auth/logout` - Logout

## 🎨 Features Included

✅ Bounty Management (CRUD operations)
✅ Submission System (Users can submit work)
✅ Admin Authentication (JWT-based)
✅ Web3 Wallet Integration (MetaMask)
✅ Status Automation (Auto-transition to in_review)
✅ Internationalization (English/Spanish)
✅ Responsive Design (Tailwind CSS)

## 🔐 Creating an Admin User

Run this in development mode:

```bash
POST http://localhost:5000/auth/create-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your_secure_password"
}
```

Or use the included script in `server/scripts/createAdmin.js`

## 🎯 How It Works

1. **Admins** create bounties with rewards
2. **Users** connect their wallet and submit work
3. Bounties move through statuses: `todo` → `in_review` → `done`
4. **Voting integration** triggers webhooks when bounties expire

## 📝 Notes

- The bounty system uses MongoDB for data persistence
- JWT tokens expire after 24 hours
- Wallet addresses are stored but not verified on-chain (you can add this)
- The webhook integration (n8n) is optional and can be removed

## 🚀 Quick Start

### Backend:
```bash
cd backend
npm install
# Configure .env file
npm start
```

### Frontend:
```bash
cd frontend
npm install
# Configure .env file
npm start
```

---

**Exported from:** UltraVioleta DAO Project
**Date:** October 1, 2025
**Version:** 1.0.0


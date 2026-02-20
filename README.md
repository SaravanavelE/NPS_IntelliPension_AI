# 🏛️ NPS IntelliPension AI
### AI-Powered Multilingual Pension Advisory System
**Regulated by PFRDA | Government of India**

---

## 📋 Project Overview

NPS IntelliPension AI is a production-grade, AI-powered pension advisory assistant built for the National Pension System (NPS) ecosystem. It provides intelligent, personalized, multilingual financial guidance powered by predictive analytics.

---

## 🗂️ Project Structure

```
nps-intellipension/
├── frontend/                        # React.js Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx     # Main AI chat UI
│   │   │   ├── CorpusCalculator.jsx  # Pension calculator widget
│   │   │   ├── ScenarioChart.jsx     # Chart visualizations
│   │   │   ├── RiskProfiler.jsx      # Risk assessment UI
│   │   │   ├── LanguageSelector.jsx  # Multilingual toggle
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Simulator.jsx
│   │   │   └── Education.jsx
│   │   ├── utils/
│   │   │   ├── pensionCalculator.js  # Core calculation logic
│   │   │   └── formatters.js
│   │   ├── hooks/
│   │   │   └── useNPSSimulation.js
│   │   ├── context/
│   │   │   └── LanguageContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         # Node.js + Express Backend
│   ├── routes/
│   │   ├── simulation.js            # Pension simulation endpoints
│   │   ├── chat.js                  # AI chat endpoints
│   │   └── auth.js
│   ├── controllers/
│   │   ├── simulationController.js
│   │   └── chatController.js
│   ├── services/
│   │   ├── pensionEngine.js         # Core pension math engine
│   │   ├── aiService.js             # Claude/LLM integration
│   │   └── translationService.js    # Multilingual processing
│   ├── models/
│   │   ├── UserProfile.js
│   │   └── SimulationResult.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimit.js
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| AI Engine | Claude API (Anthropic) |
| Database | MongoDB |
| Translation | i18next + Custom NLP |
| Auth | JWT |
| Deployment | Docker + Nginx |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-org/nps-intellipension.git
cd nps-intellipension

# Install frontend deps
-

# Install backend deps
cd ../backend && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in your API keys and DB connection
```

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Docker (Production)

```bash
docker-compose up --build
```

---

## 🔐 Environment Variables

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nps_intellipension
ANTHROPIC_API_KEY=your_claude_api_key
JWT_SECRET=your_jwt_secret

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/simulation/corpus | Calculate retirement corpus |
| POST | /api/simulation/optimize | Reverse-calculate contributions |
| POST | /api/chat/message | AI chat response |
| GET  | /api/simulation/scenarios | Multi-scenario comparison |
| POST | /api/user/risk-profile | Save risk preference |

---

## 🌐 Supported Languages

Hindi (हिंदी) · English · Tamil (தமிழ்) · Telugu (తెలుగు) · Bengali (বাংলা) · Marathi (मराठी) · Gujarati (ગુજરાતી) · Kannada (ಕನ್ನಡ)

---

## ⚠️ Disclaimer

All projections are estimates based on assumed return rates and historical data. These are **not guaranteed returns**. Users should verify information with official PFRDA sources at [npscra.nsdl.co.in](https://npscra.nsdl.co.in).

---

## 📜 License

Built for PFRDA NPS Ecosystem. Government advisory use aligned.

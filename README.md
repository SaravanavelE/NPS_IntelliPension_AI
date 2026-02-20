# NPS IntelliPension AI

AI-powered multilingual pension advisory platform that helps users plan retirement using predictive calculations, scenario analysis, and an intelligent chat assistant.

![Dashboard](https://github.com/user-attachments/assets/2430f325-35aa-4566-8287-570c69c6ee1a)

## Demo

🔗 [Project Demo Video](https://youtu.be/1pa4OZJtwkE)

## Presentation Slides

🔗 [Presentation](https://drive.google.com/file/d/1tvYnnz7s9ouXhO3yjf1Y8JDm31dlueAk/view?usp=sharing)

## 🚀 Features
- 📊 Retirement corpus calculator (SIP-based projection)
- 🤖 AI Advisor (Claude API integration)
- 📈 Scenario analysis (what-if planning)
- 🌐 Multilingual support (English / Hindi / Tamil)
- 🔐 Secure backend (Helmet, CORS, rate limiting)
- 🧮 Pension simulation engine
- 🧩 REST APIs for calculator and AI chat

## 🧱 Tech Stack
**Frontend**
- React + Vite
- Recharts (visualizations)

**Backend**
- Node.js + Express
- Anthropic Claude API
- MongoDB (optional / containerized)

## 📁 Project Structure
```
nps-intellipension/
├── backend/
│   ├── routes/
│   │   ├── chat.js
│   │   ├── simulation.js
│   │   └── auth.js
│   ├── services/
│   │   ├── pensionCalculator.js
│   │   └── pensionEngine.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
└── README.md
```

## ⚙️ Prerequisites
- Node.js >= 18
- npm
- (Optional) MongoDB

## 🔑 Environment Setup

Create a file:

```
backend/.env
```

Add:

```
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
```

## ▶️ Run Locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
NPS IntelliPension AI Backend running on port 5000
Health check: http://localhost:5000/health
```

### 2) Frontend
Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open:
```
http://localhost:5173
```

## 🧪 API Endpoints

### Health
```
GET /health
```

### Simulation
```
POST /api/simulation/corpus
POST /api/simulation/optimize
POST /api/simulation/scenarios
```

### AI Chat
```
POST /api/chat/message
```

## 🐳 Docker (Optional)
```bash
docker-compose up --build
```

## 🧠 Demo Flow
1. Start backend (port 5000)
2. Start frontend (port 5173)
3. Open AI Advisor tab
4. Ask pension-related questions

## ⚠️ Notes
- Keep API keys private — never commit `.env`.
- Backend must be running for AI chat to work.
- If AI shows “service temporarily unavailable”, check backend logs.

## 📜 License
MIT

# NPS IntelliPension AI — API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Health Check

### GET `/health`
```json
{
  "status": "healthy",
  "service": "NPS IntelliPension AI",
  "version": "1.0.0"
}
```

---

## Simulation Endpoints

### POST `/simulation/corpus`
Calculate retirement corpus.

**Request:**
```json
{
  "monthlyContribution": 5000,
  "currentAge": 30,
  "retirementAge": 60,
  "riskProfile": "moderate",
  "inflationAdjusted": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inputs": {
      "monthlyContribution": 5000,
      "currentAge": 30,
      "retirementAge": 60,
      "years": 30,
      "annualReturnRate": "10.0%"
    },
    "corpus": {
      "totalCorpus": 11322416,
      "totalContributed": 1800000,
      "wealthGained": 9522416,
      "growthMultiplier": "6.29"
    },
    "withdrawal": {
      "annuityCorpus": 4528966,
      "lumpSumWithdrawal": 6793450,
      "estimatedMonthlyPension": 20758
    },
    "assumptions": {
      "annualReturn": "10.0% p.a.",
      "annuityRate": "5.5% p.a.",
      "annuityCorpusPercent": "40% (PFRDA minimum rule)",
      "disclaimer": "Projections are estimates. Not guaranteed."
    }
  }
}
```

---

### POST `/simulation/optimize`
Reverse-calculate required monthly contribution for target corpus.

**Request:**
```json
{
  "targetCorpus": 10000000,
  "currentAge": 30,
  "retirementAge": 60,
  "riskProfile": "moderate"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "targetCorpus": 10000000,
    "years": 30,
    "scenarios": [
      { "riskProfile": "conservative", "annualReturn": "8%", "requiredMonthlyContribution": 6789 },
      { "riskProfile": "moderate",     "annualReturn": "10%", "requiredMonthlyContribution": 4411 },
      { "riskProfile": "aggressive",   "annualReturn": "12%", "requiredMonthlyContribution": 2861 }
    ]
  }
}
```

---

### POST `/simulation/scenarios`
Multi-scenario comparison across all risk profiles.

**Request:**
```json
{
  "monthlyContribution": 5000,
  "currentAge": 30,
  "retirementAge": 60
}
```

---

## Chat Endpoint

### POST `/chat/message`
AI-powered NPS advisory chat.

**Request:**
```json
{
  "message": "I am 30 years old. I invest ₹5000/month. What will my corpus be at 60?",
  "history": [],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Based on your inputs...",
    "language": "en"
  }
}
```

---

## Error Responses

```json
{
  "success": false,
  "error": "Description of the error"
}
```

| Code | Meaning |
|------|---------|
| 400  | Bad Request — Missing or invalid parameters |
| 429  | Too Many Requests — Rate limit exceeded |
| 500  | Internal Server Error |

---

## Rate Limits

- 100 requests per 15 minutes per IP
- Chat endpoint: 30 requests per 15 minutes

---

## Notes

- All monetary values are in Indian Rupees (₹)
- All corpus/pension values are estimates based on assumed return rates
- Verify all projections with official PFRDA sources: npscra.nsdl.co.in

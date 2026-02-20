import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── Pension Calculation Engine ───────────────
const RETURN_RATES = {
  conservative: { label: "Conservative", expectedReturn: 0.08, equity: 25 },
  moderate:     { label: "Moderate",     expectedReturn: 0.10, equity: 50 },
  aggressive:   { label: "Aggressive",   expectedReturn: 0.12, equity: 75 },
};

function simulateCorpus({ monthlyContribution, currentAge, retirementAge = 60, riskProfile = "moderate" }) {
  const profile = RETURN_RATES[riskProfile];
  const monthlyRate = profile.expectedReturn / 12;
  const years = retirementAge - currentAge;
  const months = years * 12;
  if (years <= 0 || monthlyContribution < 500) return null;
  const totalCorpus = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalContributed = monthlyContribution * months;
  const annuityCorpus = totalCorpus * 0.40;
  const lumpSum = totalCorpus * 0.60;
  const monthlyPension = (annuityCorpus * 0.055) / 12;
  const timeline = [];
  for (let age = currentAge; age <= retirementAge; age++) {
    const m = (age - currentAge) * 12;
    const c = m === 0 ? 0 : monthlyContribution * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    timeline.push({ age, corpus: Math.round(c), contributed: Math.round(monthlyContribution * m), gains: Math.round(c - monthlyContribution * m) });
  }
  return { totalCorpus: Math.round(totalCorpus), totalContributed: Math.round(totalContributed), wealthGained: Math.round(totalCorpus - totalContributed), lumpSum: Math.round(lumpSum), monthlyPension: Math.round(monthlyPension), growthMultiplier: (totalCorpus / totalContributed).toFixed(2), years, timeline };
}

function formatINR(n) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000)   return "₹" + (n / 100000).toFixed(2) + " L";
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Translations ─────────────────────────────
const T = {
  en: {
    title: "NPS IntelliPension AI",
    subtitle: "Intelligent Pension Advisory • PFRDA Regulated",
    tab_calculator: "Corpus Calculator",
    tab_chat: "AI Advisor",
    tab_scenarios: "Scenario Analysis",
    tab_learn: "Learn NPS",
    current_age: "Current Age",
    retirement_age: "Retirement Age",
    monthly_contribution: "Monthly Contribution (₹)",
    risk_profile: "Investment Profile",
    calculate: "Calculate Retirement Corpus",
    total_corpus: "Projected Corpus",
    monthly_pension: "Est. Monthly Pension",
    lump_sum: "Lump Sum (60%)",
    growth: "Wealth Growth",
    years_left: "Years to Retire",
    assumptions: "⚠️ Estimates only. Verify with PFRDA.",
    chat_placeholder: "Ask me anything about NPS...",
    send: "Send",
    greeting: "Namaste! 🙏 I'm NPS IntelliPension AI. How can I help you plan your retirement today? You can ask me in Hindi, Tamil, Telugu, Bengali or English.",
  },
  hi: {
    title: "NPS इंटेलीपेंशन AI",
    subtitle: "बुद्धिमान पेंशन सलाहकार • PFRDA विनियमित",
    tab_calculator: "कॉर्पस कैलकुलेटर",
    tab_chat: "AI सलाहकार",
    tab_scenarios: "परिदृश्य विश्लेषण",
    tab_learn: "NPS सीखें",
    current_age: "वर्तमान आयु",
    retirement_age: "सेवानिवृत्ति आयु",
    monthly_contribution: "मासिक योगदान (₹)",
    risk_profile: "निवेश प्रोफाइल",
    calculate: "रिटायरमेंट कॉर्पस कैलकुलेट करें",
    total_corpus: "अनुमानित कॉर्पस",
    monthly_pension: "अनुमानित मासिक पेंशन",
    lump_sum: "एकमुश्त राशि (60%)",
    growth: "धन वृद्धि",
    years_left: "सेवानिवृत्ति तक वर्ष",
    assumptions: "⚠️ केवल अनुमान। PFRDA से सत्यापित करें।",
    chat_placeholder: "NPS के बारे में कुछ भी पूछें...",
    send: "भेजें",
    greeting: "नमस्ते! 🙏 मैं NPS IntelliPension AI हूं। आज आपकी सेवानिवृत्ति योजना में कैसे मदद कर सकता हूं?",
  },
  ta: {
    title: "NPS இன்டெலிபென்ஷன் AI",
    subtitle: "நுண்ணிய ஓய்வூதிய ஆலோசகர் • PFRDA ஒழுங்குபடுத்தப்பட்டது",
    tab_calculator: "கார்பஸ் கணிப்பான்",
    tab_chat: "AI ஆலோசகர்",
    tab_scenarios: "காட்சி பகுப்பாய்வு",
    tab_learn: "NPS கற்றுக்கொள்",
    current_age: "தற்போதைய வயது",
    retirement_age: "ஓய்வு வயது",
    monthly_contribution: "மாதாந்திர பங்களிப்பு (₹)",
    risk_profile: "முதலீட்டு சுயவிவரம்",
    calculate: "ஓய்வூதிய கார்பஸ் கணக்கிடு",
    total_corpus: "மதிப்பீட்டு கார்பஸ்",
    monthly_pension: "மதிப்பீட்டு மாதாந்திர ஓய்வூதியம்",
    lump_sum: "மொத்த தொகை (60%)",
    growth: "செல்வ வளர்ச்சி",
    years_left: "ஓய்வு பெற ஆண்டுகள்",
    assumptions: "⚠️ மதிப்பீடுகள் மட்டுமே. PFRDA உடன் சரிபார்க்கவும்.",
    chat_placeholder: "NPS பற்றி எதுவும் கேளுங்கள்...",
    send: "அனுப்பு",
    greeting: "வணக்கம்! 🙏 நான் NPS IntelliPension AI. இன்று உங்கள் ஓய்வுக்கால திட்டமிடலில் எப்படி உதவலாம்?",
  },
};

// ─── NPS AI Chat (using Anthropic API) ────────
const NPS_SYSTEM = `You are NPS IntelliPension AI, a multilingual pension advisor for India's NPS regulated by PFRDA. Help users with retirement corpus estimation, contribution guidance, NPS rules, tax benefits (80C + 80CCD). Respond in the user's language. Keep responses concise, helpful, and end with: "⚠️ Estimates only. Verify with PFRDA." Never recommend non-NPS investments.`;

async function callClaudeAPI(messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: NPS_SYSTEM,
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "I couldn't process your request. Please try again.";
}

// ─── LEARN NPS CONTENT ────────────────────────
const learnItems = [
  { icon: "🏛️", title: "What is NPS?", body: "National Pension System is a government-regulated voluntary retirement savings scheme. Contributions are invested in Equity (E), Corporate Bonds (C), and Government Securities (G) funds managed by PFRDA-registered Pension Fund Managers." },
  { icon: "📊", title: "Tier I vs Tier II", body: "Tier I is the primary pension account with tax benefits and withdrawal restrictions. Tier II is a voluntary savings account with no withdrawal restrictions but no exclusive tax benefits. Minimum Tier I contribution: ₹500/month." },
  { icon: "🧾", title: "Tax Benefits", body: "NPS offers tax deductions up to ₹1.5 Lakh under Section 80C, plus an exclusive additional ₹50,000 deduction under Section 80CCD(1B), totaling ₹2 Lakh in annual tax benefits." },
  { icon: "💰", title: "At Retirement (Age 60)", body: "You can withdraw up to 60% of the corpus as a tax-free lump sum. The remaining minimum 40% must be used to purchase an annuity, which provides regular monthly pension income." },
  { icon: "📈", title: "Power of Compounding", body: "Starting NPS at age 25 vs 35 can result in 2–3x more corpus at retirement. A ₹3,000/month investment at 25 can grow to ₹1.5 Cr+, while starting at 35 gives only ₹60 L — the 10 extra years make a massive difference." },
  { icon: "🎯", title: "Investment Choice", body: "Active Choice: You decide asset allocation (up to 75% equity till age 50). Auto Choice (Lifecycle Fund): Automatically shifts from equity to debt as you age, reducing risk near retirement." },
];

// ─── MAIN APP ─────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("calculator");
  const t = T[lang] || T.en;

  // Calculator state
  const [form, setForm] = useState({ currentAge: 30, retirementAge: 60, monthlyContribution: 5000, riskProfile: "moderate" });
  const [result, setResult] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([{ role: "assistant", content: t.greeting }]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleCalculate() {
    const r = simulateCorpus(form);
    setResult(r);
  }

  async function handleSendChat() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setChatLoading(true);
    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaudeAPI(apiMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ AI service temporarily unavailable. Please try again." }]);
    }
    setChatLoading(false);
  }

  const scenarios = ["conservative", "moderate", "aggressive"].map(p => {
    const r = simulateCorpus({ ...form, riskProfile: p });
    return { name: RETURN_RATES[p].label, corpus: r?.totalCorpus || 0, pension: r?.monthlyPension || 0, equity: RETURN_RATES[p].equity };
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #0f1b2d 0%, #1a2f4e 40%, #0d2137 100%)", color: "#e8f0fe" }}>
      {/* Header */}
      <header style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}>🏛️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px", color: "#f8fafc" }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{t.subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginRight: 4 }}>Language:</div>
          {["en","hi","ta"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid", borderColor: lang === l ? "#f59e0b" : "rgba(255,255,255,0.12)", background: lang === l ? "rgba(245,158,11,0.15)" : "transparent", color: lang === l ? "#f59e0b" : "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: lang === l ? 600 : 400, transition: "all 0.2s" }}>
              {l === "en" ? "EN" : l === "hi" ? "हि" : "த"}
            </button>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <nav style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
        {[
          { id: "calculator", label: t.tab_calculator, icon: "🧮" },
          { id: "chat",       label: t.tab_chat,       icon: "🤖" },
          { id: "scenarios",  label: t.tab_scenarios,  icon: "📊" },
          { id: "learn",      label: t.tab_learn,      icon: "📚" },
        ].map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 20px", border: "none", borderBottom: tab === id ? "2px solid #f59e0b" : "2px solid transparent", background: "transparent", color: tab === id ? "#f59e0b" : "#94a3b8", fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
            <span>{icon}</span> {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* ─── CALCULATOR TAB ─── */}
        {tab === "calculator" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24 }}>
            {/* Form */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚙️</span> Simulation Parameters
              </h2>
              {[
                { key: "currentAge",        label: t.current_age,          min: 18, max: 59, step: 1 },
                { key: "retirementAge",     label: t.retirement_age,       min: 40, max: 70, step: 1 },
                { key: "monthlyContribution", label: t.monthly_contribution, min: 500, max: 100000, step: 500 },
              ].map(({ key, label, min, max, step }) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>{label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={min} max={max} step={step} value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                      style={{ flex: 1, accentColor: "#f59e0b" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", minWidth: 70, textAlign: "right" }}>
                      {key === "monthlyContribution" ? "₹" + form[key].toLocaleString("en-IN") : form[key]}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>{t.risk_profile}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["conservative","moderate","aggressive"].map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, riskProfile: p }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "1px solid", borderColor: form.riskProfile === p ? "#f59e0b" : "rgba(255,255,255,0.1)", background: form.riskProfile === p ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", color: form.riskProfile === p ? "#f59e0b" : "#94a3b8", fontSize: 11, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", textTransform: "capitalize" }}>
                      {p === "conservative" ? "🛡️" : p === "moderate" ? "⚖️" : "🚀"}<br/>{RETURN_RATES[p].label}<br/><span style={{ fontSize: 10, fontWeight: 400 }}>{RETURN_RATES[p].equity}% Equity</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleCalculate} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.3px", boxShadow: "0 4px 20px rgba(245,158,11,0.35)", transition: "opacity 0.2s" }}>
                {t.calculate}
              </button>
            </div>

            {/* Results */}
            <div>
              {!result ? (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 48, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
                  <div style={{ color: "#64748b", fontSize: 15 }}>Set your parameters and click Calculate to see your retirement projection.</div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                    {[
                      { label: t.total_corpus,    value: formatINR(result.totalCorpus),   icon: "🏦", color: "#f59e0b", sub: `${result.growthMultiplier}x growth` },
                      { label: t.monthly_pension,  value: formatINR(result.monthlyPension), icon: "💵", color: "#10b981", sub: "After annuity (40%)" },
                      { label: t.lump_sum,         value: formatINR(result.lumpSum),        icon: "💰", color: "#3b82f6", sub: "Tax-free withdrawal" },
                    ].map(({ label, value, icon, color, sub }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  {/* Extra stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    {[
                      { label: "Total Invested",  value: formatINR(result.totalContributed), icon: "📥" },
                      { label: "Wealth Created",  value: formatINR(result.wealthGained),     icon: "✨" },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{icon} {label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Chart */}
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 18, border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 14 }}>📈 Corpus Growth Over Time</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={result.timeline.filter((_, i) => i % 2 === 0)}>
                        <defs>
                          <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="age" tick={{ fontSize: 11, fill: "#64748b" }} label={{ value: "Age", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }} />
                        <YAxis tickFormatter={v => v >= 100000 ? (v/100000).toFixed(0)+"L" : v} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#1e2d3d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="corpus" stroke="#f59e0b" strokeWidth={2} fill="url(#corpusGrad)" name="Corpus" />
                        <Area type="monotone" dataKey="contributed" stroke="#3b82f6" strokeWidth={1.5} fill="none" strokeDasharray="4 2" name="Invested" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: "#475569", textAlign: "center" }}>{t.assumptions}</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── CHAT TAB ─── */}
        {tab === "chat" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", height: 560 }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>NPS IntelliPension AI</div>
                  <div style={{ fontSize: 11, color: "#22c55e" }}>● Online • PFRDA Compliant</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "rgba(255,255,255,0.07)", fontSize: 13, lineHeight: 1.55, color: m.role === "user" ? "#fff" : "#e2e8f0", fontWeight: 400 }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex" }}>
                    <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.07)", fontSize: 13, color: "#94a3b8" }}>
                      ⏳ Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendChat()} placeholder={t.chat_placeholder} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: 13, outline: "none" }} />
                <button onClick={handleSendChat} disabled={chatLoading || !input.trim()} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: chatLoading || !input.trim() ? 0.5 : 1 }}>
                  {t.send} ➤
                </button>
              </div>
            </div>
            {/* Quick Questions */}
            <div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>💬 Quick Questions</div>
                {[
                  "I'm 30, invest ₹5000/month. What's my corpus at 60?",
                  "How much to invest for ₹50,000/month pension?",
                  "What are NPS tax benefits?",
                  "Difference between Tier I and Tier II?",
                  "मुझे NPS के बारे में बताएं",
                  "NPS ல் எப்படி சேர்வது?",
                ].map((q, i) => (
                  <button key={i} onClick={() => { setInput(q); setTab("chat"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: 12, cursor: "pointer", lineHeight: 1.4, transition: "all 0.2s" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SCENARIOS TAB ─── */}
        {tab === "scenarios" && (
          <div>
            <div style={{ marginBottom: 20, padding: 16, background: "rgba(245,158,11,0.08)", borderRadius: 12, border: "1px solid rgba(245,158,11,0.2)", fontSize: 13, color: "#fbbf24" }}>
              📌 Scenario based on: Age {form.currentAge} → {form.retirementAge} | ₹{form.monthlyContribution.toLocaleString("en-IN")}/month
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              {scenarios.map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ["#10b981","#f59e0b","#ef4444"][i], marginBottom: 4 }}>{["🛡️","⚖️","🚀"][i]} {s.name}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 14 }}>{s.equity}% Equity Allocation</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{formatINR(s.corpus)}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>Projected Corpus</div>
                  <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Est. Monthly Pension</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{formatINR(s.pension)}/mo</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>📊 Corpus Comparison by Risk Profile</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={scenarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tickFormatter={v => v >= 10000000 ? (v/10000000).toFixed(1)+"Cr" : (v/100000).toFixed(0)+"L"} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: "#1e2d3d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="corpus" name="Total Corpus" fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center" }}>⚠️ All projections are estimates based on assumed return rates. Not guaranteed. Past performance is not indicative of future results.</div>
          </div>
        )}

        {/* ─── LEARN TAB ─── */}
        {tab === "learn" && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>📚 Learn About NPS</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Understanding India's National Pension System</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {learnItems.map(({ icon, title, body }, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 16, background: "rgba(59,130,246,0.08)", borderRadius: 12, border: "1px solid rgba(59,130,246,0.2)", fontSize: 13, color: "#93c5fd" }}>
              🔗 Official Sources: <strong>npscra.nsdl.co.in</strong> · <strong>pfrda.org.in</strong> · <strong>enps.nsdl.com</strong>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px", textAlign: "center", fontSize: 11, color: "#334155" }}>
        NPS IntelliPension AI · PFRDA Compliant · All projections are estimates and not guaranteed returns. Verify with official PFRDA sources.
      </footer>
    </div>
  );
}

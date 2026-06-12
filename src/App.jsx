import { useState, useEffect, useRef } from "react";

const GREEN = "#25D366";
const DARK_GREEN = "#128C7E";
const LIGHT_GREEN = "#DCF8C6";
const WA_BG = "#0B141A";
const WA_CHAT_BG = "#0B141A";
const BUBBLE_BG = "#1F2C34";
const SENT_BG = "#005C4B";

const BOT_NAME = "Retain & Power";
const BOT_AVATAR = "/whatsapp.png"; // Replace with your bot avatar image path

const FLOWS = {
  idle: [
    { from: "bot", text: "Welcome, Merchant! I'm your *Retain & Power* assistant.\n\nI help you retain customers & save on energy costs.\n\nType *LOG* to record a sale, or *REPORT* to see your dashboard.", delay: 500 }
  ],
  log: [
    { from: "bot", text: " *New Sale Logger*\n\nSend your sale in this format:\n`New Sale / Amount / Product / Customer Phone`\n\nExample:\n`New Sale / ₦18,000 / Ankara Gown / 08031234567`", delay: 400 }
  ],
  sale_logged: (amount, product, phone) => [
    { from: "bot", text: `*Sale Recorded!*\n\n Product: ${product}\n Amount: ${amount}\n Customer: ${phone}\n\n_Customer added to your retention pipeline. If they don't return in 45 days, we'll send them a personalised loyalty message automatically._`, delay: 600 }
  ],
  report: [
    { from: "bot", text: "*Your Business Dashboard*\n\n👥 Active Customers: *47*\n🔁 Retention Rate: *68%*\n💰 CAC Saved This Month: *₦170,000*\n⚡ Energy Cost (Bulk Rate): *₦310,000*\n\n_You're saving ₦140,000/month on energy vs. retail pump pricing._\n\nType *ENERGY* to see your Energy Lock status.", delay: 500 }
  ],
  energy: [
    { from: "bot", text: "*Energy Lock Facility*\n\nYour cluster (Yaba Commercial Hub) has *214 merchants* enrolled.\n\nBulk Rate Locked: *₦850/litre*\nRetail Pump Price: *₦1,230/litre*\nYour Savings: *31% below market*\n\n_Next bulk delivery: June 15, 2026_\n\nYour retention score: *⭐⭐⭐⭐ (87/100)* — Energy Lock access: *ACTIVE*", delay: 600 }
  ],
  unknown: [
    { from: "bot", text: "I didn't quite get that.\n\nTry:\n• *LOG* — Record a new sale\n• *REPORT* — View your dashboard\n• *ENERGY* — Check Energy Lock status", delay: 300 }
  ]
};

const SUGGESTIONS = ["LOG", "REPORT", "ENERGY"];

function parseTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: BUBBLE_BG, borderRadius: "0 12px 12px 12px", width: 60, marginBottom: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#aaa",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.from === "bot";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 6, alignItems: "flex-end", gap: 8 }}>
      {isBot && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: DARK_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginBottom: 2 }}>
          <img src={BOT_AVATAR} alt="Bot" style={{ width: 24, height: 24 }} />
        </div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isBot ? BUBBLE_BG : SENT_BG,
        color: "#E9EDEF",
        padding: "9px 13px",
        borderRadius: isBot ? "0 12px 12px 12px" : "12px 0 12px 12px",
        fontSize: 14,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        position: "relative",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
      }}>
        {isBot && <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, marginBottom: 3 }}>{BOT_NAME}</div>}
        <span dangerouslySetInnerHTML={{ __html: msg.text
          .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em style="color:#8ab4a0">$1</em>')
          .replace(/`(.*?)`/g, '<code style="background:#0d2137;padding:2px 5px;border-radius:4px;font-size:13px;color:#7ec8e3">$1</code>')
        }} />
        <div style={{ fontSize: 10, color: "#8696A0", textAlign: "right", marginTop: 4 }}>{msg.time} {!isBot && "✓✓"}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const metrics = [
    { label: "Active Customers", value: "47", delta: "+12 this month", color: GREEN },
    { label: "CAC Saved", value: "₦170K", delta: "-68% vs before", color: "#F0A500" },
    { label: "Energy Cost", value: "₦310K", delta: "-31% bulk rate", color: "#3B82F6" },
    { label: "Net Margin", value: "56.6%", delta: "+183% improvement", color: "#A855F7" },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: "#E9EDEF", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Live Dashboard</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: BUBBLE_BG, borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid ${m.color}` }}>
            <div style={{ color: "#8696A0", fontSize: 11 }}>{m.label}</div>
            <div style={{ color: m.color, fontSize: 20, fontWeight: 800, margin: "4px 0" }}>{m.value}</div>
            <div style={{ color: "#5a7a6a", fontSize: 11 }}>{m.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ background: BUBBLE_BG, borderRadius: 12, padding: 14, marginTop: 10 }}>
        <div style={{ color: "#8696A0", fontSize: 11, marginBottom: 8 }}> Yaba Cluster Energy Lock</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#E9EDEF", fontSize: 13 }}>214 merchants enrolled</span>
          <span style={{ background: "#0d3d2a", color: GREEN, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>ACTIVE</span>
        </div>
        <div style={{ marginTop: 8, background: "#0B141A", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div style={{ width: "87%", height: "100%", background: `linear-gradient(90deg, ${DARK_GREEN}, ${GREEN})`, borderRadius: 8 }} />
        </div>
        <div style={{ color: "#8696A0", fontSize: 11, marginTop: 4 }}>Retention Score: 87/100</div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState("chat");
  const [awaitingSale, setAwaitingSale] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    // Initial greeting
    setTimeout(() => {
      addBotMessages(FLOWS.idle);
    }, 400);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function addBotMessages(flows) {
    setTyping(true);
    flows.forEach((msg, i) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { ...msg, time: parseTime(), id: Date.now() + i }]);
        if (i === flows.length - 1) setTyping(false);
      }, msg.delay + i * 700);
    });
  }

  function handleSend(text) {
    const val = (text || input).trim();
    if (!val) return;
    setInput("");

    setMessages(prev => [...prev, { from: "user", text: val, time: parseTime(), id: Date.now() }]);

    const upper = val.toUpperCase();

    if (awaitingSale) {
      setAwaitingSale(false);
      const parts = val.split("/").map(s => s.trim());
      if (parts.length >= 4 && parts[0].toUpperCase() === "NEW SALE") {
        setTimeout(() => addBotMessages(FLOWS.sale_logged(parts[1], parts[2], parts[3])), 300);
      } else {
        setTimeout(() => addBotMessages(FLOWS.unknown), 300);
      }
    } else if (upper === "LOG") {
      setAwaitingSale(true);
      setTimeout(() => addBotMessages(FLOWS.log), 300);
    } else if (upper === "REPORT") {
      setTimeout(() => addBotMessages(FLOWS.report), 300);
    } else if (upper === "ENERGY") {
      setTimeout(() => addBotMessages(FLOWS.energy), 300);
    } else if (upper.startsWith("NEW SALE")) {
      const parts = val.split("/").map(s => s.trim());
      if (parts.length >= 4) {
        setTimeout(() => addBotMessages(FLOWS.sale_logged(parts[1], parts[2], parts[3])), 300);
      } else {
        setTimeout(() => addBotMessages(FLOWS.unknown), 300);
      }
    } else {
      setTimeout(() => addBotMessages(FLOWS.unknown), 300);
    }
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#111B21", minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 420, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a3942; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1F2C34", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: DARK_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}><img src={BOT_AVATAR} alt="Bot" style={{ width: 24, height: 24 }} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#E9EDEF", fontWeight: 700, fontSize: 15 }}>Retain & Power</div>
          <div style={{ color: GREEN, fontSize: 12 }}>● Online — WhatsApp Business</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["chat", "dash"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? GREEN : "transparent",
              color: tab === t ? "#000" : "#8696A0",
              border: `1px solid ${tab === t ? GREEN : "#2a3942"}`,
              borderRadius: 20, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600
            }}>
              {t === "chat" ? "Chat" : "Dashboard"}
            </button>
          ))}
        </div>
      </div>

      {tab === "dash" ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Dashboard />
        </div>
      ) : (
        <>
          {/* Chat wallpaper */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", background: WA_CHAT_BG, backgroundImage: "radial-gradient(circle at 1px 1px, #1a2530 1px, transparent 0)", backgroundSize: "24px 24px" }}>
            {messages.map(msg => <Message key={msg.id} msg={msg} />)}
            {typing && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: DARK_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div style={{ background: "#111B21", padding: "8px 12px 4px", display: "flex", gap: 8, overflowX: "auto" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => handleSend(s)} style={{
                background: "transparent", border: `1px solid ${DARK_GREEN}`, color: GREEN,
                borderRadius: 20, padding: "5px 14px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600
              }}>
                {s === "LOG" ? "LOG" : s === "REPORT" ? "REPORT" : "ENERGY"}
              </button>
            ))}
            <button onClick={() => handleSend("New Sale / ₦18,000 / Ankara Gown / 08031234567")} style={{
              background: "transparent", border: `1px solid #2a3942`, color: "#8696A0",
              borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap"
            }}>
              Try sample sale ↗
            </button>
          </div>

          {/* Input */}
          <div style={{ background: "#1F2C34", padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              style={{
                flex: 1, background: "#2A3942", border: "none", borderRadius: 24,
                padding: "10px 16px", color: "#E9EDEF", fontSize: 14, outline: "none"
              }}
            />
            <button onClick={() => handleSend()} style={{
              width: 44, height: 44, borderRadius: "50%", background: GREEN,
              border: "none", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              ➤
            </button>
          </div>
        </>
      )}

      {/* Bottom label */}
      <div style={{ background: "#0B141A", textAlign: "center", padding: "6px", fontSize: 10, color: "#3a4a52" }}>
        PROJECT RETAIN & POWER — Interactive Prototype · June 2026
      </div>
    </div>
  );
}
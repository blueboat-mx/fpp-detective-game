/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================================
   Mascot SVG (선너굴) — placeholder character art.
   Friendly raccoon-like detective. Replace later with provided art.
   ============================================================ */
function MascotSVG({ size = 180, mood = "wave" }) {
  // mood: 'wave' (intro), 'salute' (briefing), 'wink' (closing)
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="msShine" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="100" cy="160" rx="55" ry="22" fill="rgba(11,23,51,0.15)" />
      <path d="M55 120 Q55 175 100 175 Q145 175 145 120 Z" fill="#46474C" />
      <path d="M70 130 Q70 168 100 168 Q130 168 130 130 Z" fill="#DBDCDF" />
      {/* Head */}
      <circle cx="100" cy="90" r="55" fill="#5A5C63" />
      <circle cx="100" cy="92" r="48" fill="#70737C" />
      {/* Ears */}
      <path d="M55 60 L48 35 L75 50 Z" fill="#46474C" />
      <path d="M58 56 L55 42 L70 51 Z" fill="#FFD400" />
      <path d="M145 60 L152 35 L125 50 Z" fill="#46474C" />
      <path d="M142 56 L145 42 L130 51 Z" fill="#FFD400" />
      {/* Detective mask (raccoon mask + sunglasses hint) */}
      <ellipse cx="100" cy="92" rx="40" ry="20" fill="#0B1733" />
      {/* Eyes */}
      <circle cx="85" cy="92" r="9" fill="#fff" />
      <circle cx="115" cy="92" r="9" fill="#fff" />
      {mood === "wink" ? (
        <>
          <circle cx="85" cy="92" r="4" fill="#0B1733" />
          <path d="M108 92 Q115 88 122 92" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="85" cy="93" r="4.2" fill="#0B1733" />
          <circle cx="115" cy="93" r="4.2" fill="#0B1733" />
          <circle cx="86.5" cy="91" r="1.5" fill="#fff" />
          <circle cx="116.5" cy="91" r="1.5" fill="#fff" />
        </>
      )}
      {/* Snout / nose */}
      <ellipse cx="100" cy="110" rx="14" ry="9" fill="#DBDCDF" />
      <ellipse cx="100" cy="105" rx="4" ry="3" fill="#0B1733" />
      <path d="M100 108 Q100 117 95 118 M100 108 Q100 117 105 118" stroke="#0B1733" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Police hat */}
      <path d="M55 65 Q60 35 100 35 Q140 35 145 65 Z" fill="#0B1733" />
      <rect x="55" y="60" width="90" height="10" fill="#0B1733" />
      <rect x="55" y="65" width="90" height="4" fill="#FFD400" />
      <circle cx="100" cy="48" r="6" fill="#FFD400" />
      <text x="100" y="51.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0B1733" fontFamily="ui-monospace, monospace">FPP</text>
      {/* Shine */}
      <ellipse cx="80" cy="70" rx="20" ry="14" fill="url(#msShine)" />
      {/* Wave hand */}
      {mood === "wave" && (
        <g>
          <path d="M150 110 Q170 95 165 75" stroke="#5A5C63" strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="167" cy="72" r="11" fill="#70737C" />
          <circle cx="167" cy="72" r="8" fill="#DBDCDF" />
        </g>
      )}
      {mood === "salute" && (
        <path d="M70 80 L55 60 L65 60" stroke="#5A5C63" strokeWidth="12" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

/* ============================================================
   Top bar: case meta + 6-step progress
   ============================================================ */
const STEPS = [
  { key: "contact",  label: "접선" },
  { key: "rally",    label: "집결" },
  { key: "siteA",    label: "거점A" },
  { key: "siteB",    label: "거점B" },
  { key: "final",    label: "최종" },
  { key: "closed",   label: "종결" },
];

// screenIndex (0..7) -> step key
const SCREEN_TO_STEP = {
  0: "contact",  // intro
  1: "contact",  // mission 0
  2: "rally",    // 집결지
  3: "siteA",    // mission 1
  4: "siteB",    // mission 2
  5: "final",    // 최종 이동
  6: "final",    // final mission
  7: "closed",   // 사건종결
};

function TopBar({ screenIndex, agentName }) {
  const activeKey = SCREEN_TO_STEP[screenIndex];
  const activeIdx = STEPS.findIndex(s => s.key === activeKey);
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="topbar-meta">
          <span className="case-no">사건 №2026-08</span>
          <span className="agent-name">
            {agentName ? `에이전트 ${agentName}` : "환경 비밀수사단"}
          </span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={activeIdx + 1} aria-valuemax={STEPS.length}>
          {STEPS.map((s, i) => {
            const cls = i < activeIdx ? "done" : i === activeIdx ? "active" : "";
            return (
              <div className={`progress-step ${cls}`} key={s.key} style={{ position: "relative" }}>
                <div className="dot" />
                <div className="label">{i < activeIdx ? "✓ " : ""}{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Sequential message thread (chat-style, fade in one-by-one)
   ============================================================ */
function MsgThread({ messages, fromAgent = false }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    let t;
    const tick = (i) => {
      if (i >= messages.length) return;
      setShown(i + 1);
      t = setTimeout(() => tick(i + 1), 600);
    };
    t = setTimeout(() => tick(0), 200);
    return () => clearTimeout(t);
  }, [messages]);

  return (
    <div className="msg-thread">
      {messages.slice(0, shown).map((m, i) => (
        <div className={`msg ${fromAgent ? "from-agent" : ""}`} key={i}>
          {m}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Map card (placeholder map area for ops)
   ============================================================ */
function MapCard({ place, dist }) {
  return (
    <div className="card map-card">
      <div className="map-img">
        <span>지도 영역 · 운영진이 이미지로 교체</span>
        <svg className="map-pin" viewBox="0 0 32 40">
          <path d="M16 0 C7 0 0 7 0 16 C0 26 16 40 16 40 C16 40 32 26 32 16 C32 7 25 0 16 0 Z" fill="#E52222" />
          <circle cx="16" cy="16" r="6" fill="#fff" />
        </svg>
      </div>
      <div className="map-meta">
        <span className="pin-dot" />
        <span className="place">{place}</span>
        <span className="dist">{dist}</span>
      </div>
    </div>
  );
}

/* ============================================================
   Mission box (numbered checklist)
   ============================================================ */
function MissionBox({ title, items, tag = "🎯" }) {
  return (
    <div className="card">
      <div className="card-title">
        <span className="ico">{tag}</span>
        {title}
      </div>
      <ul className="mission-list">
        {items.map((it, i) => (
          <li key={i}>
            <span className="num">{i + 1}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   NPC code input (4 digits)
   ============================================================ */
function NpcCodeInput({ onSubmit, label = "NPC 코드", helper = "NPC에게 단말을 건네주세요" }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const ref = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setVal(v);
    setErr(false);
    if (v.length === 4) {
      setTimeout(() => {
        const ok = onSubmit(v);
        if (!ok) {
          setErr(true);
          setShake(true);
          setTimeout(() => { setShake(false); setVal(""); }, 400);
        }
      }, 100);
    }
  };

  return (
    <div className={`code-input-wrap npc ${shake ? "shake" : ""} ${err ? "error" : ""}`}
         onClick={() => ref.current?.focus()}>
      <div className="code-input-head">
        <span className="icon">🔑</span>
        <span className="label">{label}</span>
        <span className="hint">4자리 숫자</span>
      </div>
      <div className="code-digits">
        {[0,1,2,3].map(i => (
          <div key={i} className={`dgt ${val[i] ? "filled" : ""} ${val.length === i ? "cursor" : ""}`}>
            {val[i] || ""}
          </div>
        ))}
      </div>
      <input
        ref={ref}
        className="code-real"
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        value={val}
        onChange={handleChange}
      />
      <div className={`code-helper ${err ? "error" : ""}`}>
        {err ? "코드가 일치하지 않아. 다시 확인해줘." : helper}
      </div>
    </div>
  );
}

/* ============================================================
   Player code input (word, shown on screen)
   ============================================================ */
function PlayerCodeInput({ expected, onSubmit, label = "출동 코드", visibleHint }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (val.trim().toUpperCase() === expected.toUpperCase()) {
      onSubmit();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className={`code-input-wrap player ${shake ? "shake" : ""} ${err ? "error" : ""}`}>
      <div className="code-input-head">
        <span className="icon">🎫</span>
        <span className="label">{label}</span>
        <span className="hint">단어 입력</span>
      </div>
      {visibleHint && (
        <div style={{ marginBottom: 12, textAlign: "center" }}>
          <span className="visible-code">{visibleHint}</span>
        </div>
      )}
      <input
        className="code-word-input"
        value={val}
        onChange={(e) => { setVal(e.target.value); setErr(false); }}
        placeholder="── 단어 입력 ──"
        autoComplete="off"
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
      />
      <div className={`code-helper ${err ? "error" : ""}`}>
        {err ? "오답이야. 화면 안내를 다시 확인해." : "팀이 직접 입력해."}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={submit}>
        확인
      </button>
    </div>
  );
}

/* ============================================================
   SOS button + modal
   ============================================================ */
function SosButton({ used, onUse }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const click = () => {
    if (used) return;
    setOpen(true);
  };
  const confirm = () => {
    onUse();
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 1500);
  };

  return (
    <>
      <button className="sos-btn" onClick={click} disabled={used}>
        <span className="dot" />
        {used ? "SOS 사용됨" : "SOS 1회권"}
      </button>
      {open && (
        <div className="modal-scrim" onClick={() => !sent && setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {sent ? (
              <>
                <div className="icon-big" style={{ background: "rgba(0,191,64,0.12)", color: "#00BF40" }}>✓</div>
                <h3>본부에 힌트 요청 전송됨</h3>
                <p>잠시 후 선너굴이 단서를 전달할 거야.</p>
              </>
            ) : (
              <>
                <div className="icon-big">!</div>
                <h3>SOS 1회권을 사용할까?</h3>
                <p>본부에 힌트를 요청하면 점수가 일부 차감돼.<br/>한 팀당 한 번만 쓸 수 있어.</p>
                <div className="row">
                  <button className="btn btn-ghost" onClick={() => setOpen(false)}>취소</button>
                  <button className="btn btn-primary" style={{ background: "var(--danger)" }} onClick={confirm}>
                    힌트 요청
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   Floating mascot + bubble
   ============================================================ */
function MascotFloat({ line, mood = "wave" }) {
  return (
    <div className="mascot-float">
      <div className="bubble">{line}</div>
      <div className="figure">
        <MascotSVG size={56} mood={mood} />
      </div>
    </div>
  );
}

/* Expose to window for sibling babel files */
Object.assign(window, {
  MascotSVG, TopBar, MsgThread, MapCard, MissionBox,
  NpcCodeInput, PlayerCodeInput, SosButton, MascotFloat,
  STEPS, SCREEN_TO_STEP,
});

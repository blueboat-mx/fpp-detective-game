/* global React, MascotSVG, TopBar, MsgThread, MapCard, MissionBox,
          NpcCodeInput, PlayerCodeInput, SosButton, MascotFloat */
const { useState, useEffect, useRef } = React;

/* ============================================================
   OPERATIONAL CONSTANTS — edit these freely.
   Codes can be changed by 운영진 without touching markup.
   ============================================================ */
const CODES = {
  mission0_npc:    "1492",   // 요원 K
  rally_word:      "출동",    // 집결지 출동 코드 (화면에 노출)
  mission1_npc:    "7308",   // 정보원 J/H
  mission2_npc:    "5160",   // 정보원 S/M
  finalTravel_npc: "2025",   // 본부장 T (최종 목적지)
};

const COPY = {
  intro: [
    "드디어 만났네요!",
    "안녕, 신입 에이전트. 나는 선너굴 — 환경 비밀수사단 본부의 비서야. 너구리처럼 보이지만 너구리는 아니야. 그건 천천히 말해줄게.",
    "지금 건대 일대에 비상 첩보가 들어왔어. 누군가 우리 바다를 망가뜨리려는 작전을 실행 중이래.",
    "단서는 거리에 흩어져 있고, 동료 수사관들이 너를 기다리고 있어.",
    "본격적으로 시작하기 전에 — 너의 코드네임을 알려줘. 한 번 등록되면 오늘 하루 이걸로 불릴 거야.",
  ],
  m0: (name) => [
    `에이전트 ${name}, 임명 완료.`,
    "첫 번째 미션은 간단해. 하지만 들키면 안 돼.",
    "본부 위치는 절대 노출되면 안 되니까, 우리는 ‘접선책’을 통해서만 너에게 좌표를 전달해.",
    "아래 주소로 가면 우리 요원이 평범한 시민인 척 너를 기다리고 있을 거야.",
  ],
  rally: (name) => [
    "본부 진입 성공!",
    `잘 왔어, 에이전트 ${name}. 여기서부터는 혼자가 아니라 팀으로 움직여야 해. 작전이 거대하거든.`,
  ],
  m1: [
    "이곳에서 우리 정보원 두 명이 너희를 기다리고 있어. 하지만 그냥 만나주진 않아. 수사관의 자격을 증명해야 해.",
  ],
  m2: [
    "첫 단서만으론 부족해. 두 번째 거점에서 더 깊이 파봐야 해.",
  ],
  finalTravel: [
    "마지막 여정이야.",
    "지금까지 너희는 단서 두 조각을 모았어. 하지만 그중 하나는 거짓일 수 있어.",
    "가는 길에 팀과 함께 정리해 봐. 도착해서 본부장 T를 만나면, 마지막 단계로 넘어갈 수 있어.",
  ],
  finalMission: [
    "여기까지 왔구나, 에이전트들.",
    "이제 마지막 단계야. 너희가 추적한 범인의 정체를 — 모두에게 보여줘야 해.",
  ],
  closing: (name) => [
    `에이전트 ${name} — 그리고 모든 동료 수사단.`,
    "너희가 해냈어.",
  ],
  closingPart2: [
    "별거 아닌 것 같지? 하나하나는 작아. 하지만 너희가 오늘 두 시간 동안 거리에서 이만큼을 주웠어. 이게 매일, 도시 전체에서 쌓이고 있어. 그리고 그 끝은 — 바다야.",
    "진짜 첩자는 ‘편리함’이라는 이름의 습관이었을지도 몰라.",
  ],
  closingMascot: "오늘 너희는 수사관 흉내를 낸 게 아니라, 진짜로 한 도시의 흔적을 바꿨어. 다음 사건에서 또 보자, 에이전트.",
};

const FLOAT_LINES = [
  "단서는 거리에 있어. 잘 살펴.",                    // 0 intro
  "자연스럽게 — 시민인 척 행동해.",                   // 1 mission 0
  "팀이 모였으면 본부 NPC를 찾아.",                  // 2 rally
  "정보원 둘 중 하나는 첩자일지도?",                 // 3 mission 1
  "도감 9칸 — 다양하게 모아봐.",                     // 4 mission 2
  "단서 둘을 비교해. 누가 거짓말쟁이지?",            // 5 final travel
  "정크아트는 추리의 답안지야.",                     // 6 final mission
  "오늘도 수고했어, 에이전트.",                       // 7 closing
];

/* ============================================================
   Storage helpers
   ============================================================ */
const STORE = "susadan-state-v1";
function loadState() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { screen: 0, agentName: "", sosUsed: false };
}
function saveState(s) {
  try { localStorage.setItem(STORE, JSON.stringify(s)); } catch {}
}

/* ============================================================
   Screens
   ============================================================ */

function ScreenIntro({ onSubmit }) {
  const [name, setName] = useState("");
  return (
    <div className="screen">
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <MascotSVG size={180} mood="wave" />
      </div>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span className="mission-tag"><span className="pin" /> INTEL · HQ</span>
      </div>
      <h1 className="screen-title" style={{ textAlign: "center" }}>
        <span className="yellow">선너굴</span>의 첫 인사
      </h1>
      <MsgThread messages={COPY.intro} />

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title"><span className="ico">①</span> 코드네임 등록</div>
        <div className="field">
          <input
            className="field-input"
            placeholder="예) 햇살, 김탐정, 라쿤02"
            value={name}
            maxLength={12}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSubmit(name.trim()); }}
          />
          <div style={{ fontSize: 12, color: "var(--case-navy-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            * 한 번 등록되면 오늘 하루 이 이름으로 불립니다.
          </div>
        </div>
      </div>

      <div className="cta-dock">
        <button
          className="btn btn-primary"
          disabled={!name.trim()}
          onClick={() => onSubmit(name.trim())}
        >
          임명장 받기 →
        </button>
      </div>
    </div>
  );
}

function ScreenMission0({ name, onPass }) {
  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span className="mission-tag"><span className="pin" /> MISSION 0 · CONTACT</span>
      </div>
      <h1 className="screen-title">접선책을 <span className="yellow">찾아라</span></h1>
      <div className="screen-sub">CONTACT · DO NOT BE SEEN</div>

      <MsgThread messages={COPY.m0(name)} />

      <MapCard place="화양공원 입구" dist="도보 약 6분" />

      <MissionBox
        title="MISSION 0"
        items={[
          "접선책 ‘요원 K’ 찾아내기",
          "이 화면을 보여주고 신원 확인 받기",
          "요원 K가 알려주는 본부 출입 코드 입력하기",
        ]}
      />

      <div className="warn-box">
        <div className="h">⚠ 행동 수칙</div>
        주변 시민에게 정체를 들키지 마. 자연스럽게 행동해.
      </div>

      <div style={{ marginTop: 16 }}>
        <NpcCodeInput
          label="NPC 코드 · 요원 K"
          helper="NPC에게 단말을 건네주세요"
          onSubmit={(v) => v === CODES.mission0_npc && (onPass(), true)}
        />
      </div>
    </div>
  );
}

function ScreenRally({ name, onPass }) {
  return (
    <div className="screen">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="mission-tag" style={{ background: "var(--ok)", color: "#fff" }}>
          <span className="pin" style={{ background: "#fff", boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }} />
          HQ · BREACH SUCCESS
        </span>
      </div>
      <h1 className="screen-title">집결지 <span className="yellow">브리핑</span></h1>
      <div className="screen-sub">HQ BRIEFING · {`AGENT ${name?.toUpperCase() || ""}`}</div>

      <MsgThread messages={COPY.rally(name)} />

      <div className="brief-box">
        <div className="h">작전 개요</div>
        누군가 건대 일대에 ‘바다를 위협하는 무언가’를 흘리고 있어. 정체는 아직 몰라. 단서는 거리 곳곳의 쓰레기 속에 숨어있고, 우리는 두 곳의 거점을 돌며 단서를 모은 다음, 최종 지점에서 범인을 특정해야 해.
      </div>

      <div className="warn-box">
        <div className="h">💡 명심할 것</div>
        <div style={{ display: "grid", gap: 6 }}>
          <div>· 거리의 쓰레기 = 증거. 게으르게 지나치지 마.</div>
          <div>· 각 거점에는 통행료가 있어. 쓰레기 봉투를 제출해야 입장 가능.</div>
          <div>· NPC 요원 중에는 너희를 시험하려는 자도 있을 거야. 누굴 믿을지는 너희 판단.</div>
        </div>
      </div>

      <MissionBox
        title="집결지 미션"
        items={[
          "팀장 1명 선출 (작전 지휘 및 최종 의사결정)",
          "팀 오픈채팅방 개설 (선너굴이 SOS 받을 채널)",
          "모든 준비가 끝나면 본부 NPC ‘수사관 P’에게 신고",
        ]}
      />

      <PlayerCodeInput
        label="출동 코드"
        expected={CODES.rally_word}
        onSubmit={onPass}
        visibleHint={CODES.rally_word}
      />
    </div>
  );
}

function ScreenMission1({ onPass }) {
  return (
    <div className="screen">
      <span className="mission-tag"><span className="pin" /> MISSION 1 · SITE A</span>
      <h1 className="screen-title">자격을 <span className="yellow">증명하라</span></h1>
      <div className="screen-sub">SITE A · CREDENTIAL CHECK</div>

      <MapCard place="햇님 어린이공원" dist="도보 약 12분" />

      <MsgThread messages={COPY.m1} />

      <MissionBox
        title="MISSION 1 — 자격 증명"
        items={[
          "통행료: 팀당 쓰레기 봉투 2개 이상 채우기",
          "NPC에게 봉투 보여주고 체크 받기",
          "NPC가 내는 퀴즈 통과하기",
          "정보원 J / 정보원 H 중 한 명 선택 → 단서 한 조각 확보",
        ]}
      />

      <div className="sub-box">
        <span className="badge-bonus">BONUS</span>
        <div className="h">🎁 SUB · 수사 인증샷</div>
        <p>팀원 전원 얼굴이 나오게 단체사진 찍기. 컨셉은 자유! 예) “용의자 검거 직후 포즈”, “증거를 분석하는 포즈”.</p>
        <div className="reward">🥤 운영진에게 보여주면 음료수 지급</div>
      </div>

      <div className="danger-box">
        <div className="h">⚠ 거짓 정보원 경고</div>
        모든 정보원이 진실을 말하는 건 아니야. <strong>너희가 만날 4명의 정보원 중 1명은 적의 첩자다.</strong> 누굴 믿을지 잘 골라.
      </div>

      <NpcCodeInput
        label="NPC 코드 · 정보원"
        onSubmit={(v) => v === CODES.mission1_npc && (onPass(), true)}
      />
    </div>
  );
}

function ScreenMission2({ onPass }) {
  const ITEMS = [
    "페트병", "일반 종이", "캔류",
    "비닐봉지", "담배꽁초", "유리병",
    "일회용컵", "배달용기", "복합쓰레기",
  ];
  return (
    <div className="screen">
      <span className="mission-tag"><span className="pin" /> MISSION 2 · SITE B</span>
      <h1 className="screen-title">증거를 <span className="yellow">분류하라</span></h1>
      <div className="screen-sub">SITE B · CATALOGUE EVIDENCE</div>

      <MapCard place="노유산공원" dist="도보 약 9분" />

      <MsgThread messages={COPY.m2} />

      <MissionBox
        title="MISSION 2 — 증거 분류"
        items={[
          "통행료: 팀당 쓰레기 봉투 5개 이상 누적 (지금까지 주운 것 포함)",
          "쓰레기 품목 도감 9종 사진 인증 (실물 사진)",
          "NPC에게 보여주고 퀴즈 통과",
          "정보원 S / 정보원 M 중 한 명 선택 → 두 번째 단서 획득",
        ]}
      />

      <div className="card">
        <div className="card-title">
          <span className="ico">🗂</span>
          쓰레기 품목 도감
        </div>
        <div style={{ fontSize: 13, color: "var(--case-navy-3)", marginBottom: 4 }}>
          9종을 직접 사진으로 모아 NPC에게 제시.
        </div>
        <div className="codex-grid">
          {ITEMS.map((it, i) => (
            <div className="codex-cell" key={i}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              {it}
            </div>
          ))}
        </div>
      </div>

      <div className="sub-box">
        <span className="badge-bonus">BONUS</span>
        <div className="h">🎁 SUB · 수사 인증샷 #2</div>
        <p>이번엔 다른 컨셉으로 — 자유롭게 단체사진. 첫 거점과 다른 포즈/구도면 가산점!</p>
        <div className="reward">🥤 운영진에게 보여주면 음료수 지급</div>
      </div>

      <div className="danger-box">
        <div className="h">⚠ 거짓 정보원 추적</div>
        잊지 마. 너희가 첫 거점에서 만난 정보원 + 여기서 만나는 정보원, <strong>총 4명 중 1명은 거짓을 말한다.</strong> 단서를 비교하면서 누가 거짓말쟁이인지 추적해.
      </div>

      <NpcCodeInput
        label="NPC 코드 · 정보원"
        onSubmit={(v) => v === CODES.mission2_npc && (onPass(), true)}
      />
    </div>
  );
}

function ScreenFinalTravel({ onPass }) {
  return (
    <div className="screen">
      <span className="mission-tag" style={{ background: "var(--danger)" }}>
        <span className="pin" style={{ background: "#fff" }} />
        FINAL DESTINATION
      </span>
      <h1 className="screen-title">단서를 <span className="yellow">대조하라</span></h1>
      <div className="screen-sub">FINAL APPROACH · 진짜 범인은 누구인가</div>

      <MapCard place="노룬산공원" dist="도보 약 14분" />

      <MsgThread messages={COPY.finalTravel.slice(0, 2)} />

      <div className="question-box">
        <div className="q"><span className="qmark">Q1.</span><span>어느 정보원을 믿을 것인가?</span></div>
        <div className="q"><span className="qmark">Q2.</span><span>단서들이 가리키는 진짜 범인은 누구인가?</span></div>
        <div className="q"><span className="qmark">Q3.</span><span>우리 바다를 위협하는 그것의 정체는?</span></div>
      </div>

      <MsgThread messages={COPY.finalTravel.slice(2)} />

      <NpcCodeInput
        label="NPC 코드 · 본부장 T"
        helper="도착 후 본부장 T에게 단말을 건네주세요"
        onSubmit={(v) => v === CODES.finalTravel_npc && (onPass(), true)}
      />
    </div>
  );
}

function ScreenFinalMission({ onPass }) {
  return (
    <div className="screen">
      <span className="mission-tag" style={{ background: "var(--danger)" }}>
        <span className="pin" style={{ background: "var(--tape-yellow)" }} />
        FINAL MISSION · RECONSTRUCT
      </span>
      <h1 className="screen-title">정크아트로 <span className="yellow">범인을 그려라</span></h1>
      <div className="screen-sub">RECONSTRUCT · 추리는 작품에 드러난다</div>

      <MsgThread messages={COPY.finalMission} />

      <div className="card" style={{ background: "var(--case-navy)", color: "#fff", borderColor: "transparent" }}>
        <div className="card-title" style={{ color: "var(--tape-yellow)" }}>
          <span className="ico" style={{ background: "var(--tape-yellow)", color: "var(--case-navy)" }}>🎯</span>
          FINAL MISSION
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
          지금까지 주운 쓰레기로, 너희가 지목한 범인의 형상을 <strong style={{ color: "var(--tape-yellow)" }}>정크아트</strong>로 만들어.
          <br/><br/>이건 단순한 만들기가 아니야. <strong>너희의 추리가 맞았는지 틀렸는지가 작품에 드러나.</strong>
        </p>
      </div>

      <div className="danger-box">
        <div className="h">💀 충격 첩보</div>
        너희가 만난 4명의 정보원 중 <strong>1명은 적의 첩자였다.</strong> 그자가 흘린 거짓 단서를 믿고 만든 작품은 — 빗나간 작품이 될 거야.
      </div>

      <div className="strategy-grid">
        <div className="strategy-card coop">
          <div className="h">🤝 연합 OK</div>
          다른 팀과 단서를 비교/교환해도 좋아. 함께 진실에 다가갈 수 있어.
        </div>
        <div className="strategy-card solo">
          <div className="h">😈 단독 OK</div>
          단서를 숨기거나, 일부러 거짓 정보를 흘려도 좋아. 이건 첩보전이기도 하니까.
        </div>
      </div>

      <div className="warn-box">
        <div className="h">⏱ 안내</div>
        정크아트 완성 후 본부장 T에게 보여주면 사건이 종결돼. (별도 타이머 없음 — 운영진이 현장에서 시간 관리)
      </div>

      <div className="cta-dock">
        <button className="btn btn-secondary" onClick={onPass}>
          작품 제출 · 사건 종결로 →
        </button>
      </div>
    </div>
  );
}

function ScreenClosing({ name }) {
  return (
    <div className="screen">
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <span className="stamp">사건 종결</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <MascotSVG size={150} mood="wink" />
      </div>

      <h1 className="screen-title" style={{ textAlign: "center", fontSize: 26 }}>
        사건 №2026-08, <span className="yellow">종결</span>.
      </h1>
      <div className="screen-sub" style={{ textAlign: "center" }}>CASE CLOSED · 2026-08</div>

      <MsgThread messages={COPY.closing(name)} />

      <div className="reveal-box">
        <div className="h">진범</div>
        <div className="culprit">
          <span className="culprit-placeholder">[현장 발표]</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: "var(--case-navy-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
          본부장 T가 현장에서 직접 발표
        </div>
      </div>

      <MsgThread messages={COPY.closingPart2} />

      <div className="card" style={{ background: "var(--case-navy)", color: "#fff", borderColor: "transparent" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flexShrink: 0 }}>
            <MascotSVG size={48} mood="wink" />
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{COPY.closingMascot}</div>
        </div>
      </div>

      <div className="trophy-box">
        <span className="ico">🏆</span>
        <span><strong>결과 발표 &amp; 수사관 임명장 수여</strong>는 현장에서 진행돼.</span>
      </div>
    </div>
  );
}

/* ============================================================
   Main App — state machine + Tweaks panel
   ============================================================ */
function App() {
  const init = loadState();
  const [screen, setScreen] = useState(init.screen);
  const [agentName, setAgentName] = useState(init.agentName);
  const [sosUsed, setSosUsed] = useState(init.sosUsed);
  const scrollRef = useRef(null);

  useEffect(() => {
    saveState({ screen, agentName, sosUsed });
  }, [screen, agentName, sosUsed]);

  // Scroll to top on screen change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [screen]);

  const goNext = () => setScreen((s) => Math.min(7, s + 1));

  const reset = () => {
    if (confirm("진행 상태를 초기화하고 처음으로 돌아갈까?")) {
      localStorage.removeItem(STORE);
      setScreen(0); setAgentName(""); setSosUsed(false);
    }
  };

  const onIntroSubmit = (name) => {
    setAgentName(name);
    goNext();
  };

  const showSos = screen >= 3 && screen <= 6;
  const showMascot = screen !== 0 && screen !== 7;

  return (
    <div className="phone-shell" data-screen-label={`Screen ${screen + 1}`}>
      <div className="phone-scroll" ref={scrollRef}>
        <TopBar screenIndex={screen} agentName={agentName} />
        {showSos && <SosButton used={sosUsed} onUse={() => setSosUsed(true)} />}

        {screen === 0 && <ScreenIntro onSubmit={onIntroSubmit} />}
        {screen === 1 && <ScreenMission0 name={agentName} onPass={goNext} />}
        {screen === 2 && <ScreenRally name={agentName} onPass={goNext} />}
        {screen === 3 && <ScreenMission1 onPass={goNext} />}
        {screen === 4 && <ScreenMission2 onPass={goNext} />}
        {screen === 5 && <ScreenFinalTravel onPass={goNext} />}
        {screen === 6 && <ScreenFinalMission onPass={goNext} />}
        {screen === 7 && <ScreenClosing name={agentName} />}
      </div>

      {showMascot && <MascotFloat line={FLOAT_LINES[screen]} mood={screen >= 6 ? "salute" : "wave"} />}

      {/* Dev / 운영 navigator — visible by default for review */}
      <DevNav screen={screen} setScreen={setScreen} reset={reset} />
    </div>
  );
}

/* Small floating screen-jump for review (for 운영진 / designer) */
function DevNav({ screen, setScreen, reset }) {
  const [open, setOpen] = useState(false);
  const SCREENS = ["인트로", "M0 접선", "집결지", "M1 거점A", "M2 거점B", "최종이동", "최종미션", "사건종결"];
  return (
    <div style={{
      position: "absolute",
      left: 12,
      bottom: 16,
      zIndex: 29,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "rgba(11,23,51,0.92)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "7px 11px",
          borderRadius: 999,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 16px -6px rgba(0,0,0,0.4)",
        }}>
        {open ? "✕ 닫기" : "☰ 운영 패널"}
      </button>
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: 0,
          background: "#fff",
          border: "1px solid var(--paper-line)",
          borderRadius: 12,
          padding: 10,
          width: 200,
          boxShadow: "0 14px 36px -12px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.16em", color: "var(--case-navy-3)", marginBottom: 6 }}>
            화면 점프 (검수용)
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {SCREENS.map((s, i) => (
              <button key={i} onClick={() => { setScreen(i); setOpen(false); }}
                style={{
                  textAlign: "left",
                  background: i === screen ? "var(--fpp-blue)" : "transparent",
                  color: i === screen ? "#fff" : "var(--case-navy)",
                  border: "1px solid var(--paper-line)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>
                {String(i).padStart(2, "0")} · {s}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.16em", color: "var(--case-navy-3)", margin: "10px 0 4px" }}>
            정답 코드
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.6, color: "var(--case-navy)", fontFamily: "var(--font-mono)" }}>
            <div>M0 NPC · {CODES.mission0_npc}</div>
            <div>집결 단어 · {CODES.rally_word}</div>
            <div>M1 NPC · {CODES.mission1_npc}</div>
            <div>M2 NPC · {CODES.mission2_npc}</div>
            <div>최종 NPC · {CODES.finalTravel_npc}</div>
          </div>
          <button onClick={reset}
            style={{
              marginTop: 10, width: "100%",
              background: "transparent",
              color: "var(--danger)",
              border: "1px dashed var(--danger)",
              borderRadius: 6,
              padding: "6px 8px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}>
            진행 상태 초기화
          </button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

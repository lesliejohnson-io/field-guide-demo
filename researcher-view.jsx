// Researcher tablet — audit panel, fatigue flags, agent decisions log
// Depends on: React, survey-data.js

function Sparkline({ data, dark, threshold = 0.6 }) {
  const W = 200, H = 40;
  if (data.length < 2) return <div style={{ width: W, height: H }} />;
  const max = 1, min = 0;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaD = d + ` L${W},${H} L0,${H} Z`;
  const thresholdY = H - threshold * H;
  const stroke = data[data.length - 1] > threshold
    ? (dark ? 'var(--yellow-400)' : 'var(--yellow-600)')
    : (dark ? 'var(--cyan-400)' : 'var(--cyan-700)');
  const fill = data[data.length - 1] > threshold
    ? (dark ? 'rgba(233,185,73,0.12)' : 'rgba(233,185,73,0.10)')
    : (dark ? 'rgba(56,190,201,0.12)' : 'rgba(14,124,134,0.08)');
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <line x1="0" y1={thresholdY} x2={W} y2={thresholdY}
        stroke={dark ? 'rgba(255,255,255,0.14)' : 'var(--neutral-200)'} strokeWidth="1" strokeDasharray="2 3" />
      <path d={areaD} fill={fill} />
      <path d={d} stroke={stroke} strokeWidth="1.75" fill="none" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={stroke} />
    </svg>
  );
}

function StatPill({ label, value, sub, tone = 'neutral', dark }) {
  const toneMap = dark ? {
    neutral: { bg: 'rgba(255,255,255,0.04)', fg: 'rgba(255,255,255,0.92)', accent: 'rgba(255,255,255,0.5)' },
    warn:    { bg: 'rgba(233,185,73,0.12)',  fg: 'var(--yellow-300)',     accent: 'var(--yellow-400)' },
    good:    { bg: 'rgba(56,190,201,0.12)',  fg: 'var(--cyan-200)',       accent: 'var(--cyan-400)' },
  } : {
    neutral: { bg: '#fff',               fg: 'var(--text-primary)',  accent: 'var(--text-muted)' },
    warn:    { bg: 'var(--yellow-50)',   fg: 'var(--yellow-900)',    accent: 'var(--yellow-700)' },
    good:    { bg: 'var(--cyan-50)',     fg: 'var(--cyan-900)',      accent: 'var(--cyan-700)' },
  };
  const t = toneMap[tone];
  const border = dark ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)';
  return (
    <div style={{
      background: t.bg, border: `1px solid ${border}`,
      borderRadius: 12, padding: '14px 16px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: t.accent, fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
        color: t.fg, lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {sub && <div style={{
        fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)',
        lineHeight: 1.3,
      }}>{sub}</div>}
    </div>
  );
}

function LogEntry({ entry, dark }) {
  // kind: info | fatigue | voice | rewrite | break | answer | transition
  const kinds = dark ? {
    info:       { dot: 'rgba(255,255,255,0.3)', tag: 'rgba(255,255,255,0.45)', label: 'INFO' },
    answer:     { dot: 'rgba(255,255,255,0.35)', tag: 'rgba(255,255,255,0.5)', label: 'ANSWER' },
    fatigue:    { dot: 'var(--yellow-400)',      tag: 'var(--yellow-300)',    label: 'FATIGUE' },
    voice:      { dot: 'var(--cyan-400)',        tag: 'var(--cyan-300)',      label: 'VOICE' },
    rewrite:    { dot: 'var(--cyan-400)',        tag: 'var(--cyan-300)',      label: 'REWRITE' },
    break:      { dot: 'var(--teal-400)',        tag: 'var(--teal-300)',      label: 'BREAK' },
    transition: { dot: 'var(--blue-400)',        tag: 'var(--blue-300)',      label: 'TRANSITION' },
  } : {
    info:       { dot: 'var(--neutral-400)', tag: 'var(--text-muted)',   label: 'INFO' },
    answer:     { dot: 'var(--neutral-500)', tag: 'var(--neutral-700)',  label: 'ANSWER' },
    fatigue:    { dot: 'var(--yellow-600)',  tag: 'var(--yellow-800)',   label: 'FATIGUE' },
    voice:      { dot: 'var(--cyan-700)',    tag: 'var(--cyan-800)',     label: 'VOICE' },
    rewrite:    { dot: 'var(--cyan-700)',    tag: 'var(--cyan-800)',     label: 'REWRITE' },
    break:      { dot: 'var(--teal-700)',    tag: 'var(--teal-800)',     label: 'BREAK' },
    transition: { dot: 'var(--blue-700)',    tag: 'var(--blue-800)',     label: 'TRANSITION' },
  };
  const k = kinds[entry.kind] || kinds.info;
  const border = dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)';
  const body = dark ? 'rgba(255,255,255,0.82)' : 'var(--text-primary)';
  const muted = dark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)';
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${border}`,
      animation: entry.fresh ? 'fgLogIn 0.6s cubic-bezier(0.22,1,0.36,1)' : 'none',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color: muted,
        fontVariantNumeric: 'tabular-nums',
        paddingTop: 2, width: 52, flex: 'none',
      }}>{entry.time}</div>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: k.dot, marginTop: 7, flex: 'none' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5, letterSpacing: '0.12em', fontWeight: 700,
            color: k.tag,
          }}>{k.label}</span>
          {entry.auto && <span style={{
            fontSize: 10, color: muted, fontStyle: 'italic',
          }}>· agent decision</span>}
        </div>
        <div style={{ fontSize: 13, color: body, lineHeight: 1.4 }}>{entry.text}</div>
        {entry.reason && (
          <div style={{
            fontSize: 12, color: muted, marginTop: 4, lineHeight: 1.4,
            paddingLeft: 10, borderLeft: `2px solid ${border}`,
          }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.7 }}>reason ·</span> {entry.reason}
          </div>
        )}
      </div>
    </div>
  );
}

function ResearcherView({ dark, state, onOverride }) {
  const { fatigueScore, fatigueHistory, log, answers, voiceId, tier,
          questionIndex, totalQuestions, flags, sessionMin, pace } = state;

  const bg = dark ? '#0d0c0a' : 'var(--neutral-50)';
  const fg = dark ? 'rgba(255,255,255,0.92)' : 'var(--text-primary)';
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)';
  const voice = FG_VOICES.find(v => v.id === voiceId);

  const answered = Object.keys(answers).length;
  const progressPct = Math.round((questionIndex / totalQuestions) * 100);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg, color: fg,
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: 'background 0.6s, color 0.6s',
      overflow: 'hidden',
    }}>
      {/* Left: session summary */}
      <aside style={{
        borderRight: `1px solid ${border}`,
        padding: '22px 22px 20px',
        display: 'flex', flexDirection: 'column', gap: 18,
        overflow: 'auto',
      }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: muted, fontWeight: 600, marginBottom: 4,
          }}>Researcher · Session</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
            FG-0428 · Adult survey
          </div>
          <div style={{ fontSize: 12.5, color: muted, marginTop: 4 }}>
            Participant #7412 · started {sessionMin}m ago
          </div>
        </div>

        <div style={{
          background: card, border: `1px solid ${border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 6,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: muted, fontWeight: 600,
            }}>Progress</div>
            <div style={{
              fontSize: 12, color: muted, fontVariantNumeric: 'tabular-nums',
            }}>Q{questionIndex + 1} / {totalQuestions}</div>
          </div>
          <div style={{
            height: 4, background: dark ? 'rgba(255,255,255,0.06)' : 'var(--neutral-100)',
            borderRadius: 2, overflow: 'hidden', marginBottom: 10,
          }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: dark ? 'var(--cyan-400)' : 'var(--cyan-600)',
              borderRadius: 2, transition: 'width 0.5s',
            }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {progressPct}<span style={{ fontSize: 14, color: muted, fontWeight: 500 }}>%</span>
            <span style={{ fontSize: 12, color: muted, marginLeft: 10, fontWeight: 500 }}>
              · {answered} answered
            </span>
          </div>
        </div>

        <div style={{
          background: card, border: `1px solid ${border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 8,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: fatigueScore > 0.6 ? (dark ? 'var(--yellow-300)' : 'var(--yellow-800)') : muted,
              fontWeight: 600,
            }}>Fatigue signal</div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: fatigueScore > 0.6
                ? (dark ? 'var(--yellow-300)' : 'var(--yellow-700)')
                : (dark ? 'var(--cyan-300)' : 'var(--cyan-700)'),
              fontVariantNumeric: 'tabular-nums',
            }}>{Math.round(fatigueScore * 100)}</div>
          </div>
          <Sparkline data={fatigueHistory} dark={dark} />
          <div style={{ fontSize: 12, color: muted, marginTop: 4, lineHeight: 1.4 }}>
            {fatigueScore > 0.6
              ? 'Uniform answer cadence detected past the 34% threshold.'
              : 'Response pattern looks varied. Nothing to flag.'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatPill label="Pace" value={pace.toFixed(1) + 's'} sub="avg / answer" dark={dark}
            tone={pace < 2.0 ? 'warn' : 'neutral'} />
          <StatPill label="Flags" value={flags.length} sub={flags.length ? 'open' : 'none open'}
            tone={flags.length ? 'warn' : 'neutral'} dark={dark} />
        </div>

        <div style={{
          background: card, border: `1px solid ${border}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: muted, fontWeight: 600, marginBottom: 10,
          }}>Active state</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: dark ? 'rgba(56,190,201,0.25)' : 'var(--cyan-100)',
              color: dark ? 'var(--cyan-200)' : 'var(--cyan-800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 11,
            }}>{voice.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{voice.name}</div>
              <div style={{ fontSize: 11.5, color: muted }}>{voice.accent} · {voice.tone}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={pillStyle(dark, 'neutral')}>Reading · {tier}</span>
            <span style={pillStyle(dark, 'neutral')}>EN · en-US</span>
            <span style={pillStyle(dark, 'good')}>Headphones ✓</span>
            <span style={pillStyle(dark, 'good')}>Offline cache ✓</span>
          </div>
        </div>

        <button onClick={onOverride} style={{
          font: 'inherit', fontSize: 13, fontWeight: 500,
          padding: '10px 14px', borderRadius: 8,
          background: 'transparent', color: muted,
          border: `1px dashed ${border}`, cursor: 'pointer',
          textAlign: 'left', lineHeight: 1.3,
        }}>
          Flag this response for follow-up →
        </button>
      </aside>

      {/* Right: audit log */}
      <main style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '22px 28px 14px',
          borderBottom: `1px solid ${border}`,
        }}>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: muted, fontWeight: 600, marginBottom: 2,
            }}>Audit trail</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>
              Every agent decision, timestamped
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Decisions', 'Fatigue', 'Answers'].map((label, i) => (
              <button key={label} style={{
                font: 'inherit', fontSize: 12, fontWeight: 500,
                padding: '7px 12px', borderRadius: 8,
                background: i === 0 ? (dark ? 'rgba(255,255,255,0.08)' : 'var(--neutral-100)') : 'transparent',
                color: fg, border: `1px solid ${border}`, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{
          flex: 1, overflow: 'auto',
          padding: '8px 28px 24px',
        }}>
          {log.length === 0 && (
            <div style={{
              color: muted, fontSize: 13, padding: '40px 0', textAlign: 'center',
            }}>No events yet.</div>
          )}
          {log.map((e, i) => <LogEntry key={e.id} entry={e} dark={dark} />)}
        </div>
      </main>
    </div>
  );
}

function pillStyle(dark, tone) {
  const bg = dark ? {
    neutral: 'rgba(255,255,255,0.05)', good: 'rgba(56,190,201,0.12)',
  } : { neutral: 'var(--neutral-50)', good: 'var(--teal-50)' };
  const color = dark ? {
    neutral: 'rgba(255,255,255,0.7)', good: 'var(--cyan-200)',
  } : { neutral: 'var(--neutral-700)', good: 'var(--teal-800)' };
  return {
    fontSize: 11, fontWeight: 500,
    padding: '4px 9px', borderRadius: 999,
    background: bg[tone], color: color[tone],
    fontFamily: tone === 'neutral' ? "'JetBrains Mono', monospace" : 'inherit',
    letterSpacing: tone === 'neutral' ? '0.04em' : 0,
  };
}

window.ResearcherView = ResearcherView;

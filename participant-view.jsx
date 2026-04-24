// Participant tablet — active survey screen
// Depends on: React, survey-data.js (FG_QUESTIONS, FG_LIKERT, FG_VOICES)

function Waveform({ active, dark }) {
  // 18 bars, animated with staggered delays. Pauses when not active.
  const bars = Array.from({ length: 18 });
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3, height: 36,
    }}>
      {bars.map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: active
            ? (dark ? 'var(--cyan-300)' : 'var(--cyan-700)')
            : (dark ? 'rgba(255,255,255,0.18)' : 'var(--neutral-200)'),
          animation: active ? `fgWave 1.1s ${i * 0.06}s ease-in-out infinite` : 'none',
          height: active ? undefined : 6,
          transition: 'background 0.4s',
        }} />
      ))}
    </div>
  );
}

function LikertRow({ selected, onPick, answers, dark, tier, fast }) {
  // tier controls size/spacing. "simple" → bigger buttons.
  const padY = tier === 'simple' ? 28 : tier === 'easy' ? 24 : 22;
  return (
    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
      {FG_LIKERT.map((opt, i) => {
        const isSel = selected === opt.key;
        const emphasis = i === 0 || i === FG_LIKERT.length - 1;
        return (
          <button
            key={opt.key}
            onClick={() => onPick(opt.key)}
            style={{
              flex: 1, minHeight: 0,
              padding: `${padY}px 14px`,
              fontFamily: 'inherit',
              fontSize: tier === 'simple' ? 22 : 19,
              fontWeight: 500, letterSpacing: '-0.005em',
              lineHeight: 1.25,
              borderRadius: 14,
              border: `1.5px solid ${isSel
                ? (dark ? 'var(--cyan-300)' : 'var(--cyan-700)')
                : (dark ? 'rgba(255,255,255,0.14)' : 'var(--neutral-200)')}`,
              background: isSel
                ? (dark ? 'rgba(56,190,201,0.18)' : 'var(--cyan-50)')
                : (dark ? 'rgba(255,255,255,0.03)' : '#fff'),
              color: isSel
                ? (dark ? 'var(--cyan-100)' : 'var(--cyan-900)')
                : (dark ? 'rgba(255,255,255,0.85)' : 'var(--text-primary)'),
              cursor: 'pointer',
              transition: fast ? 'all 0.08s' : 'all 0.2s',
              textAlign: 'center',
              boxShadow: isSel ? (dark ? 'none' : '0 1px 0 rgba(14,124,134,0.08)') : 'none',
            }}
          >
            <div style={{
              fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: isSel
                ? (dark ? 'var(--cyan-300)' : 'var(--cyan-700)')
                : (dark ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)'),
              fontWeight: 600, marginBottom: 8,
            }}>
              {emphasis ? (i === 0 ? '— —' : '+ +') : (i === 2 ? '·' : (i < 2 ? '—' : '+'))}
            </div>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function AdaptiveToast({ show, text, onDismiss, dark }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: dark ? 'rgba(20,145,155,0.18)' : 'var(--cyan-50)',
      border: `1px solid ${dark ? 'rgba(56,190,201,0.4)' : 'var(--cyan-200)'}`,
      color: dark ? 'var(--cyan-100)' : 'var(--cyan-900)',
      padding: '12px 18px 12px 16px',
      borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 14, fontWeight: 500,
      boxShadow: dark ? 'none' : '0 6px 20px -4px rgba(14,124,134,0.22)',
      zIndex: 20,
      maxWidth: 560,
      animation: 'fgToastIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: dark ? 'var(--cyan-300)' : 'var(--cyan-700)',
        flex: 'none',
      }} />
      <span style={{ flex: 1 }}>{text}</span>
      <button onClick={onDismiss} style={{
        border: 0, background: 'transparent', cursor: 'pointer',
        color: 'inherit', opacity: 0.6, fontSize: 18, padding: 2,
      }}>×</button>
    </div>
  );
}

function ParticipantView({ dark, state, actions }) {
  const {
    questionIndex, answers, voiceId, speaking, tier,
    adaptiveToast, showBreak, showHeadphonePrompt,
    progress, fatigueScore, totalQuestions, soundOn = true,
  } = state;
  const isSpeaking = speaking && soundOn;

  const q = FG_QUESTIONS[questionIndex];
  const voice = FG_VOICES.find(v => v.id === voiceId);
  const selected = answers[q.id];
  const fatigueActive = fatigueScore > 0.6;

  const bg = dark ? '#0d0c0a' : 'var(--neutral-50)';
  const fg = dark ? 'rgba(255,255,255,0.92)' : 'var(--text-primary)';
  const mutedFg = dark ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)';

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: bg, color: fg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: 'background 0.6s, color 0.6s',
    }}>
      {/* Top bar: section label · voice persona · break */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 32px 18px',
        borderBottom: `1px solid ${cardBorder}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: mutedFg, fontWeight: 600,
          }}>Field Guide</div>
          <div style={{ width: 1, height: 14, background: cardBorder }} />
          <div style={{ fontSize: 13, color: mutedFg, fontWeight: 500 }}>
            {q.section} · Question {q.number} of {totalQuestions}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 14px 7px 10px',
            background: card, border: `1px solid ${cardBorder}`,
            borderRadius: 999, fontSize: 13,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: dark ? 'rgba(56,190,201,0.25)' : 'var(--cyan-100)',
              color: dark ? 'var(--cyan-200)' : 'var(--cyan-800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, fontSize: 11, letterSpacing: 0,
            }}>{voice.name[0]}</div>
            <span style={{ color: fg, fontWeight: 500 }}>{voice.name}</span>
            <span style={{ color: mutedFg, fontSize: 12 }}>· {voice.accent}</span>
          </div>
          <button onClick={actions.toggleSound} aria-pressed={!state.soundOn} title={state.soundOn ? 'Mute voice' : 'Unmute voice'} style={{
            font: 'inherit', fontSize: 13, fontWeight: 500,
            padding: '8px 14px 8px 12px', borderRadius: 999,
            background: state.soundOn
              ? 'transparent'
              : (dark ? 'rgba(233,185,73,0.14)' : 'var(--yellow-50)'),
            border: `1px solid ${state.soundOn
              ? cardBorder
              : (dark ? 'rgba(233,185,73,0.45)' : 'var(--yellow-200)')}`,
            color: state.soundOn
              ? fg
              : (dark ? 'var(--yellow-300)' : 'var(--yellow-800)'),
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {state.soundOn
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6v4h2l3 3V3L5 6H3z"/><path d="M11 5.5a3.5 3.5 0 010 5M13 3.5a6 6 0 010 9"/></svg>
              : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6v4h2l3 3V3L5 6H3z"/><path d="M11 6l4 4M15 6l-4 4"/></svg>}
            <span>{state.soundOn ? 'Sound on' : 'Sound off'}</span>
          </button>
          <button onClick={actions.takeBreak} style={{
            font: 'inherit', fontSize: 14, fontWeight: 500,
            padding: '9px 18px', borderRadius: 999,
            background: 'transparent',
            border: `1px solid ${cardBorder}`,
            color: fg,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : 'var(--neutral-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Take a break</button>
        </div>
      </div>

      {/* Progress — thin, unobtrusive */}
      <div style={{ padding: '0 32px', position: 'relative' }}>
        <div style={{
          height: 3, background: dark ? 'rgba(255,255,255,0.06)' : 'var(--neutral-100)',
          borderRadius: 2, overflow: 'hidden', marginTop: 14,
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: dark ? 'var(--cyan-400)' : 'var(--cyan-600)',
            borderRadius: 2,
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Main stage */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '48px 80px 36px', position: 'relative',
      }}>
        <AdaptiveToast
          show={!!adaptiveToast}
          text={adaptiveToast}
          onDismiss={actions.dismissToast}
          dark={dark}
        />

        {/* Voice / waveform */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 28,
        }}>
          <button
            onClick={actions.toggleSpeak}
            disabled={!soundOn}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 20px 12px 16px',
              borderRadius: 999,
              background: isSpeaking
                ? (dark ? 'rgba(56,190,201,0.15)' : 'var(--cyan-50)')
                : card,
              border: `1px solid ${isSpeaking
                ? (dark ? 'rgba(56,190,201,0.4)' : 'var(--cyan-200)')
                : cardBorder}`,
              cursor: soundOn ? 'pointer' : 'not-allowed',
              font: 'inherit',
              color: fg,
              opacity: soundOn ? 1 : 0.55,
              transition: 'all 0.3s',
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: isSpeaking
                ? (dark ? 'var(--cyan-500)' : 'var(--cyan-700)')
                : (dark ? 'rgba(255,255,255,0.08)' : 'var(--neutral-200)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              transition: 'background 0.3s',
            }}>
              {isSpeaking
                ? <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="1" width="4" height="14" rx="1"/><rect x="9" y="1" width="4" height="14" rx="1"/></svg>
                : <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M1 1v14l12-7L1 1z"/></svg>}
            </div>
            <Waveform active={isSpeaking} dark={dark} />
            <span style={{
              fontSize: 13, color: mutedFg, marginLeft: 4,
              fontVariantNumeric: 'tabular-nums',
            }}>{!soundOn ? 'Sound muted' : (speaking ? 'Reading aloud' : 'Tap to replay')}</span>
          </button>
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: 12, color: mutedFg,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Reading level: <span style={{ color: fg, fontWeight: 600 }}>
              {tier === 'standard' ? 'Standard' : tier === 'easy' ? 'Adapted' : 'Simplified'}
            </span>
          </div>
        </div>

        {/* Question text */}
        <div key={q.id + '-' + tier} style={{
          marginBottom: 48,
          animation: 'fgFade 0.5s ease-out',
        }}>
          <div style={{
            fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: mutedFg, fontWeight: 600, marginBottom: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Q{String(q.number).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: tier === 'simple' ? 44 : tier === 'easy' ? 40 : 36,
            lineHeight: 1.2, letterSpacing: '-0.015em',
            fontWeight: 500, color: fg,
            maxWidth: '26ch', textWrap: 'pretty',
          }}>
            {q.tiers[tier]}
          </div>
        </div>

        {/* Likert row */}
        <LikertRow
          selected={selected}
          onPick={actions.answer}
          answers={answers}
          dark={dark}
          tier={tier}
          fast={fatigueActive}
        />

        {/* Footer hint */}
        <div style={{
          marginTop: 'auto', paddingTop: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: mutedFg,
        }}>
          <span>There are no right answers. Take your time.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5v4a4 4 0 008 0V5M7 9v3" strokeLinecap="round"/>
              <rect x="5" y="1" width="4" height="7" rx="2"/>
            </svg>
            Headphones connected · {soundOn ? 'sound on' : 'sound off'}
          </span>
        </div>
      </div>

      {/* Headphone prompt overlay */}
      {showHeadphonePrompt && (
        <HeadphoneOverlay dark={dark} onContinue={actions.dismissHeadphonePrompt} />
      )}

      {/* Break overlay */}
      {showBreak && (
        <BreakOverlay dark={dark} onResume={actions.resumeFromBreak} />
      )}

      {/* Transition (handoff) overlay */}
      {state.transition && (
        <TransitionOverlay dark={dark} handoff={state.transition} onAck={actions.ackTransition} />
      )}

      {/* Rest mode overlay */}
      {state.restMode && (
        <RestMode dark={dark} onWake={actions.wakeFromRest} participantName={state.participantName} />
      )}
    </div>
  );
}

function HeadphoneOverlay({ dark, onContinue }) {
  const bg = dark ? 'rgba(13,12,10,0.96)' : 'rgba(250,249,247,0.96)';
  const fg = dark ? 'rgba(255,255,255,0.92)' : 'var(--text-primary)';
  const muted = dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 80, textAlign: 'center', zIndex: 40,
      animation: 'fgFade 0.4s',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        border: `2px solid ${dark ? 'rgba(56,190,201,0.5)' : 'var(--cyan-600)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
        color: dark ? 'var(--cyan-300)' : 'var(--cyan-700)',
      }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M8 24v-2a14 14 0 0128 0v2"/>
          <path d="M6 24h6v10H8a2 2 0 01-2-2v-8zM38 24h-6v10h4a2 2 0 002-2v-8z"/>
        </svg>
      </div>
      <div style={{
        fontSize: 36, fontWeight: 500, letterSpacing: '-0.015em',
        color: fg, marginBottom: 16, maxWidth: '20ch',
      }}>Let's get your headphones on first.</div>
      <div style={{
        fontSize: 17, color: muted, lineHeight: 1.5,
        maxWidth: '44ch', marginBottom: 40,
      }}>
        Field Guide reads questions aloud so you can focus on your answers.
        Headphones keep what you hear private in a shared clinic space.
      </div>
      <button onClick={onContinue} style={{
        font: 'inherit', fontSize: 16, fontWeight: 500,
        padding: '16px 36px', borderRadius: 999,
        background: dark ? 'var(--cyan-500)' : 'var(--cyan-700)',
        border: 0, color: '#fff', cursor: 'pointer',
      }}>
        My headphones are on
      </button>
      <button style={{
        font: 'inherit', fontSize: 14, fontWeight: 500,
        padding: '12px 20px', marginTop: 8,
        background: 'transparent', border: 0, color: muted, cursor: 'pointer',
      }}>I need help connecting them</button>
    </div>
  );
}

function BreakOverlay({ dark, onResume }) {
  const bg = dark ? 'rgba(13,12,10,0.96)' : 'rgba(250,249,247,0.96)';
  const fg = dark ? 'rgba(255,255,255,0.92)' : 'var(--text-primary)';
  const muted = dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 80, textAlign: 'center', zIndex: 40,
      animation: 'fgFade 0.4s',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: dark ? 'var(--cyan-300)' : 'var(--cyan-700)',
        fontWeight: 600, marginBottom: 20,
      }}>You're on a break</div>
      <div style={{
        fontSize: 44, fontWeight: 500, letterSpacing: '-0.015em',
        color: fg, marginBottom: 20, maxWidth: '18ch', lineHeight: 1.15,
      }}>Rest as long as you'd like.</div>
      <div style={{
        fontSize: 17, color: muted, lineHeight: 1.5,
        maxWidth: '42ch', marginBottom: 44,
      }}>
        Your answers are saved. Nothing is counting down.
        When you're ready, we'll pick up right where you left off.
      </div>
      <button onClick={onResume} style={{
        font: 'inherit', fontSize: 16, fontWeight: 500,
        padding: '16px 36px', borderRadius: 999,
        background: dark ? 'var(--cyan-500)' : 'var(--cyan-700)',
        border: 0, color: '#fff', cursor: 'pointer',
      }}>I'm ready to continue</button>
    </div>
  );
}

function TransitionOverlay({ dark, handoff, onAck }) {
  const bg = dark ? 'rgba(13,12,10,0.97)' : 'rgba(250,249,247,0.97)';
  const fg = dark ? 'rgba(255,255,255,0.94)' : 'var(--text-primary)';
  const muted = dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  const accent = dark ? 'var(--cyan-300)' : 'var(--cyan-700)';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)';
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 72, textAlign: 'center', zIndex: 45, animation: 'fgFade 0.5s',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: accent, fontWeight: 600, marginBottom: 24,
      }}>Nice work · You're moving on</div>

      <div style={{
        fontSize: 52, fontWeight: 500, letterSpacing: '-0.02em',
        color: fg, lineHeight: 1.08, marginBottom: 18, maxWidth: '18ch',
        textWrap: 'pretty',
      }}>Next, head over to the dental chair.</div>

      <div style={{
        fontSize: 18, color: muted, lineHeight: 1.5,
        maxWidth: '42ch', marginBottom: 40,
      }}>
        A dental hygienist will check your teeth. It takes about fifteen minutes.
        Your answers so far are saved. We'll pick up the survey when you come back.
      </div>

      {/* Destination card */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        background: card, border: `1px solid ${border}`,
        borderRadius: 18, padding: 4, marginBottom: 36,
        boxShadow: dark ? 'none' : '0 10px 30px -12px rgba(14,124,134,0.18)',
      }}>
        <div style={{
          padding: '22px 28px', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', gap: 4, minWidth: 180,
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: muted, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          }}>Where to go</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: '-0.01em' }}>
            {handoff.location}
          </div>
          <div style={{ fontSize: 13, color: muted }}>{handoff.wayfinding}</div>
        </div>
        <div style={{ width: 1, background: border }} />
        <div style={{
          padding: '22px 28px', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', gap: 4, minWidth: 180,
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: muted, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          }}>Who you'll see</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: '-0.01em' }}>
            {handoff.who}
          </div>
          <div style={{ fontSize: 13, color: muted }}>{handoff.role}</div>
        </div>
        <div style={{ width: 1, background: border }} />
        <div style={{
          padding: '22px 28px', display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', gap: 4, minWidth: 180,
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: muted, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          }}>About how long</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: fg, letterSpacing: '-0.01em' }}>
            {handoff.duration}
          </div>
          <div style={{ fontSize: 13, color: muted }}>{handoff.durationNote}</div>
        </div>
      </div>

      <button onClick={onAck} style={{
        font: 'inherit', fontSize: 16, fontWeight: 500,
        padding: '16px 36px', borderRadius: 999,
        background: dark ? 'var(--cyan-500)' : 'var(--cyan-700)',
        border: 0, color: '#fff', cursor: 'pointer',
      }}>
        Okay, I'm heading over
      </button>
      <div style={{ fontSize: 13, color: muted, marginTop: 18 }}>
        This tablet will rest here until you're back.
      </div>
    </div>
  );
}

function RestMode({ dark, onWake, participantName }) {
  return (
    <div onClick={onWake} style={{
      position: 'absolute', inset: 0,
      background: dark ? '#050505' : '#13100c',
      color: 'rgba(255,255,255,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 72, textAlign: 'center', zIndex: 50,
      cursor: 'pointer', animation: 'fgFade 0.8s',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: 'var(--cyan-400)',
        boxShadow: '0 0 0 0 rgba(56,190,201,0.6)',
        animation: 'fgBreathe 3.2s ease-in-out infinite',
        marginBottom: 36,
      }} />
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)', fontWeight: 500, marginBottom: 22,
      }}>Field Guide · Resting</div>
      <div style={{
        fontSize: 38, fontWeight: 400, letterSpacing: '-0.015em',
        lineHeight: 1.2, maxWidth: '22ch', color: 'rgba(255,255,255,0.92)',
        marginBottom: 16,
      }}>
        {participantName ? `See you soon, ${participantName}.` : "See you when you're back."}
      </div>
      <div style={{
        fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
        maxWidth: '40ch', marginBottom: 48,
      }}>
        Your place is saved — Question 34 of 120.<br />
        Tap the screen when you're ready to pick up where you left off.
      </div>
      <div style={{
        display: 'flex', gap: 24, fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        <span>33 answered</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Session held</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Offline safe</span>
      </div>
    </div>
  );
}

window.ParticipantView = ParticipantView;

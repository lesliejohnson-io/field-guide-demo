// Main app — wires participant + researcher views, runs fatigue simulation
// Depends on: React, IPadFrame, ParticipantView, ResearcherView, survey-data.js

const { useState, useEffect, useRef, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "autoFatigue": true,
  "tierOverride": "auto"
}/*EDITMODE-END*/;

const HANDOFF = {
  location: 'Dental chair #2',
  wayfinding: 'Down the hall, on your right',
  who: 'Melissa',
  role: 'Dental hygienist',
  duration: '~15 min',
  durationNote: 'Then back here',
};
const PARTICIPANT_NAME = 'Wade';

function formatTime(ms) {
  const d = new Date(ms);
  return d.toTimeString().slice(0, 8);
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Session state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [voiceId, setVoiceId] = useState('ellis');
  const [speaking, setSpeaking] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [tier, setTier] = useState('standard');
  const [adaptiveToast, setAdaptiveToast] = useState(null);
  const [showBreak, setShowBreak] = useState(false);
  const [showHeadphonePrompt, setShowHeadphonePrompt] = useState(true);
  const [transition, setTransition] = useState(null); // HANDOFF object when active
  const [restMode, setRestMode] = useState(false);
  const [fatigueScore, setFatigueScore] = useState(0.12);
  const [fatigueHistory, setFatigueHistory] = useState([0.10, 0.12, 0.11, 0.13, 0.12]);
  const [log, setLog] = useState([]);
  const [flags, setFlags] = useState([]);
  const [pace, setPace] = useState(4.2);
  const [sessionStart] = useState(() => Date.now() - 18 * 60 * 1000); // "started 18m ago"
  const [answerTimestamps, setAnswerTimestamps] = useState([]);

  const totalQuestions = 120;
  const logIdRef = useRef(0);
  const adaptiveFiredRef = useRef(false);

  const addLog = useCallback((entry) => {
    const id = ++logIdRef.current;
    const newEntry = {
      id, time: new Date().toTimeString().slice(0, 8),
      fresh: true, ...entry,
    };
    setLog(prev => {
      // clear fresh on older
      const cleared = prev.map(e => ({ ...e, fresh: false }));
      return [newEntry, ...cleared].slice(0, 80);
    });
  }, []);

  // Seed initial log entries
  useEffect(() => {
    const seeds = [
      { kind: 'info', text: 'Session started · adult survey FG-0428', time: '10:42:03' },
      { kind: 'info', text: 'Participant confirmed headphones connected', time: '10:42:41' },
      { kind: 'voice', text: 'Voice persona set to Ellis · Eastern Kentucky · warm', time: '10:42:44', reason: 'Default for 60+ adult, male-matched' },
      { kind: 'answer', text: 'Q31 answered · Strongly agree', time: '10:55:12' },
      { kind: 'answer', text: 'Q32 answered · Agree', time: '10:56:08' },
      { kind: 'answer', text: 'Q33 answered · Agree', time: '10:57:02' },
    ];
    setLog(seeds.map((s, i) => ({ ...s, id: -i - 1, fresh: false })));
    logIdRef.current = 0;
  }, []);

  // Fatigue drifts up as more answers land at the same Likert value
  useEffect(() => {
    const ans = Object.values(answers);
    if (ans.length < 2) return;
    const lastThree = ans.slice(-3);
    const uniform = lastThree.every(a => a === lastThree[0]);
    const recentPace = answerTimestamps.length >= 2
      ? (answerTimestamps[answerTimestamps.length - 1] - answerTimestamps[answerTimestamps.length - 2]) / 1000
      : 4;
    const target = uniform
      ? Math.min(0.92, 0.3 + lastThree.length * 0.15 + (recentPace < 1.5 ? 0.2 : 0))
      : Math.max(0.1, fatigueScore - 0.08);
    setFatigueScore(prev => prev * 0.6 + target * 0.4);
    setFatigueHistory(prev => [...prev, target].slice(-24));
    setPace(prev => prev * 0.7 + recentPace * 0.3);
  }, [answers]);

  // Fire adaptive response when fatigue crosses threshold (once)
  useEffect(() => {
    if (!tw.autoFatigue) return;
    if (fatigueScore > 0.62 && !adaptiveFiredRef.current) {
      adaptiveFiredRef.current = true;
      // Wait a beat for drama
      setTimeout(() => {
        // 1) flag fatigue
        addLog({
          kind: 'fatigue', auto: true,
          text: 'Fatigue threshold crossed at 34% completion',
          reason: 'Three consecutive "Agree" responses in under 5s total. Past 34% boundary.',
        });
        setFlags(prev => [...prev, { id: 'f-' + Date.now(), kind: 'fatigue' }]);

        // 2) switch voice (Ellis → Opal)
        setTimeout(() => {
          setVoiceId('opal');
          addLog({
            kind: 'voice', auto: true,
            text: 'Voice switched · Ellis → Opal',
            reason: 'Opal: gentler pacing, Western NC accent. Matches participant profile; reduces perceived institutional tone.',
          });
        }, 900);

        // 3) rewrite to easier tier
        setTimeout(() => {
          if (tw.tierOverride === 'auto') setTier('easy');
          addLog({
            kind: 'rewrite', auto: true,
            text: 'Reading level lowered · Standard → Adapted',
            reason: 'Shorter sentences, everyday words. Scientific content preserved.',
          });
          setAdaptiveToast('Let me ask this a simpler way.');
        }, 1800);

        // 4) toast auto-dismisses
        setTimeout(() => setAdaptiveToast(null), 6500);
      }, 400);
    }
  }, [fatigueScore, tw.autoFatigue, tw.tierOverride, addLog]);

  // Manual tier override
  useEffect(() => {
    if (tw.tierOverride !== 'auto') setTier(tw.tierOverride);
  }, [tw.tierOverride]);

  // Actions
  const answer = useCallback((key) => {
    const q = FG_QUESTIONS[questionIndex];
    const label = FG_LIKERT.find(l => l.key === key).label;
    setAnswers(prev => ({ ...prev, [q.id]: key }));
    setAnswerTimestamps(prev => [...prev, Date.now()]);
    addLog({ kind: 'answer', text: `Q${q.number} answered · ${label}` });
    // Advance after a short beat (but clamp to range)
    setTimeout(() => {
      setQuestionIndex(i => Math.min(i + 1, FG_QUESTIONS.length - 1));
      setSpeaking(true);
    }, 600);
  }, [questionIndex, addLog]);

  const toggleSpeak = useCallback(() => setSpeaking(s => !s), []);
  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev;
      addLog({
        kind: 'info',
        text: next ? 'Participant turned sound on' : 'Participant turned sound off',
        reason: next ? undefined : 'Questions will still be visible. Participant can re-enable sound at any time.',
      });
      if (!next) setSpeaking(false);
      return next;
    });
  }, [addLog]);
  const takeBreak = useCallback(() => {
    setShowBreak(true); setSpeaking(false);
    addLog({ kind: 'break', text: 'Participant started a break' });
  }, [addLog]);
  const resumeFromBreak = useCallback(() => {
    setShowBreak(false); setSpeaking(true);
    addLog({ kind: 'break', text: 'Participant resumed from break' });
  }, [addLog]);
  const dismissHeadphonePrompt = useCallback(() => {
    setShowHeadphonePrompt(false);
    addLog({ kind: 'info', text: 'Participant confirmed headphones connected' });
  }, [addLog]);
  const dismissToast = useCallback(() => setAdaptiveToast(null), []);

  const triggerHandoff = useCallback(() => {
    setTransition(HANDOFF);
    setSpeaking(false);
    addLog({
      kind: 'info', auto: true,
      text: `Coordinator signaled handoff → ${HANDOFF.location}`,
      reason: `Clinic workflow: dental exam ready. Participant notified on tablet. Session paused at Q${33 + Object.keys(answers).length}.`,
    });
  }, [addLog, answers]);
  const ackTransition = useCallback(() => {
    setTransition(null);
    setRestMode(true);
    addLog({
      kind: 'info',
      text: 'Participant acknowledged handoff · tablet entering rest mode',
      reason: 'Session held with progress preserved. Screen dimmed; tap to resume.',
    });
  }, [addLog]);
  const wakeFromRest = useCallback(() => {
    setRestMode(false);
    setSpeaking(true);
    addLog({ kind: 'info', text: 'Participant returned · tablet woken from rest' });
  }, [addLog]);

  const flagForFollowup = useCallback(() => {
    setFlags(prev => [...prev, { id: 'f-' + Date.now(), kind: 'manual' }]);
    addLog({ kind: 'info', text: 'Researcher flagged current response for follow-up' });
  }, [addLog]);

  const sessionMin = Math.floor((Date.now() - sessionStart) / 60000);
  const progress = Math.min(1, (30 + questionIndex + Object.keys(answers).length) / totalQuestions);

  const participantState = {
    questionIndex: Math.min(questionIndex, FG_QUESTIONS.length - 1),
    answers, voiceId, speaking, tier,
    adaptiveToast, showBreak, showHeadphonePrompt,
    progress, fatigueScore, totalQuestions, soundOn,
    transition, restMode, participantName: PARTICIPANT_NAME,
  };
  const actions = {
    answer, toggleSpeak, toggleSound, takeBreak, resumeFromBreak,
    dismissHeadphonePrompt, dismissToast,
    ackTransition, wakeFromRest,
  };
  const researcherState = {
    fatigueScore, fatigueHistory, log, answers, voiceId, tier,
    questionIndex: 33 + Object.keys(answers).length,
    totalQuestions, flags, sessionMin, pace,
  };

  const bg = tw.dark ? '#0a0a0b' : 'var(--neutral-100)';
  const headingColor = tw.dark ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)';
  const mutedColor = tw.dark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)';

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: bg,
      padding: '48px 48px 80px',
      boxSizing: 'border-box',
      transition: 'background 0.6s',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <header style={{
        maxWidth: 2560, margin: '0 auto 40px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        gap: 32, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: mutedColor, fontWeight: 600, marginBottom: 10,
          }}>Field Guide · V2 · Prototype</div>
          <h1 style={{
            margin: 0, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em',
            color: headingColor, maxWidth: '22ch', lineHeight: 1.1,
          }}>Voice-first, fatigue-aware health survey for rural clinics.</h1>
        </div>
        <div style={{
          fontSize: 14, color: mutedColor, maxWidth: '42ch', lineHeight: 1.5,
        }}>
          Two tablets, one session. Answer questions on the left as the participant — the researcher panel on the right updates live. Trip the fatigue threshold to watch Field Guide adapt the voice and reading level in real time.
        </div>
      </header>

      <div style={{
        display: 'flex', gap: 40, justifyContent: 'center',
        alignItems: 'flex-start', flexWrap: 'wrap',
        maxWidth: 2560, margin: '0 auto',
      }}>
        <IPadFrame label="Participant tablet" dark={tw.dark} width={1140} height={800}>
          <ParticipantView dark={tw.dark} state={participantState} actions={actions} />
        </IPadFrame>
        <IPadFrame label="Researcher tablet" dark={tw.dark} width={1140} height={800}>
          <ResearcherView dark={tw.dark} state={researcherState} onOverride={flagForFollowup} />
        </IPadFrame>
      </div>

      <TweaksPanel>
        <TweakSection label="Environment" />
        <TweakToggle label="Low-light / dark mode" value={tw.dark}
          onChange={v => setTweak('dark', v)} />
        <TweakSection label="Agent behavior" />
        <TweakToggle label="Auto-adapt on fatigue" value={tw.autoFatigue}
          onChange={v => setTweak('autoFatigue', v)} />
        <TweakRadio label="Reading level" value={tw.tierOverride}
          options={['auto', 'standard', 'easy', 'simple']}
          onChange={v => setTweak('tierOverride', v)} />
        <TweakSection label="Simulate" />
        <TweakButton label="Signal handoff → Dental chair #2" onClick={triggerHandoff} />
        <TweakButton label="Skip to rest mode" onClick={() => {
          setTransition(null); setRestMode(true);
        }} />
        <TweakButton label="Wake tablet" onClick={() => {
          setTransition(null); setRestMode(false);
        }} />
        <TweakButton label="Trigger fatigue signal" onClick={() => {
          setFatigueScore(0.78);
          setFatigueHistory(prev => [...prev, 0.45, 0.6, 0.72, 0.78]);
          setPace(1.6);
        }} />
        <TweakButton label="Reset voice + tier" onClick={() => {
          setVoiceId('ellis'); setTier('standard');
          setFatigueScore(0.12);
          setFatigueHistory([0.10, 0.12, 0.11, 0.13, 0.12]);
          adaptiveFiredRef.current = false;
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

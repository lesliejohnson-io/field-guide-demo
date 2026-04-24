// Survey content + reading-level tiers + voice personas
// Used by both participant and researcher views.

window.FG_QUESTIONS = [
  {
    id: 'q034', number: 34, section: 'Daily wellbeing',
    tiers: {
      standard: "In the past week, I have felt I had enough energy to do the things I wanted to do.",
      easy:     "This past week, I had enough energy for things I wanted to do.",
      simple:   "I had enough energy this week."
    },
    type: 'likert5',
  },
  {
    id: 'q035', number: 35, section: 'Daily wellbeing',
    tiers: {
      standard: "I feel that the people around me genuinely care about how I am doing.",
      easy:     "The people around me really care about how I am doing.",
      simple:   "People near me care about me."
    },
    type: 'likert5',
  },
  {
    id: 'q036', number: 36, section: 'Daily wellbeing',
    tiers: {
      standard: "Over the past two weeks, I have been able to fall asleep without difficulty most nights.",
      easy:     "Most nights in the past two weeks, I fell asleep okay.",
      simple:   "I slept okay most nights."
    },
    type: 'likert5',
  },
  {
    id: 'q037', number: 37, section: 'Daily wellbeing',
    tiers: {
      standard: "When something stressful happens in my day, I feel I can handle it without feeling overwhelmed.",
      easy:     "When something stressful happens, I can handle it okay.",
      simple:   "I handle stress okay."
    },
    type: 'likert5',
  },
];

window.FG_LIKERT = [
  { key: 'sd', label: 'Strongly disagree' },
  { key: 'd',  label: 'Disagree' },
  { key: 'n',  label: 'Neither' },
  { key: 'a',  label: 'Agree' },
  { key: 'sa', label: 'Strongly agree' },
];

window.FG_VOICES = [
  { id: 'ellis',   name: 'Ellis',   accent: 'Eastern Kentucky', tone: 'warm · measured',     age: '60s', active: true  },
  { id: 'opal',    name: 'Opal',    accent: 'Western N.C.',     tone: 'gentle · unhurried',  age: '70s', active: false },
  { id: 'wade',    name: 'Wade',    accent: 'Southern W. Va.',  tone: 'steady · direct',     age: '50s', active: false },
  { id: 'harriet', name: 'Harriet', accent: 'Tri-Cities TN',    tone: 'bright · conversational', age: '40s', active: false },
];

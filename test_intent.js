const FILLER_WORDS = ['please', 'can you', 'could you', 'would you', 'i want to', 'i\'d like to', 'let\'s', 'lets', 'can we', 'i need to', 'go ahead and', 'kindly', 'just', 'actually', 'um', 'uh', 'so', 'like', 'basically', 'well'];
function stripFillers(text) {
  let cleaned = text;
  for (const f of FILLER_WORDS) {
    const rx = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    cleaned = cleaned.replace(rx, ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
function fuzzyMatch(input, target, threshold = 0.35) {
  const a = input.toLowerCase(), b = target.toLowerCase();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen > 0 && (dist / maxLen) <= threshold;
}
function fuzzyMatchAny(input, targets, threshold = 0.35) {
  return targets.some(t => fuzzyMatch(input, t, threshold));
}
const START_VERBS = ['start', 'begin', 'create', 'new', 'initialize', 'init', 'open', 'launch', 'kick off', 'work on', 'working on', 'do', 'doing', 'starting', 'beginning', 'add'];
const START_NOUNS = ['task', 'work', 'project', 'issue', 'job', 'ticket', 'item', 'sprint', 'session', 'context'];
const STOP_VERBS = ['stop', 'end', 'finish', 'complete', 'close', 'pause', 'done', 'conclude', 'halt', 'terminate', 'wrap up', 'shut down', 'stopping', 'finishing', 'ending', 'completed'];
const STOP_NOUNS = ['task', 'work', 'project', 'issue', 'job', 'session', 'context', 'timer'];
const NOTE_VERBS = ['note', 'add', 'log', 'record', 'take', 'write', 'append', 'jot', 'capture', 'save', 'memo'];
const NOTE_NOUNS = ['note', 'bug', 'issue', 'reminder', 'comment', 'observation', 'memo', 'remark', 'thought', 'finding', 'entry'];
const RENAME_PHRASES = ['rename', 'rename task', 'change title', 'change name', 'change task name', 'update title', 'update name', 'set title', 'set name', 'title is', 'call it', 'rename to', 'change title to', 'change name to', 'rename task to'];
const EDIT_NOTE_PHRASES = ['edit note', 'change note', 'update note', 'modify note', 'fix note', 'correct note', 'revise note'];
const EDIT_OBJECTIVE_PHRASES = ['edit objective', 'change objective', 'update objective', 'modify objective', 'edit plan', 'change plan', 'update plan', 'modify plan', 'edit goal', 'change goal', 'update goal', 'modify goal', 'change description', 'update description', 'edit description'];
const ADD_OBJECTIVE_PHRASES = ['add objective', 'add plan', 'add goal', 'new objective', 'new plan', 'new goal', 'another objective', 'another plan', 'another goal', 'more objectives', 'add description', 'add a plan', 'add a goal', 'add an objective'];

function scoreIntent(text) {
  const cleaned = stripFillers(text);
  const lower = cleaned.toLowerCase();
  const tokens = cleaned.split(/\s+/);
  for (const p of RENAME_PHRASES) if (lower.includes(p) || fuzzyMatchAny(lower, [p], 0.25)) return { intent: 'RENAME' };
  for (const p of EDIT_NOTE_PHRASES) if (lower.includes(p) || fuzzyMatchAny(lower, [p], 0.25)) return { intent: 'EDIT_NOTE' };
  for (const p of EDIT_OBJECTIVE_PHRASES) if (lower.includes(p) || fuzzyMatchAny(lower, [p], 0.25)) return { intent: 'EDIT_OBJECTIVE' };
  for (const p of ADD_OBJECTIVE_PHRASES) if (lower.includes(p) || fuzzyMatchAny(lower, [p], 0.25)) return { intent: 'ADD_OBJECTIVE' };
  let startScore = 0; let stopScore = 0; let noteScore = 0;
  for (const t of tokens) {
    if (START_VERBS.some(v => fuzzyMatch(t, v, 0.3))) startScore += 3;
    if (START_NOUNS.some(n => fuzzyMatch(t, n, 0.3))) startScore += 2;
  }
  for (const v of START_VERBS) if (v.includes(' ') && lower.includes(v)) startScore += 4;
  for (const t of tokens) {
    if (STOP_VERBS.some(v => fuzzyMatch(t, v, 0.3))) stopScore += 3;
    if (STOP_NOUNS.some(n => fuzzyMatch(t, n, 0.3))) stopScore += 2;
  }
  for (const v of STOP_VERBS) if (v.includes(' ') && lower.includes(v)) stopScore += 4;
  if (/\b(i\'?m\s+)?done\b/i.test(lower)) stopScore += 5;
  if (/\bwrap\s*(it\s+)?up\b/i.test(lower)) stopScore += 5;
  for (const t of tokens) {
    if (NOTE_VERBS.some(v => fuzzyMatch(t, v, 0.3))) noteScore += 2;
    if (NOTE_NOUNS.some(n => fuzzyMatch(t, n, 0.3))) noteScore += 3;
  }
  const scores = [['START', startScore], ['STOP', stopScore], ['NOTE', noteScore]];
  scores.sort((a, b) => b[1] - a[1]);
  return { intent: scores[0][0], score: scores[0][1] };
}

const WAKE_PHRASES = ["wake up", "wakeup", "wake", "hi krimsona", "hey krimsona", "krimsona", "resume", "listen", "hello", "i'm back", "im back", "activate", "turn on", "online", "yo krimsona", "hey there", "ok krimsona", "okay krimsona"];
const SLEEP_PHRASES = ["sleep", "go to sleep", "pause listening", "stop listening", "mute", "quiet", "shut up", "silence", "stand by", "standby", "good night", "goodnight", "take a break", "nap", "snooze"];

function testProcess(cmd) {
  const isWakePhrase = WAKE_PHRASES.some((p) => cmd.includes(p) || fuzzyMatchAny(cmd, [p], 0.3));
  const isSleepPhrase = SLEEP_PHRASES.some((p) => cmd.includes(p) || fuzzyMatchAny(cmd, [p], 0.3));
  console.log(`cmd: "${cmd}", wake: ${isWakePhrase}, sleep: ${isSleepPhrase}, intent: ${JSON.stringify(scoreIntent(cmd))}`);
}

testProcess('create a task');

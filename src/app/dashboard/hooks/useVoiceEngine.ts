"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VoiceContext } from "../types";

interface UseVoiceEngineProps {
  onStartTask: (title: string) => void;
  onUpdatePlan: (plan: string) => void;
  onStopTask: () => void;
  onAppendNote: (note: string) => void;
  onSummary: (text: string) => void;
  onCommit: (text: string) => void;
  hasActiveTask: boolean;
}

// ────────────────────────────────────────────────────────────────────────────────
// Fuzzy matching utilities
// ────────────────────────────────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(input: string, target: string, threshold = 0.35): boolean {
  const a = input.toLowerCase(), b = target.toLowerCase();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen > 0 && (dist / maxLen) <= threshold;
}

function fuzzyMatchAny(input: string, targets: string[], threshold = 0.35): boolean {
  return targets.some((t) => fuzzyMatch(input, t, threshold));
}

function containsAnyWord(text: string, words: string[]): boolean {
  const tokens = text.split(/\s+/);
  return words.some((w) => tokens.some((t) => fuzzyMatch(t, w, 0.3)));
}

// ────────────────────────────────────────────────────────────────────────────────
// Intent definitions — scored, not regex-matched
// ────────────────────────────────────────────────────────────────────────────────
type IntentType = "START" | "STOP" | "NOTE" | "SLEEP" | "WAKE" | "STATUS" | "HELP" | "CANCEL" | "UNKNOWN";

interface IntentResult {
  intent: IntentType;
  score: number;
  payload: string;
}

const START_VERBS = ["start", "begin", "create", "new", "initialize", "init", "open", "launch", "kick off", "work on", "working on", "do", "doing", "starting", "beginning", "add"];
const START_NOUNS = ["task", "work", "project", "issue", "job", "ticket", "item", "sprint", "session", "context"];

const STOP_VERBS = ["stop", "end", "finish", "complete", "close", "pause", "done", "conclude", "halt", "terminate", "wrap up", "shut down", "stopping", "finishing", "ending", "completed"];
const STOP_NOUNS = ["task", "work", "project", "issue", "job", "session", "context", "timer"];

const NOTE_VERBS = ["note", "add", "log", "record", "take", "write", "append", "jot", "capture", "save", "memo"];
const NOTE_NOUNS = ["note", "bug", "issue", "reminder", "comment", "observation", "memo", "remark", "thought", "finding", "entry"];

const WAKE_PHRASES = ["wake up", "wakeup", "wake", "hi krimsona", "hey krimsona", "krimsona", "resume", "listen", "hello", "i'm back", "im back", "activate", "turn on", "online", "yo krimsona", "hey there", "ok krimsona", "okay krimsona"];

const SLEEP_PHRASES = ["sleep", "go to sleep", "pause listening", "stop listening", "mute", "quiet", "shut up", "silence", "stand by", "standby", "good night", "goodnight", "take a break", "nap", "snooze"];

const CANCEL_PHRASES = ["cancel", "nevermind", "never mind", "abort", "forget it", "scratch that", "undo", "go back", "discard"];

const FILLER_WORDS = ["please", "can you", "could you", "would you", "i want to", "i'd like to", "let's", "lets", "can we", "i need to", "go ahead and", "kindly", "just", "actually", "um", "uh", "so", "like", "basically", "well"];

const ARTICLE_WORDS = ["a", "an", "the", "my", "this", "that", "some", "current", "new"];
const CONNECTOR_WORDS = ["called", "named", "about", "on", "for", "like", "regarding", "titled", "saying", "that", "with"];

function stripFillers(text: string): string {
  let cleaned = text;
  for (const f of FILLER_WORDS) {
    const rx = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    cleaned = cleaned.replace(rx, " ");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

function stripArticles(text: string): string {
  let cleaned = text;
  for (const a of ARTICLE_WORDS) {
    const rx = new RegExp(`\\b${a}\\b`, "gi");
    cleaned = cleaned.replace(rx, " ");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

function extractPayloadAfterVerb(text: string, verbs: string[], nouns: string[]): string {
  let payload = text;

  // Remove verb phrases
  for (const v of verbs) {
    const rx = new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    payload = payload.replace(rx, " ");
  }

  // Remove noun keywords when they appear at the start
  payload = payload.replace(/\s+/g, " ").trim();
  const payloadTokens = payload.split(/\s+/);
  while (payloadTokens.length > 0 && [...nouns, ...ARTICLE_WORDS, ...CONNECTOR_WORDS].some((w) => fuzzyMatch(payloadTokens[0], w, 0.25))) {
    payloadTokens.shift();
  }

  return payloadTokens.join(" ").trim();
}

function scoreIntent(text: string): IntentResult {
  const cleaned = stripFillers(text);
  const tokens = cleaned.split(/\s+/);

  let startScore = 0;
  let stopScore = 0;
  let noteScore = 0;

  // Score start intent
  for (const t of tokens) {
    if (START_VERBS.some((v) => fuzzyMatch(t, v, 0.3))) startScore += 3;
    if (START_NOUNS.some((n) => fuzzyMatch(t, n, 0.3))) startScore += 2;
  }
  // Multi-word verb matching (e.g. "work on", "kick off")
  for (const v of START_VERBS) {
    if (v.includes(" ") && cleaned.includes(v)) startScore += 4;
  }

  // Score stop intent
  for (const t of tokens) {
    if (STOP_VERBS.some((v) => fuzzyMatch(t, v, 0.3))) stopScore += 3;
    if (STOP_NOUNS.some((n) => fuzzyMatch(t, n, 0.3))) stopScore += 2;
  }
  for (const v of STOP_VERBS) {
    if (v.includes(" ") && cleaned.includes(v)) stopScore += 4;
  }
  // "I'm done" / "done" shortcuts
  if (/\b(i'?m\s+)?done\b/i.test(cleaned)) stopScore += 5;
  if (/\bwrap\s*(it\s+)?up\b/i.test(cleaned)) stopScore += 5;

  // Score note intent
  for (const t of tokens) {
    if (NOTE_VERBS.some((v) => fuzzyMatch(t, v, 0.3))) noteScore += 2;
    if (NOTE_NOUNS.some((n) => fuzzyMatch(t, n, 0.3))) noteScore += 3;
  }
  // Direct "note:" or "note that" patterns
  if (/^note[\s:]/i.test(cleaned)) noteScore += 5;
  if (/^(add|log|record)\s+(a\s+)?note/i.test(cleaned)) noteScore += 5;
  // "bug:" shortcut
  if (/^bug[\s:]/i.test(cleaned)) noteScore += 6;

  // Determine winner
  const scores: [IntentType, number][] = [
    ["START", startScore],
    ["STOP", stopScore],
    ["NOTE", noteScore],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  const [bestIntent, bestScore] = scores[0];

  // Ambiguity: if top two are tied and both > 0, prefer based on word order
  if (scores.length > 1 && bestScore > 0 && bestScore === scores[1][1]) {
    // Which verb appeared first?
    const firstStartIdx = tokens.findIndex((t) => START_VERBS.some((v) => fuzzyMatch(t, v, 0.3)));
    const firstStopIdx = tokens.findIndex((t) => STOP_VERBS.some((v) => fuzzyMatch(t, v, 0.3)));
    const firstNoteIdx = tokens.findIndex((t) => NOTE_NOUNS.some((n) => fuzzyMatch(t, n, 0.3)));

    const candidates: [IntentType, number][] = [];
    if (scores[0][0] === "START" || scores[1][0] === "START") candidates.push(["START", firstStartIdx >= 0 ? firstStartIdx : 999]);
    if (scores[0][0] === "STOP" || scores[1][0] === "STOP") candidates.push(["STOP", firstStopIdx >= 0 ? firstStopIdx : 999]);
    if (scores[0][0] === "NOTE" || scores[1][0] === "NOTE") candidates.push(["NOTE", firstNoteIdx >= 0 ? firstNoteIdx : 999]);
    candidates.sort((a, b) => a[1] - b[1]);

    if (candidates.length > 0 && candidates[0][1] < 999) {
      const resolvedIntent = candidates[0][0];
      const payload = resolvedIntent === "START"
        ? extractPayloadAfterVerb(cleaned, START_VERBS, START_NOUNS)
        : resolvedIntent === "NOTE"
        ? extractPayloadAfterVerb(cleaned, NOTE_VERBS, NOTE_NOUNS)
        : "";
      return { intent: resolvedIntent, score: bestScore, payload };
    }
  }

  if (bestScore < 3) {
    return { intent: "UNKNOWN", score: 0, payload: cleaned };
  }

  let payload = "";
  if (bestIntent === "START") {
    payload = extractPayloadAfterVerb(cleaned, START_VERBS, START_NOUNS);
  } else if (bestIntent === "NOTE") {
    payload = extractPayloadAfterVerb(cleaned, NOTE_VERBS, NOTE_NOUNS);
  }

  return { intent: bestIntent, score: bestScore, payload };
}

// ────────────────────────────────────────────────────────────────────────────────
// TTS helper
// ────────────────────────────────────────────────────────────────────────────────
export function speak(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// useVoiceEngine — speech recognition, dictation, TTS, and command routing
// ────────────────────────────────────────────────────────────────────────────────
export function useVoiceEngine({
  onStartTask,
  onUpdatePlan,
  onStopTask,
  onAppendNote,
  onSummary,
  onCommit,
  hasActiveTask,
}: UseVoiceEngineProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSleeping, setIsSleeping] = useState(true);
  const [transcript, setTranscript] = useState("Awaiting command...");
  const [voiceContext, setVoiceContext] = useState<VoiceContext>("IDLE");
  const [activeDictationField, setActiveDictationField] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");

  // Refs for avoiding stale closures
  const voiceContextRef = useRef(voiceContext);
  useEffect(() => { voiceContextRef.current = voiceContext; }, [voiceContext]);

  const isSleepingRef = useRef(isSleeping);
  useEffect(() => { isSleepingRef.current = isSleeping; }, [isSleeping]);

  const hasActiveTaskRef = useRef(hasActiveTask);
  useEffect(() => { hasActiveTaskRef.current = hasActiveTask; }, [hasActiveTask]);

  const dictationRef = useRef(activeDictationField);
  useEffect(() => { dictationRef.current = activeDictationField; }, [activeDictationField]);

  const recognitionRef = useRef<any>(null);
  const processCommandRef = useRef<any>(null);

  // Dictation field setters
  const dictationSettersRef = useRef<Record<string, (text: string) => void>>({});
  const registerDictationField = (field: string, setter: (text: string) => void) => {
    dictationSettersRef.current[field] = setter;
  };

  // Debounce: accumulate rapid-fire final results into one command
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTextRef = useRef("");

  // ── Speech Recognition Setup ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 3;

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening((curr) => {
        if (curr) {
          setTimeout(() => {
            try { recognition.start(); } catch { /* ignore */ }
          }, 100);
        }
        return curr;
      });
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.warn("[Krimsona Voice] Recognition error:", event.error);
    };

    recognition.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          // Pick highest-confidence alternative
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence;
          for (let alt = 1; alt < result.length; alt++) {
            if (result[alt].confidence > bestConfidence) {
              bestTranscript = result[alt].transcript;
              bestConfidence = result[alt].confidence;
            }
          }
          finalStr += bestTranscript;
        } else {
          interimStr += result[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript(finalStr.trim());

        // Debounce: accumulate text and process after a short pause
        accumulatedTextRef.current += " " + finalStr;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          const fullText = accumulatedTextRef.current.trim();
          accumulatedTextRef.current = "";
          if (fullText) {
            processCommandRef.current?.(fullText);
          }
        }, 400);
      } else if (interimStr) {
        setTranscript(interimStr.trim());
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { /* ignore */ }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      recognition.stop();
    };
  }, []);

  // ── Process Command ──
  const processCommand = useCallback(
    (text: string, isManual = false) => {
      const ctx = voiceContextRef.current;
      const hasTask = hasActiveTaskRef.current;
      const dictation = dictationRef.current;
      let cmd = text.toLowerCase().trim();
      let isNowSleeping = isSleepingRef.current;

      // Manual commands always bypass sleep
      if (isManual && isNowSleeping) {
        setIsSleeping(false);
        isNowSleeping = false;
      }

      // ── Wake/Sleep handling ──
      const isWakePhrase = WAKE_PHRASES.some((p) => cmd.includes(p) || fuzzyMatchAny(cmd, [p], 0.3));
      const isSleepPhrase = SLEEP_PHRASES.some((p) => cmd.includes(p) || fuzzyMatchAny(cmd, [p], 0.3));

      if (isWakePhrase) {
        if (isNowSleeping) {
          setIsSleeping(false);
          isNowSleeping = false;
        }
        // Strip wake phrase from command
        for (const p of WAKE_PHRASES) {
          const rx = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          cmd = cmd.replace(rx, " ");
        }
        cmd = cmd.replace(/\s+/g, " ").trim();

        if (cmd.length <= 3) {
          speak("Systems online. Awaiting your command.");
          return;
        }
        // Fall through with remaining command
      }

      if (isNowSleeping) return;

      if (isSleepPhrase && !isWakePhrase) {
        setIsSleeping(true);
        speak("Going to sleep. Say wake up when you need me.");
        return;
      }

      // ── Cancel handling ──
      if (ctx !== "IDLE" && CANCEL_PHRASES.some((p) => cmd.includes(p) || fuzzyMatch(cmd, p, 0.3))) {
        setVoiceContext("IDLE");
        speak("Cancelled. Awaiting command.");
        return;
      }

      // ── Dictation mode ──
      if (dictation) {
        dictationSettersRef.current[dictation]?.(cmd);
        return;
      }

      // ── Context-driven conversation states ──
      if (ctx === "AWAITING_TITLE" && cmd.trim()) {
        const cleanTitle = stripFillers(cmd).trim();
        if (cleanTitle.length > 0) {
          onStartTask(cleanTitle);
          speak("Task started. What's the plan? Say skip to continue without one.");
          setVoiceContext("AWAITING_PLAN");
        }
        return;
      }

      if (ctx === "AWAITING_PLAN" && cmd.trim()) {
        const skipRx = /^(skip|none|no|nothing|no plan|pass|nah|nope|go ahead|just start)/i;
        if (skipRx.test(cmd.trim())) {
          speak("Skipped plan.");
        } else {
          onUpdatePlan(stripFillers(cmd).trim());
          speak("Plan recorded.");
        }
        setVoiceContext("IDLE");
        return;
      }

      if (ctx === "AWAITING_NOTE" && cmd.trim()) {
        const skipRx = /^(skip|none|no|cancel|nevermind|never mind|forget it)/i;
        if (skipRx.test(cmd.trim())) {
          speak("Note cancelled.");
        } else {
          onAppendNote(stripFillers(cmd).trim());
          speak("Note appended.");
        }
        setVoiceContext("IDLE");
        return;
      }

      if (ctx === "AWAITING_SUMMARY" && cmd.trim()) {
        onSummary(stripFillers(cmd).trim());
        speak("Summary recorded. What's the commit ID? Say skip to finish without one.");
        setVoiceContext("AWAITING_COMMIT");
        return;
      }

      if (ctx === "AWAITING_COMMIT" && cmd.trim()) {
        const skipRx = /^(skip|none|no|nothing|pass|no commit|nah|nope)/i;
        if (skipRx.test(cmd.trim())) {
          onCommit("skip");
        } else {
          onCommit(cmd.trim());
        }
        speak("Task logged successfully.");
        setVoiceContext("IDLE");
        setActiveDictationField(null);
        return;
      }

      // ── Help / Status ──
      if (containsAnyWord(cmd, ["help", "what can you do", "commands", "instructions"])) {
        const helpMsg = hasTask
          ? "You can say: stop task, add a note, or go to sleep."
          : "You can say: start task, followed by the name. Or say go to sleep.";
        speak(helpMsg);
        return;
      }

      if (containsAnyWord(cmd, ["status", "what's running", "current task", "what am i doing"])) {
        speak(hasTask ? "You have an active task running." : "No active task. Say start task to begin.");
        return;
      }

      // ── Intent scoring ──
      const { intent, score, payload } = scoreIntent(cmd);

      switch (intent) {
        case "STOP": {
          if (hasTask) {
            onStopTask();
            speak("Task concluded. Describe what you accomplished.");
            setVoiceContext("AWAITING_SUMMARY");
          } else {
            speak("No active task to stop.");
          }
          break;
        }

        case "NOTE": {
          if (hasTask) {
            if (payload && payload.length > 2) {
              onAppendNote(payload);
              speak("Note appended.");
            } else {
              speak("What's the note?");
              setVoiceContext("AWAITING_NOTE");
            }
          } else {
            speak("Please start a task first before adding notes.");
          }
          break;
        }

        case "START": {
          if (hasTask) {
            speak("A task is already running. Stop it first.");
            return;
          }
          if (payload && payload.length > 2) {
            onStartTask(payload);
            speak("Task started. What's the plan? Say skip to continue without one.");
            setVoiceContext("AWAITING_PLAN");
          } else {
            speak("What should the task be called?");
            setVoiceContext("AWAITING_TITLE");
          }
          break;
        }

        default: {
          if (cmd.trim().length > 3) {
            speak("I didn't catch that. Say start task, stop task, add a note, or help.");
          }
        }
      }
    },
    [onStartTask, onUpdatePlan, onStopTask, onAppendNote, onSummary, onCommit]
  );

  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);

  // ── Toggles ──
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      if (isSleeping) {
        setIsSleeping(false);
        speak("Systems online. I am awake.");
      } else {
        setIsListening(false);
        recognitionRef.current.stop();
        setActiveDictationField(null);
        speak("Microphone off.");
      }
    } else {
      setIsSleeping(false);
      try { recognitionRef.current.start(); } catch { /* ignore */ }
      speak("Listening.");
    }
  };

  const toggleDictation = (field: string) => {
    if (activeDictationField === field) {
      setActiveDictationField(null);
    } else {
      setActiveDictationField(field);
      if (!isListening) {
        try { recognitionRef.current?.start(); } catch { /* ignore */ }
        setIsListening(true);
        setIsSleeping(false);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(`> ${manualInput}`);
    processCommand(manualInput, true);
    setManualInput("");
  };

  const resetVoice = () => {
    setVoiceContext("IDLE");
    setActiveDictationField(null);
  };

  return {
    isListening,
    isSleeping,
    transcript,
    voiceContext,
    setVoiceContext,
    activeDictationField,
    setActiveDictationField,
    manualInput,
    setManualInput,
    toggleListening,
    toggleDictation,
    handleManualSubmit,
    registerDictationField,
    resetVoice,
    speak,
  };
}

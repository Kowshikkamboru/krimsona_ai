"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VoiceContext } from "../types";
import { WAKE_WORD } from "../types";

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
  const [isListening, setIsListening] = useState(false); // Controlled by onstart
  const [isSleeping, setIsSleeping] = useState(true);
  const [transcript, setTranscript] = useState("Awaiting command...");
  const [voiceContext, setVoiceContext] = useState<VoiceContext>("IDLE");
  const [activeDictationField, setActiveDictationField] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");

  // Refs to avoid stale closures
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

  // Dictation field setters — stored externally via register
  const dictationSettersRef = useRef<Record<string, (text: string) => void>>({});

  const registerDictationField = (field: string, setter: (text: string) => void) => {
    dictationSettersRef.current[field] = setter;
  };

  // ── Speech Recognition Setup ──
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening((curr) => {
          if (curr) {
            try { recognition.start(); } catch (e) { /* ignore */ }
          }
          return curr;
        });
      };

      recognition.onresult = (event: any) => {
        let finalStr = "";
        let interimStr = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }
        
        if (finalStr) {
          setTranscript(finalStr);
          processCommandRef.current?.(finalStr.toLowerCase());
        } else if (interimStr) {
          setTranscript(interimStr);
        }
      };

      recognitionRef.current = recognition;
      
      // Auto-start on mount in sleep mode
      try { recognition.start(); } catch (e) { /* ignore */ }
    }
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // ── Process Command ──
  const processCommand = useCallback(
    (text: string) => {
      const ctx = voiceContextRef.current;
      const task = hasActiveTaskRef.current;
      const dictation = dictationRef.current;
      const sleeping = isSleepingRef.current;
      let processedCmd = text.toLowerCase();
      let isNowSleeping = isSleepingRef.current;
      
      const wakeRx = /(wake up|wakeup|wake|hi krimsona|hey krimsona|krimsona|resume|listen)/i;
      const sleepRx = /(sleep|go to sleep|pause listening|stop listening|mute|quiet)/i;

      // Wake up logic
      if (wakeRx.test(processedCmd)) {
        if (isNowSleeping) {
          setIsSleeping(false);
          isNowSleeping = false;
          processedCmd = processedCmd.replace(wakeRx, "").trim();
          
          if (processedCmd.length <= 3) {
            speak("Systems online. I am awake.");
            return;
          }
          // If there's more to the command, let it fall through!
        } else {
          processedCmd = processedCmd.replace(wakeRx, "").trim();
          if (processedCmd.length <= 3) {
            speak("Systems online. Awaiting your command.");
            return;
          }
        }
      }

      if (isNowSleeping) {
        return; // Ignore all other commands while sleeping
      }

      if (sleepRx.test(processedCmd)) {
        setIsSleeping(true);
        speak("Going to sleep. Say wake up when you need me.");
        return;
      }

      // Dictation mode
      if (dictation) {
        dictationSettersRef.current[dictation]?.(processedCmd);
        return;
      }

      // Context-driven conversation
      if (ctx === "AWAITING_TITLE" && processedCmd.trim()) {
        onStartTask(processedCmd.trim());
        speak("Task started. What is the detailed description or plan for this task?");
        setVoiceContext("AWAITING_PLAN");
        return;
      }
      if (ctx === "AWAITING_PLAN" && processedCmd.trim()) {
        if (!processedCmd.match(/^(skip|none|no|nothing)/i)) {
          onUpdatePlan(processedCmd.trim());
          speak("Plan recorded.");
        } else {
          speak("Skipped plan.");
        }
        setVoiceContext("IDLE");
        return;
      }
      if (ctx === "AWAITING_NOTE" && processedCmd.trim()) {
        if (!processedCmd.match(/^(skip|none|no|cancel)/i)) {
          onAppendNote(processedCmd.trim());
          speak("Note appended.");
        } else {
          speak("Note cancelled.");
        }
        setVoiceContext("IDLE");
        return;
      }
      if (ctx === "AWAITING_SUMMARY" && processedCmd.trim()) {
        onSummary(processedCmd.trim());
        speak("Summary recorded. What is the commit ID? Or say skip to finish.");
        setVoiceContext("AWAITING_COMMIT");
        return;
      }
      if (ctx === "AWAITING_COMMIT" && processedCmd.trim()) {
        onCommit(processedCmd.trim());
        speak("Task logged successfully.");
        setVoiceContext("IDLE");
        setActiveDictationField(null);
        return;
      }

      // Broader command parsing for flexible intent matching (handles accents, varying phrasing)
      const startMatch = processedCmd.match(/^(?:i want to |can we |let'?s |please )?(?:start|starting|star|create|creating|begin|beginning|new|initialize|work on|working on|add|do|doing)\s*(?:a|an|the|my|some)?\s*(?:new)?\s*(?:task|work|project|issue|job)?\s*(?:called|named|about|on|for|like)?\s*(.*)/i);
      
      const stopMatch = processedCmd.match(/^(?:i want to |can we |let'?s |please )?(?:stop|end|finish|complete|completed|close|pause|done|conclude|halt|terminate|stopping|finishing)\s*(?:the|my|this|current)?\s*(?:task|work|project|issue|job)?/i);
      
      const noteMatch = processedCmd.match(/^(?:i want to |can we |let'?s |please )?(?:add|create|make|record|take|log)?\s*(?:a|an|the)?\s*(?:note|bug|issue|reminder|comment)\s*(?:saying|that|about|on|for)?\s*(.*)/i);

      if (stopMatch) {
        if (task) {
          onStopTask();
          speak("Task concluded. Fill in the details.");
          setVoiceContext("AWAITING_SUMMARY");
        } else {
          speak("No active task to stop.");
        }
      } else if (noteMatch) {
        if (task) {
          const extractedNote = noteMatch[1]?.trim();
          if (extractedNote) {
            onAppendNote(extractedNote);
            speak("Note appended.");
          } else {
            speak("What is the note?");
            setVoiceContext("AWAITING_NOTE");
          }
        } else {
          speak("Please start a task before adding notes.");
        }
      } else if (startMatch) {
        if (task) {
          speak("Task already in progress. Please conclude it first.");
          return;
        }
        const extractedTitle = startMatch[1]?.trim();
        if (!extractedTitle) {
          speak("What is the task about?");
          setVoiceContext("AWAITING_TITLE");
          return;
        }
        onStartTask(extractedTitle);
        speak("Task started. What is the detailed description or plan for this task?");
        setVoiceContext("AWAITING_PLAN");
      } else if (processedCmd.trim().length > 3) {
        speak("I didn't understand that command. You can say start task, stop task, add a note, or go to sleep.");
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
        // Wake it up manually via click
        setIsSleeping(false);
        speak("Systems online. I am awake.");
      } else {
        // Turn it completely off
        setIsListening(false);
        recognitionRef.current.stop();
        setActiveDictationField(null);
        speak("Microphone off.");
      }
    } else {
      // Turn on and ensure it's awake
      setIsSleeping(false);
      try { recognitionRef.current.start(); } catch (e) { /* ignore */ }
      speak("Listening.");
    }
  };

  const toggleDictation = (field: string) => {
    if (activeDictationField === field) {
      setActiveDictationField(null);
    } else {
      setActiveDictationField(field);
      if (!isListening) {
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(`Manual: ${manualInput}`);
    processCommand(manualInput);
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

// ── TTS helper (module-level) ──
export function speak(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
}

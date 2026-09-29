"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import MicButton from "./MicButton";

interface StartModalProps {
  activeDictationField: string | null;
  onToggleDictation: (field: string) => void;
  onClose: () => void;
  onStart: (title: string, plan: string) => void;
  registerDictationField: (field: string, setter: (text: string) => void) => void;
}

export default function StartModal({
  activeDictationField,
  onToggleDictation,
  onClose,
  onStart,
  registerDictationField,
}: StartModalProps) {
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    registerDictationField("newTaskTitle", (text: string) => setTitle((p) => (p + " " + text).trim()));
    registerDictationField("newTaskPlan", (text: string) => setPlan((p) => (p + " " + text).trim()));
  }, [registerDictationField]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-extrabold text-slate-800 mb-1">Initialize Context</h2>
        <p className="text-slate-400 text-sm mb-6">Define the task objective and optional description.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span>Task Title</span>
              <MicButton field="newTaskTitle" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-slate-400 font-medium"
              placeholder="e.g. Auth API Debugging..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span>Plan — What are you going to work on?</span>
              <MicButton field="newTaskPlan" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
            </label>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-slate-400 text-sm h-20 resize-none"
              placeholder="e.g. Fix the login page bug on mobile, refactor auth module..."
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onStart(title, plan)}
              disabled={!title.trim()}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" /> Start Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

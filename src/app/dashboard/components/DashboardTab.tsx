"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Square,
  Pencil,
  Plus,
  BarChart3,
  Timer,
  GitCommit,
} from "lucide-react";
import type { Task } from "../types";

interface DashboardTabProps {
  activeTask: Task | null;
  tasks: Task[];
  timerText: string;
  isListening: boolean;
  isSleeping: boolean;
  transcript: string;
  voiceContext: string;
  totalH: string;
  totalM: string;
  totalS: string;
  commitCount: number;
  onToggleListening: () => void;
  onManualStop: () => void;
  onOpenStartModal: () => void;
  onUpdateActiveTitle: (title: string) => void;
}

export default function DashboardTab({
  activeTask,
  tasks,
  timerText,
  isListening,
  isSleeping,
  transcript,
  voiceContext,
  totalH,
  totalM,
  totalS,
  commitCount,
  onToggleListening,
  onManualStop,
  onOpenStartModal,
  onUpdateActiveTitle,
}: DashboardTabProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState("");

  const saveTitle = () => {
    onUpdateActiveTitle(editValue);
    setEditingTitle(false);
  };

  return (
    <>
      {/* ── Active Task Card ── */}
      {activeTask ? (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-8 border-l-[6px] border-l-rose-500">
          <div className="flex justify-between items-center mb-5">
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-md">
              Active Context
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-xs">#{activeTask.id}</span>
              <button
                onClick={onManualStop}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" /> Stop
              </button>
              <button
                onClick={onToggleListening}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? isSleeping
                      ? "bg-slate-700 text-slate-300"
                      : "bg-rose-100 text-rose-600"
                    : "bg-slate-100 text-slate-400 hover:text-slate-600"
                }`}
              >
                {isListening ? (
                  <Mic className={`w-4 h-4 ${isSleeping ? "" : "animate-pulse"}`} />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Editable Title */}
          {editingTitle ? (
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-grow text-2xl font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <button onClick={saveTitle} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold">
                Save
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                className="text-slate-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4 group">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {activeTask.title}
              </h2>
              <button
                onClick={() => {
                  setEditingTitle(true);
                  setEditValue(activeTask.title);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTask.description && (
            <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">
                Plan / Objective
              </p>
              <p className="text-sm text-blue-700">{activeTask.description}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-slate-500 text-sm">
            {voiceContext === "AWAITING_PLAN" && <span className="text-blue-500 font-bold mr-2">[Waiting for Plan — say &quot;skip&quot; to skip]</span>}
            {voiceContext === "AWAITING_NOTE" && <span className="text-amber-500 font-bold mr-2">[Waiting for Note — say &quot;cancel&quot; to cancel]</span>}
            {voiceContext === "AWAITING_SUMMARY" && <span className="text-emerald-500 font-bold mr-2">[Describe what you accomplished]</span>}
            {voiceContext === "AWAITING_COMMIT" && <span className="text-purple-500 font-bold mr-2">[Commit ID? — say &quot;skip&quot; to finish]</span>}
            &ldquo;{transcript}&rdquo;
          </div>

          {activeTask.notes?.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Notes
              </h4>
              {activeTask.notes.map((n: string, i: number) => (
                <p key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span> {n}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-16 mb-8 flex flex-col items-center justify-center border-l-[6px] border-l-slate-200">
          <button
            onClick={onToggleListening}
            className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm border border-slate-200 mb-5 relative"
          >
            {isListening && (
              <span className={`absolute inset-0 rounded-full border-2 ${isSleeping ? "border-slate-400" : "border-rose-400 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"}`} />
            )}
            <Mic className={`w-8 h-8 ${isListening ? (isSleeping ? "text-slate-500" : "text-rose-500") : ""}`} />
          </button>
          <h2 className="text-xl font-bold text-slate-400 mb-1">{isSleeping ? "Sleeping..." : "No Active Context"}</h2>
          <p className="text-slate-500 text-sm mb-6">
            {isSleeping ? "Say 'wake up' or 'hi krimsona' to resume." : "Click the microphone or say 'Start task' to begin."}
          </p>
          <button
            onClick={onOpenStartModal}
            className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
          {isListening && (
            <p className={`mt-6 font-mono text-xs px-4 py-2 rounded-lg border ${isSleeping ? "text-slate-500 bg-slate-100 border-slate-200" : "text-rose-500 bg-rose-50 border-rose-100"}`}>
              {isSleeping ? (
                "Zzz... (Say \"wake up\" or \"hey krimsona\")"
              ) : voiceContext === "AWAITING_TITLE" ? (
                <span className="text-blue-600 font-bold">What should the task be called? (Speak or type below)</span>
              ) : voiceContext === "AWAITING_PLAN" ? (
                <span className="text-blue-600 font-bold">What&apos;s the plan? (Say &quot;skip&quot; to continue)</span>
              ) : (
                `Listening: ${transcript}`
              )}
            </p>
          )}
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Tasks Today</p>
            <p className="text-xl font-bold text-slate-800">{tasks.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Timer className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Logged</p>
            <p className="text-xl font-bold text-slate-800">{totalH}h {totalM}m {totalS}s</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <GitCommit className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Commits</p>
            <p className="text-xl font-bold text-slate-800">{commitCount}</p>
          </div>
        </div>
      </div>

      {/* ── Recent Tasks Preview ── */}
      {tasks.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <h4 className="text-slate-700 font-semibold">{t.title}</h4>
                  {t.proof?.commitId && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {t.proof.commitId}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-sm">{t.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

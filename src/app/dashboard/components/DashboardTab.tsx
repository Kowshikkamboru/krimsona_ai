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
  Trash2,
  Check,
  X,
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
  onAddObjective: (text: string) => void;
  onUpdateObjective: (index: number, text: string) => void;
  onRemoveObjective: (index: number) => void;
  onUpdateNote: (index: number, text: string) => void;
  onRemoveNote: (index: number) => void;
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
  onAddObjective,
  onUpdateObjective,
  onRemoveObjective,
  onUpdateNote,
  onRemoveNote,
}: DashboardTabProps) {
  // Title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState("");

  // Objective editing
  const [editingObjIdx, setEditingObjIdx] = useState<number | null>(null);
  const [editObjValue, setEditObjValue] = useState("");
  const [addingObjective, setAddingObjective] = useState(false);
  const [newObjValue, setNewObjValue] = useState("");

  // Note editing
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");

  const saveTitle = () => {
    if (editValue.trim()) onUpdateActiveTitle(editValue.trim());
    setEditingTitle(false);
  };

  const saveObjective = (idx: number) => {
    if (editObjValue.trim()) onUpdateObjective(idx, editObjValue.trim());
    setEditingObjIdx(null);
  };

  const addNewObjective = () => {
    if (newObjValue.trim()) {
      onAddObjective(newObjValue.trim());
      setNewObjValue("");
      setAddingObjective(false);
    }
  };

  const saveNote = (idx: number) => {
    if (editNoteValue.trim()) onUpdateNote(idx, editNoteValue.trim());
    setEditingNoteIdx(null);
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

          {/* ── Editable Title ── */}
          {editingTitle ? (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                className="flex-grow text-2xl font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-rose-500"
                autoFocus
              />
              <button onClick={saveTitle} className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingTitle(false)} className="text-slate-400 p-2 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4 group">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {activeTask.title}
              </h2>
              <button
                onClick={() => { setEditingTitle(true); setEditValue(activeTask.title); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Objectives (multiple, editable) ── */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Objectives / Plan
              </p>
              <button
                onClick={() => setAddingObjective(true)}
                className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {activeTask.objectives.length === 0 && !addingObjective ? (
              <button
                onClick={() => setAddingObjective(true)}
                className="w-full bg-blue-50 border border-dashed border-blue-200 rounded-xl p-3 text-sm text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add an objective or plan
              </button>
            ) : (
              <div className="space-y-2">
                {activeTask.objectives.map((obj, idx) => (
                  <div key={idx} className="group">
                    {editingObjIdx === idx ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editObjValue}
                          onChange={(e) => setEditObjValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveObjective(idx); if (e.key === "Escape") setEditingObjIdx(null); }}
                          className="flex-grow bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button onClick={() => saveObjective(idx)} className="text-blue-600 p-1.5 rounded-lg hover:bg-blue-50">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingObjIdx(null)} className="text-slate-400 p-1.5 rounded-lg hover:bg-slate-100">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-grow min-w-0">
                          <span className="text-blue-300 font-mono text-xs font-bold mt-0.5 shrink-0">{idx + 1}.</span>
                          <p className="text-sm text-blue-700 break-words">{obj}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-2 shrink-0 transition-opacity">
                          <button
                            onClick={() => { setEditingObjIdx(idx); setEditObjValue(obj); }}
                            className="p-1 text-blue-400 hover:text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onRemoveObjective(idx)}
                            className="p-1 text-blue-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add new objective inline */}
            {addingObjective && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newObjValue}
                  onChange={(e) => setNewObjValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addNewObjective(); if (e.key === "Escape") { setAddingObjective(false); setNewObjValue(""); } }}
                  className="flex-grow bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-blue-300"
                  placeholder="Type objective..."
                  autoFocus
                />
                <button onClick={addNewObjective} className="text-blue-600 p-1.5 rounded-lg hover:bg-blue-50">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setAddingObjective(false); setNewObjValue(""); }} className="text-slate-400 p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ── Transcript ── */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-slate-500 text-sm">
            {voiceContext === "AWAITING_PLAN" && <span className="text-blue-500 font-bold mr-2">[Waiting for Plan — say &quot;skip&quot; to skip]</span>}
            {voiceContext === "AWAITING_NOTE" && <span className="text-amber-500 font-bold mr-2">[Waiting for Note — say &quot;cancel&quot; to cancel]</span>}
            {voiceContext === "AWAITING_SUMMARY" && <span className="text-emerald-500 font-bold mr-2">[Describe what you accomplished]</span>}
            {voiceContext === "AWAITING_COMMIT" && <span className="text-purple-500 font-bold mr-2">[Commit ID? — say &quot;skip&quot; to finish]</span>}
            {voiceContext === "AWAITING_RENAME" && <span className="text-orange-500 font-bold mr-2">[Say new task name]</span>}
            {voiceContext === "AWAITING_EDIT_OBJECTIVE" && <span className="text-blue-500 font-bold mr-2">[Say new objective text]</span>}
            {voiceContext === "AWAITING_EDIT_NOTE" && <span className="text-amber-500 font-bold mr-2">[Say new note text]</span>}
            &ldquo;{transcript}&rdquo;
          </div>

          {/* ── Notes (editable) ── */}
          {activeTask.notes?.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Notes
              </h4>
              {activeTask.notes.map((n: string, i: number) => (
                <div key={i} className="group">
                  {editingNoteIdx === i ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNoteValue}
                        onChange={(e) => setEditNoteValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveNote(i); if (e.key === "Escape") setEditingNoteIdx(null); }}
                        className="flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-rose-500"
                        autoFocus
                      />
                      <button onClick={() => saveNote(i)} className="text-emerald-600 p-1 rounded hover:bg-emerald-50">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingNoteIdx(null)} className="text-slate-400 p-1 rounded hover:bg-slate-100">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600 flex items-start gap-2 py-0.5">
                      <span className="text-rose-400 mt-0.5 shrink-0">•</span>
                      <span className="flex-grow break-words">{n}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                        <button
                          onClick={() => { setEditingNoteIdx(i); setEditNoteValue(n); }}
                          className="p-0.5 text-slate-400 hover:text-blue-500 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemoveNote(i)}
                          className="p-0.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
            {isSleeping ? "Say 'wake up' or 'hey krimsona' to resume." : "Click the microphone or say 'Start task' to begin."}
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

"use client";

import { useState } from "react";
import { Calendar, Clock, GitCommit, Pencil, Trash2, Link as LinkIcon, Image as ImageIcon, Timer } from "lucide-react";
import type { Task } from "../types";

interface TimelineTabProps {
  tasks: Task[];
  onUpdateTitle: (taskId: number, newTitle: string) => void;
  onDeleteTask: (taskId: number) => void;
}

export default function TimelineTab({ tasks, onUpdateTitle, onDeleteTask }: TimelineTabProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const saveEditTitle = (taskId: number) => {
    onUpdateTitle(taskId, editTitle);
    setEditingTaskId(null);
  };

  // Group tasks by date
  const grouped: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.start_time);
    const key = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });
  const dateKeys = Object.keys(grouped);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-rose-500" /> Timeline
        </h2>
        <p className="text-sm text-slate-400 font-mono">
          {tasks.length} entries · {dateKeys.length} day{dateKeys.length !== 1 ? "s" : ""}
        </p>
      </div>
      
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No tasks logged yet. Start your first task!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dateKeys.map((dateLabel) => {
            const dayTasks = grouped[dateLabel];
            const dayTotal = dayTasks.reduce((acc, t) => {
              if (!t.duration) return acc;
              const p = t.duration.split(":").map(Number);
              return acc + (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
            }, 0);
            const dH = Math.floor(dayTotal / 3600);
            const dM = Math.floor((dayTotal % 3600) / 60);
            const dS = dayTotal % 60;

            return (
              <div key={dateLabel}>
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-2.5 shadow-sm">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-slate-800 text-sm">{dateLabel}</span>
                  </div>
                  <div className="h-px bg-slate-200 flex-grow" />
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""} · {dH}h {dM.toString().padStart(2, "0")}m {dS.toString().padStart(2, "0")}s
                  </span>
                </div>

                {/* Tasks for this date */}
                <div className="space-y-3 ml-2 border-l-2 border-slate-200 pl-6">
                  {dayTasks.map((t) => (
                    <div key={t.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                      {/* Time dot on the border line */}
                      <div className="absolute -left-[31px] top-6 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-[0_0_6px_rgba(52,211,153,0.5)]" />

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-grow">
                          {editingTaskId === t.id ? (
                            <div className="flex items-center gap-2 flex-grow">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-grow text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500"
                                autoFocus
                              />
                              <button onClick={() => saveEditTitle(t.id)} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Save</button>
                              <button onClick={() => setEditingTaskId(null)} className="text-slate-400 text-xs font-bold hover:text-slate-600">Cancel</button>
                            </div>
                          ) : (
                            <h4 className="text-base font-bold text-slate-800">{t.title}</h4>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {t.proof?.commitId && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              <GitCommit className="w-3 h-3 text-rose-500" /> {t.proof.commitId}
                            </span>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={() => { setEditingTaskId(t.id); setEditTitle(t.title); }}
                              className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(t.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Time Row */}
                      <div className="flex items-center gap-4 mb-3 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock className="w-3 h-3 text-emerald-500" />
                          <span className="font-mono font-bold text-emerald-600">{formatTime(t.start_time)}</span>
                        </span>
                        <span className="text-slate-300">→</span>
                        <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span className="font-mono font-bold text-rose-600">{t.end_time ? formatTime(t.end_time) : "—"}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1.5 text-slate-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                          <Timer className="w-3 h-3 text-rose-500" />
                          <span className="font-mono font-bold text-rose-600">{t.duration}</span>
                        </span>
                      </div>

                      {t.objectives && t.objectives.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Objectives</p>
                          {t.objectives.map((obj: string, oi: number) => (
                            <p key={oi} className="text-sm text-blue-700">{t.objectives.length > 1 ? `${oi + 1}. ` : ""}{obj}</p>
                          ))}
                        </div>
                      )}
                      {t.proof?.description && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Accomplished</p>
                          <p className="text-sm text-emerald-700">{t.proof.description}</p>
                        </div>
                      )}
                      {t.proof?.repoLink && (
                        <a href={t.proof.repoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> {t.proof.repoLink}
                        </a>
                      )}
                      {t.proof?.attachmentName && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <ImageIcon className="w-3 h-3" /> {t.proof.attachmentName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

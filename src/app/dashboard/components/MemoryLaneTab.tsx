"use client";

import { useState } from "react";
import { Brain, Search, GitCommit, Link as LinkIcon } from "lucide-react";
import type { Task } from "../types";

interface MemoryLaneTabProps {
  tasks: Task[];
}

export default function MemoryLaneTab({ tasks }: MemoryLaneTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMemory = searchQuery.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.proof?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.proof?.commitMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <Brain className="w-6 h-6 text-rose-500" /> Memory Lane
      </h2>
      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, commits, summaries..."
          className="w-full bg-white border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 shadow-sm"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
      </div>
      
      {filteredMemory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <Brain className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">
            {searchQuery ? "No matching results found." : "Your memory lane is empty. Complete tasks to populate it."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemory.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800">{t.title}</h4>
                <span className="text-slate-400 font-mono text-xs">{t.duration}</span>
              </div>
              {t.proof?.description && <p className="text-sm text-slate-600 mb-2">{t.proof.description}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                {t.proof?.commitId && (
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                    <GitCommit className="w-3 h-3 text-rose-400" /> {t.proof.commitId}
                  </span>
                )}
                {t.proof?.commitMessage && (
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {t.proof.commitMessage}
                  </span>
                )}
                {t.proof?.repoLink && (
                  <a href={t.proof.repoLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> repo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

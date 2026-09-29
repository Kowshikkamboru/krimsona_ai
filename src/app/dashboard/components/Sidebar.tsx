"use client";

import {
  Layers,
  AlignLeft,
  Brain,
  GitMerge,
  Activity,
  TerminalSquare,
} from "lucide-react";
import type { TabName } from "../types";

interface SidebarProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
  taskCount: number;
  totalH: string;
  totalM: string;
  totalS: string;
  manualInput: string;
  onManualInputChange: (val: string) => void;
  onManualSubmit: (e: React.FormEvent) => void;
}

const NAV_ITEMS: { id: TabName; icon: typeof Layers; label: string }[] = [
  { id: "dashboard", icon: Layers, label: "DASHBOARD" },
  { id: "timeline", icon: AlignLeft, label: "TIMELINE" },
  { id: "memory_lane", icon: Brain, label: "MEMORY LANE" },
  { id: "exports", icon: GitMerge, label: "EXPORTS" },
];

export default function Sidebar({
  currentTab,
  onTabChange,
  taskCount,
  totalH,
  totalM,
  totalS,
  manualInput,
  onManualInputChange,
  onManualSubmit,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 h-screen fixed top-0 left-0 flex flex-col shadow-2xl z-40">
      {/* Logo */}
      <div className="p-6 mb-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
          <Activity className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm tracking-wide">KRIMSONA</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">AI Task Engine</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 flex-grow">
        {NAV_ITEMS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all border-l-2 text-sm tracking-widest ${
              currentTab === tab.id
                ? "bg-white/5 text-white border-rose-500 shadow-sm"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border-transparent"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Session Stats */}
      <div className="px-4 mb-4">
        <div className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Session Stats</p>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">{taskCount} tasks</span>
            <span className="text-rose-400 font-mono text-xs font-bold">{totalH}h {totalM}m {totalS}s</span>
          </div>
        </div>
      </div>

      {/* Terminal Input */}
      <div className="px-4 pb-4">
        <form onSubmit={onManualSubmit} className="relative">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => onManualInputChange(e.target.value)}
            placeholder="> Command..."
            className="w-full bg-[#1e293b] border border-slate-700/50 rounded-lg py-2.5 px-3 pl-8 text-slate-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono text-xs placeholder:text-slate-600"
          />
          <TerminalSquare className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-3" />
        </form>
      </div>
    </aside>
  );
}

"use client";

import { Mic } from "lucide-react";

interface MicButtonProps {
  field: string;
  activeDictationField: string | null;
  onToggle: (field: string) => void;
  size?: string;
}

export default function MicButton({
  field,
  activeDictationField,
  onToggle,
  size = "w-3.5 h-3.5",
}: MicButtonProps) {
  return (
    <button
      onClick={() => onToggle(field)}
      className={`p-1 rounded-md transition-all border ${
        activeDictationField === field
          ? "bg-rose-100 text-rose-600 border-rose-200 animate-pulse shadow-sm"
          : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
      title="Voice input"
    >
      <Mic className={size} />
    </button>
  );
}

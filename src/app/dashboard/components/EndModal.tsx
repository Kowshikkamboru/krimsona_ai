"use client";

import { useEffect } from "react";
import { X, CheckCircle, ClipboardList, GitCommit, MessageSquare, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import MicButton from "./MicButton";
import type { Task, TaskProof } from "../types";

interface EndModalProps {
  task: Task | null;
  proofData: TaskProof;
  setProofData: (data: TaskProof) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  activeDictationField: string | null;
  onToggleDictation: (field: string) => void;
  onClose: () => void;
  onSave: () => void;
  registerDictationField: (field: string, setter: (text: string) => void) => void;
}

export default function EndModal({
  task,
  proofData,
  setProofData,
  attachedFile,
  setAttachedFile,
  activeDictationField,
  onToggleDictation,
  onClose,
  onSave,
  registerDictationField,
}: EndModalProps) {
  useEffect(() => {
    registerDictationField("summary", (text: string) => setProofData({ ...proofData, description: (proofData.description + " " + text).trim() }));
    registerDictationField("commitId", (text: string) => setProofData({ ...proofData, commitId: (proofData.commitId + " " + text).trim().replace(/\\s+/g, "") }));
    registerDictationField("commitMessage", (text: string) => setProofData({ ...proofData, commitMessage: (proofData.commitMessage + " " + text).trim() }));
    registerDictationField("repoLink", (text: string) => setProofData({ ...proofData, repoLink: (proofData.repoLink + " " + text).trim().replace(/\\s+/g, "") }));
  }, [proofData, setProofData, registerDictationField]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-slate-800 mb-1">Conclude Context</h2>
        <p className="text-slate-400 text-sm mb-5 flex justify-between border-b border-slate-100 pb-3">
          <span>
            Task: <strong className="text-rose-600">{task?.title}</strong>
          </span>
          <span className="font-mono bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 font-bold text-xs">
            {task?.duration}
          </span>
        </p>

        <div className="space-y-4">
          {/* Summary */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-rose-500" /> Activity Summary
              </span>
              <MicButton field="summary" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
            </label>
            <textarea
              value={proofData.description}
              onChange={(e) => setProofData({ ...proofData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all placeholder:text-slate-400 h-20 resize-none text-sm"
              placeholder="What did you accomplish?"
            />
          </div>

          {/* Dev Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="devToggle"
              checked={proofData.isDevelopment}
              onChange={(e) => setProofData({ ...proofData, isDevelopment: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-600"
            />
            <label htmlFor="devToggle" className="text-sm font-bold text-slate-600 cursor-pointer">
              This task is related to GitHub / Development
            </label>
          </div>

          {proofData.isDevelopment ? (
            <div className="space-y-4 border-l-2 border-rose-200 pl-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5 text-rose-500" /> Commit ID
                    </span>
                    <MicButton field="commitId" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
                  </label>
                  <input
                    type="text"
                    value={proofData.commitId}
                    onChange={(e) => setProofData({ ...proofData, commitId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-mono text-sm"
                    placeholder="e.g. a1b2c3d"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-rose-500" /> Commit Msg
                    </span>
                    <MicButton field="commitMessage" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
                  </label>
                  <input
                    type="text"
                    value={proofData.commitMessage}
                    onChange={(e) => setProofData({ ...proofData, commitMessage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-mono text-sm"
                    placeholder="e.g. Fix auth bug"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-rose-500" /> Repository Link
                  </span>
                  <MicButton field="repoLink" activeDictationField={activeDictationField} onToggle={onToggleDictation} />
                </label>
                <input
                  type="text"
                  value={proofData.repoLink}
                  onChange={(e) => setProofData({ ...proofData, repoLink: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("file-upload")?.click()}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-100 transition cursor-pointer"
            >
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">
                {attachedFile ? attachedFile.name : "Attach Proof"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {attachedFile ? "Click to change" : "Screenshots, voice notes, emails…"}
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*,audio/*,.pdf,.eml"
                onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            {!proofData.isDevelopment && (
              <button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition font-bold"
              >
                <ImageIcon className="w-3.5 h-3.5" /> {attachedFile ? "Change" : "Attach"}
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition flex items-center gap-2 text-sm uppercase tracking-widest"
            >
              <CheckCircle className="w-4 h-4" /> Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

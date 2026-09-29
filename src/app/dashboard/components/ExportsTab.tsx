"use client";

import { FileText, Download, CheckCircle } from "lucide-react";
import { speak } from "../hooks/useVoiceEngine";
import type { Task } from "../types";

interface ExportsTabProps {
  tasks: Task[];
}

export default function ExportsTab({ tasks }: ExportsTabProps) {
  const exportCSV = () => {
    if (!tasks.length) { speak("No tasks to export."); return; }
    const headers = ["ID", "Title", "Description", "Status", "Start", "End", "Duration", "Summary", "Commit ID", "Commit Msg", "Repo Link", "Attachment"];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.status,
      t.start_time,
      t.end_time || "",
      t.duration || "",
      `"${(t.proof?.description || "").replace(/"/g, '""')}"`,
      t.proof?.commitId || "",
      `"${(t.proof?.commitMessage || "").replace(/"/g, '""')}"`,
      t.proof?.repoLink || "",
      t.proof?.attachmentName || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `krimsona_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    speak("CSV exported.");
  };

  const exportJSON = () => {
    if (!tasks.length) { speak("No tasks to export."); return; }
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `krimsona_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    speak("JSON exported.");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <FileText className="w-6 h-6 text-rose-500" /> Export Data
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">CSV Report</h3>
          <p className="text-sm text-slate-500 mb-6">Spreadsheet-friendly format for timesheets, invoicing, and HR systems.</p>
          <button
            onClick={exportCSV}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mx-auto text-sm"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">JSON Backup</h3>
          <p className="text-sm text-slate-500 mb-6">Full data backup with all metadata. Import into other tools or restore later.</p>
          <button
            onClick={exportJSON}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mx-auto text-sm"
          >
            <Download className="w-4 h-4" /> Download JSON
          </button>
        </div>
      </div>
      
      {tasks.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Preview ({tasks.length} entries)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-slate-400 font-bold text-xs uppercase">Title</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-bold text-xs uppercase">Duration</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-bold text-xs uppercase">Commit</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-bold text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 10).map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700 font-medium">{t.title}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-xs">{t.duration}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-xs">{t.proof?.commitId || "—"}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

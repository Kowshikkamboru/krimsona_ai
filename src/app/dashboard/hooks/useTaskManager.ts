"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Task, TaskProof, VoiceContext } from "../types";
import { WAKE_WORD, EMPTY_PROOF } from "../types";

// ────────────────────────────────────────────────────────────────────────────────
// useTaskManager — all task CRUD, timer, and persistence logic
// ────────────────────────────────────────────────────────────────────────────────
export function useTaskManager() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timerText, setTimerText] = useState("00:00:00");
  const [tempCompletedTask, setTempCompletedTask] = useState<Task | null>(null);
  const [proofData, setProofData] = useState<TaskProof>({ ...EMPTY_PROOF });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const timerIntervalRef = useRef<any>(null);

  // ── Load from localStorage ──
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("krimsona_tasks") || "[]");
    const savedActive = JSON.parse(localStorage.getItem("krimsona_active") || "null");
    // Migrate legacy tasks: convert description string to objectives array
    const migrateTasks = (list: any[]) => list.map((t: any) => {
      if (t.description !== undefined && t.objectives === undefined) {
        const obj = t.description ? [t.description] : [];
        const { description, ...rest } = t;
        return { ...rest, objectives: obj };
      }
      return t;
    });
    setTasks(migrateTasks(savedTasks));
    if (savedActive) {
      const [migrated] = migrateTasks([savedActive]);
      setActiveTask(migrated);
    }
  }, []);

  // ── Persist ──
  useEffect(() => {
    localStorage.setItem("krimsona_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("krimsona_active", JSON.stringify(activeTask));
  }, [activeTask]);

  // ── Timer ──
  useEffect(() => {
    if (activeTask) {
      timerIntervalRef.current = setInterval(() => {
        const start = new Date(activeTask.start_time).getTime();
        const diff = Date.now() - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        setTimerText(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimerText("00:00:00");
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTask]);

  // ── Start ──
  const startTask = (title: string, plan = "") => {
    setActiveTask({
      id: Math.floor(1000 + Math.random() * 9000),
      title: title || "Untitled Task",
      objectives: plan ? [plan] : [],
      start_time: new Date().toISOString(),
      end_time: null,
      duration: "00:00:00",
      notes: [],
      status: "In Progress",
    });
  };

  // ── Stop (voice path) ──
  const triggerStopTask = () => {
    if (!activeTask) return;
    setTempCompletedTask({
      ...activeTask,
      end_time: new Date().toISOString(),
      duration: timerText,
    });
    setProofData({ ...EMPTY_PROOF });
    setAttachedFile(null);
    setActiveTask(null);
  };

  // ── Stop (manual modal) ──
  const openManualStopModal = () => {
    if (!activeTask) return;
    setTempCompletedTask({
      ...activeTask,
      end_time: new Date().toISOString(),
      duration: timerText,
    });
    setProofData({ ...EMPTY_PROOF });
    setAttachedFile(null);
    setActiveTask(null);
  };

  // ── Save completed task (voice path) ──
  const completeAndSaveTask = (commitSpeech: string) => {
    let commitId = "";
    if (!commitSpeech.toLowerCase().includes("skip")) {
      commitId = commitSpeech.replace(/commit|id|is/g, "").trim().replace(/\s+/g, "");
    }
    setProofData((prev) => {
      const finalProof: TaskProof = { ...prev, commitId, attachmentName: attachedFile?.name };
      setTasks((prevTasks) => {
        if (!tempCompletedTask) return prevTasks;
        return [{ ...tempCompletedTask, status: "Completed" as const, proof: finalProof }, ...prevTasks];
      });
      return finalProof;
    });
    setTempCompletedTask(null);
  };

  // ── Save completed task (manual path) ──
  const saveCompletedTask = () => {
    if (!tempCompletedTask) return;
    const finalProof: TaskProof = { ...proofData, attachmentName: attachedFile?.name };
    setTasks((prev) => [{ ...tempCompletedTask, status: "Completed" as const, proof: finalProof }, ...prev]);
    setTempCompletedTask(null);
  };

  // ── Edit title (timeline) ──
  const updateTaskTitle = (taskId: number, newTitle: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)));
  };

  // ── Edit active title ──
  const updateActiveTitle = (newTitle: string) => {
    setActiveTask((prev) => (prev ? { ...prev, title: newTitle } : prev));
  };

  // ── Objectives (multiple) ──
  const addObjective = (text: string) => {
    setActiveTask((prev) => {
      if (!prev) return prev;
      return { ...prev, objectives: [...prev.objectives, text] };
    });
  };

  const updateObjective = (index: number, text: string) => {
    setActiveTask((prev) => {
      if (!prev) return prev;
      const updated = [...prev.objectives];
      updated[index] = text;
      return { ...prev, objectives: updated };
    });
  };

  const removeObjective = (index: number) => {
    setActiveTask((prev) => {
      if (!prev) return prev;
      return { ...prev, objectives: prev.objectives.filter((_, i) => i !== index) };
    });
  };

  // ── Legacy compatibility wrapper ──
  const updateActivePlan = (newPlan: string) => {
    addObjective(newPlan);
  };

  // ── Delete ──
  const deleteTask = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // ── Notes ──
  const appendNote = (note: string) => {
    setActiveTask((prev: any) => {
      if (!prev) return prev;
      return { ...prev, notes: [...prev.notes, `[${new Date().toLocaleTimeString()}] ${note}`] };
    });
  };

  const updateNote = (index: number, text: string) => {
    setActiveTask((prev) => {
      if (!prev) return prev;
      const updated = [...prev.notes];
      updated[index] = text;
      return { ...prev, notes: updated };
    });
  };

  const removeNote = (index: number) => {
    setActiveTask((prev) => {
      if (!prev) return prev;
      return { ...prev, notes: prev.notes.filter((_, i) => i !== index) };
    });
  };

  // ── Computed stats ──
  const totalTimeToday = tasks.reduce((acc, t) => {
    if (!t.duration) return acc;
    const parts = t.duration.split(":").map(Number);
    return acc + (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }, 0);
  const totalH = Math.floor(totalTimeToday / 3600).toString().padStart(2, "0");
  const totalM = Math.floor((totalTimeToday % 3600) / 60).toString().padStart(2, "0");
  const totalS = (totalTimeToday % 60).toString().padStart(2, "0");
  const commitCount = tasks.filter((t) => t.proof?.commitId).length;

  return {
    activeTask,
    setActiveTask,
    tasks,
    timerText,
    tempCompletedTask,
    proofData,
    setProofData,
    attachedFile,
    setAttachedFile,
    startTask,
    triggerStopTask,
    openManualStopModal,
    completeAndSaveTask,
    saveCompletedTask,
    updateTaskTitle,
    updateActiveTitle,
    addObjective,
    updateObjective,
    removeObjective,
    updateActivePlan,
    deleteTask,
    appendNote,
    updateNote,
    removeNote,
    totalH,
    totalM,
    totalS,
    commitCount,
  };
}

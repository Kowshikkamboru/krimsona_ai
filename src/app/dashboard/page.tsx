"use client";

import { useState } from "react";
import type { TabName } from "./types";
import { useTaskManager } from "./hooks/useTaskManager";
import { useVoiceEngine } from "./hooks/useVoiceEngine";

import Sidebar from "./components/Sidebar";
import DashboardTab from "./components/DashboardTab";
import TimelineTab from "./components/TimelineTab";
import MemoryLaneTab from "./components/MemoryLaneTab";
import ExportsTab from "./components/ExportsTab";
import StartModal from "./components/StartModal";
import EndModal from "./components/EndModal";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<TabName>("dashboard");
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // ── 1. Init Task Manager ──
  const taskManager = useTaskManager();

  // ── 2. Init Voice Engine ──
  const voiceEngine = useVoiceEngine({
    hasActiveTask: !!taskManager.activeTask,
    onStartTask: (title) => {
      taskManager.startTask(title);
      setShowStartModal(false);
      setCurrentTab("dashboard");
    },
    onUpdatePlan: (plan) => {
      taskManager.updateActivePlan(plan);
    },
    onStopTask: () => {
      taskManager.triggerStopTask();
      setShowEndModal(true);
    },
    onAppendNote: (note) => {
      taskManager.appendNote(note);
    },
    onSummary: (text) => {
      taskManager.setProofData((p) => ({ ...p, description: text }));
    },
    onCommit: (text) => {
      taskManager.completeAndSaveTask(text);
      setShowEndModal(false);
    },
  });

  // ── 3. Helpers to link modals with Voice Engine ──
  const handleOpenStartModal = () => {
    setShowStartModal(true);
    voiceEngine.setVoiceContext("AWAITING_TITLE");
    voiceEngine.setActiveDictationField("newTaskTitle");
  };

  const handleManualStop = () => {
    taskManager.openManualStopModal();
    setShowEndModal(true);
  };

  const closeStartModal = () => {
    setShowStartModal(false);
    voiceEngine.resetVoice();
  };

  const closeEndModal = () => {
    setShowEndModal(false);
    voiceEngine.resetVoice();
  };

  const saveCompletedTask = () => {
    taskManager.saveCompletedTask();
    closeEndModal();
  };

  // ── 4. Render ──
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex selection:bg-rose-500/20">
      
      {/* SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        taskCount={taskManager.tasks.length}
        totalH={taskManager.totalH}
        totalM={taskManager.totalM}
        totalS={taskManager.totalS}
        manualInput={voiceEngine.manualInput}
        onManualInputChange={voiceEngine.setManualInput}
        onManualSubmit={voiceEngine.handleManualSubmit}
      />

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 flex-grow p-8 xl:p-12 w-full">
        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{greeting}</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              System Status:{" "}
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold text-xs uppercase">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                ONLINE
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-rose-600 font-mono tracking-wider tabular-nums">
              {taskManager.activeTask ? taskManager.timerText : "00:00:00"}
            </div>
            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mt-1">Deep Work Duration</p>
          </div>
        </header>

        {/* TABS */}
        {currentTab === "dashboard" && (
          <DashboardTab
            activeTask={taskManager.activeTask}
            tasks={taskManager.tasks}
            timerText={taskManager.timerText}
            isListening={voiceEngine.isListening}
            isSleeping={voiceEngine.isSleeping}
            transcript={voiceEngine.transcript}
            voiceContext={voiceEngine.voiceContext}
            totalH={taskManager.totalH}
            totalM={taskManager.totalM}
            totalS={taskManager.totalS}
            commitCount={taskManager.commitCount}
            onToggleListening={voiceEngine.toggleListening}
            onManualStop={handleManualStop}
            onOpenStartModal={handleOpenStartModal}
            onUpdateActiveTitle={taskManager.updateActiveTitle}
          />
        )}
        
        {currentTab === "timeline" && (
          <TimelineTab
            tasks={taskManager.tasks}
            onUpdateTitle={taskManager.updateTaskTitle}
            onDeleteTask={taskManager.deleteTask}
          />
        )}

        {currentTab === "memory_lane" && <MemoryLaneTab tasks={taskManager.tasks} />}
        {currentTab === "exports" && <ExportsTab tasks={taskManager.tasks} />}

      </main>

      {/* MODALS */}
      {showStartModal && (
        <StartModal
          activeDictationField={voiceEngine.activeDictationField}
          onToggleDictation={voiceEngine.toggleDictation}
          onClose={closeStartModal}
          onStart={(title, plan) => {
            taskManager.startTask(title, plan);
            closeStartModal();
            setCurrentTab("dashboard");
          }}
          registerDictationField={voiceEngine.registerDictationField}
        />
      )}

      {showEndModal && (
        <EndModal
          task={taskManager.tempCompletedTask}
          proofData={taskManager.proofData}
          setProofData={taskManager.setProofData}
          attachedFile={taskManager.attachedFile}
          setAttachedFile={taskManager.setAttachedFile}
          activeDictationField={voiceEngine.activeDictationField}
          onToggleDictation={voiceEngine.toggleDictation}
          onClose={closeEndModal}
          onSave={saveCompletedTask}
          registerDictationField={voiceEngine.registerDictationField}
        />
      )}

    </div>
  );
}

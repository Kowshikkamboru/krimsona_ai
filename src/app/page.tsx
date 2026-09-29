"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, Download, Mic, ClipboardList } from "lucide-react";

const WAKE_WORD = "krimsona";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [transcript, setTranscript] = useState("Tap mic and say \"Hi Krimsona\"...");
  const [timerText, setTimerText] = useState("00:00:00");
  
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Load data from Local Storage
    const savedTasks = JSON.parse(localStorage.getItem("krimsona_tasks") || "[]");
    const savedActive = JSON.parse(localStorage.getItem("krimsona_active") || "null");
    setTasks(savedTasks);
    setActiveTask(savedActive);

    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        // Only restart if it's supposed to be listening
        setIsListening((currentIsListening) => {
          if (currentIsListening) {
            recognition.start();
          }
          return currentIsListening;
        });
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processCommand(finalTranscript.toLowerCase());
        }
      };

      recognitionRef.current = recognition;
    } else {
      alert("Please use Google Chrome for Voice features.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, []);

  // Sync data to localStorage when tasks or activeTask changes
  useEffect(() => {
    localStorage.setItem("krimsona_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("krimsona_active", JSON.stringify(activeTask));
    
    if (activeTask) {
      timerIntervalRef.current = setInterval(() => {
        const start = new Date(activeTask.start_time).getTime();
        const diff = new Date().getTime() - start;
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

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const processCommand = (text: string) => {
    console.log("Heard:", text);

    if (text.includes("hi " + WAKE_WORD) || text.includes("hey " + WAKE_WORD)) {
      speak("Hi! I'm ready. What's next?");
    } else if (text.includes("start task") || text.includes("start work")) {
      setActiveTask((prevActiveTask: any) => {
        if (prevActiveTask) {
          speak("Please stop the current task first.");
          return prevActiveTask;
        }
        let name = text.replace(/start task|start working on/g, "").trim() || "Untitled Task";
        speak("Task started.");
        return {
          id: Date.now(),
          title: name,
          start_time: new Date().toISOString(),
          end_time: null,
          notes: [],
          status: "In Progress"
        };
      });
    } else if (text.includes("stop task") || text.includes("close ticket")) {
      setActiveTask((prevActiveTask: any) => {
        if (!prevActiveTask) {
          speak("No task is active.");
          return prevActiveTask;
        }
        speak("Task saved.");
        const completedTask = {
          ...prevActiveTask,
          end_time: new Date().toISOString(),
          status: "Completed",
          duration: document.getElementById("active-task-timer")?.innerText || "00:00:00",
        };
        setTasks((prev) => [completedTask, ...prev]);
        return null;
      });
    } else if (text.includes("note") || text.includes("bug")) {
      setActiveTask((prevActiveTask: any) => {
        if (!prevActiveTask) return prevActiveTask;
        let note = text.replace(/note|add note/g, "").trim();
        speak("Note added.");
        return {
          ...prevActiveTask,
          notes: [...prevActiveTask.notes, `[${new Date().toLocaleTimeString()}] ${note}`]
        };
      });
    }
  };

  const stopCurrentTask = () => {
    if (!activeTask) return;
    const completedTask = {
      ...activeTask,
      end_time: new Date().toISOString(),
      status: "Completed",
      duration: timerText,
    };
    setTasks((prev) => [completedTask, ...prev]);
    setActiveTask(null);
  };

  const speak = (text: string) => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const exportData = async () => {
    try {
      const res = await fetch("/api/export_tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Krimsona_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Export failed.");
      }
    } catch (e) {
      alert("Export failed.");
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain className="text-indigo-300 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Krimsona AI</h1>
          </div>
          <button
            onClick={exportData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <h2 className="text-lg font-bold text-slate-700 mb-6">Voice Command Center</h2>

            <button
              onClick={toggleListening}
              className={`w-24 h-24 rounded-full bg-indigo-600 text-white text-4xl shadow-xl transition-transform hover:scale-105 active:scale-95 focus:outline-none mb-6 flex items-center justify-center mx-auto ${
                isListening ? "mic-active" : ""
              }`}
            >
              <Mic className="w-10 h-10" />
            </button>

            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-mono mb-4 ${
                isListening
                  ? "bg-indigo-100 text-indigo-700 animate-pulse"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isListening ? "Listening..." : "Microphone Off"}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left min-h-[100px] max-h-[150px] overflow-y-auto">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Live Transcript</p>
              <p className="text-slate-600 text-sm italic">{transcript}</p>
            </div>
          </div>

          {activeTask && (
            <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden transition-all">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded">
                  In Progress
                </span>
                <div className="animate-pulse w-2 h-2 bg-amber-500 rounded-full"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{activeTask.title}</h3>
              <p id="active-task-timer" className="text-4xl font-mono text-amber-600 font-bold my-4">
                {timerText}
              </p>
              <button
                onClick={stopCurrentTask}
                className="w-full bg-white border border-amber-300 text-amber-700 font-bold py-2 rounded-lg hover:bg-amber-100 transition"
              >
                Stop Task
              </button>
            </div>
          )}

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-800">
            <p className="font-bold mb-2">Try saying:</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>"Hi Krimsona"</li>
              <li>"Start task [Landing Page Design]"</li>
              <li>"Note [Found a bug in header]"</li>
              <li>"Stop task"</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-700">Today's Timeline</h2>
              <span className="text-sm text-slate-400 font-medium">{currentDate}</span>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow max-h-[calc(100vh-200px)]">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                  <ClipboardList className="w-12 h-12 mb-3 opacity-50" />
                  <p>No tasks recorded yet today.</p>
                </div>
              ) : (
                tasks.map((t, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-slate-800">{t.title}</h4>
                      <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">
                        {t.duration}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Started: {new Date(t.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {t.notes && t.notes.length > 0 && (
                      <ul className="mt-2 text-xs text-slate-600 list-disc pl-4 bg-slate-50 p-2 rounded">
                        {t.notes.map((n: string, i: number) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

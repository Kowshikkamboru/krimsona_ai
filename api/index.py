from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import pandas as pd
import io
import json

app = FastAPI()

# --- BACKEND: EXCEL EXPORT LOGIC ---
@app.post("/export_tasks")
async def export_tasks(data: str = Form(...)):
    """
    Receives task data from the frontend (Local Storage),
    converts it to a formatted Excel file, and returns it.
    """
    try:
        tasks = json.loads(data)
        df = pd.DataFrame(tasks)
        
        # Format the data for the report
        if not df.empty:
            # Ensure columns exist even if data is partial
            expected_cols = ['title', 'status', 'start_time', 'end_time', 'duration', 'notes']
            for col in expected_cols:
                if col not in df.columns:
                    df[col] = ""
            
            # Convert notes list to readable string
            df['notes'] = df['notes'].apply(lambda x: " | ".join(x) if isinstance(x, list) else x)
            df = df[expected_cols] 
        
        # Create Excel in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Krimsona_Log')
        output.seek(0)
        
        filename = f"Krimsona_Report_{datetime.now().strftime('%Y-%m-%d')}.xlsx"
        headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
        
        return HTMLResponse(
            content=output.getvalue(), 
            headers=headers, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        return {"error": str(e)}

# --- FRONTEND: SINGLE PAGE APP ---
@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krimsona AI | Smart Task Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .mic-active { animation: pulse 1.5s infinite; background-color: #ef4444; }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 font-sans min-h-screen flex flex-col">

    <nav class="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <i class="fas fa-brain text-indigo-300 text-xl"></i>
                <h1 class="text-xl font-bold tracking-tight">Krimsona AI</h1>
            </div>
            <button onclick="exportData()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-md">
                <i class="fas fa-file-export"></i> Export Report
            </button>
        </div>
    </nav>

    <main class="container mx-auto p-4 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div class="lg:col-span-4 space-y-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                
                <h2 class="text-lg font-bold text-slate-700 mb-6">Voice Command Center</h2>
                
                <button id="mic-btn" onclick="toggleListening()" class="w-24 h-24 rounded-full bg-indigo-600 text-white text-4xl shadow-xl transition-transform hover:scale-105 active:scale-95 focus:outline-none mb-6 flex items-center justify-center mx-auto">
                    <i class="fas fa-microphone"></i>
                </button>
                
                <div id="status-badge" class="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-mono mb-4">
                    Microphone Off
                </div>

                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left min-h-[100px] max-h-[150px] overflow-y-auto">
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Live Transcript</p>
                    <p id="transcript-box" class="text-slate-600 text-sm italic">Tap mic and say "Hi Krimsona"...</p>
                </div>
            </div>

            <div id="active-task-card" class="hidden bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200 relative overflow-hidden transition-all">
                <div class="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                <div class="flex justify-between items-start mb-2">
                    <span class="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded">In Progress</span>
                    <div class="animate-pulse w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
                <h3 id="active-task-title" class="text-xl font-bold text-slate-800 mb-1 leading-tight">Task Name</h3>
                <p id="active-task-timer" class="text-4xl font-mono text-amber-600 font-bold my-4">00:00:00</p>
                <button onclick="stopCurrentTask()" class="w-full bg-white border border-amber-300 text-amber-700 font-bold py-2 rounded-lg hover:bg-amber-100 transition">
                    Stop Task
                </button>
            </div>
            
            <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-800">
                <p class="font-bold mb-2">Try saying:</p>
                <ul class="space-y-1 list-disc pl-4">
                    <li>"Hi Krimsona"</li>
                    <li>"Start task [Landing Page Design]"</li>
                    <li>"Note [Found a bug in header]"</li>
                    <li>"Stop task"</li>
                </ul>
            </div>
        </div>

        <div class="lg:col-span-8">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-slate-700">Today's Timeline</h2>
                    <span id="current-date" class="text-sm text-slate-400 font-medium"></span>
                </div>
                
                <div id="task-list" class="p-6 space-y-4 overflow-y-auto flex-grow max-h-[calc(100vh-200px)]">
                    <div class="flex flex-col items-center justify-center h-64 text-slate-300">
                        <i class="fas fa-clipboard-list text-4xl mb-3"></i>
                        <p>No tasks recorded yet today.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // --- STATE ---
        const WAKE_WORD = "krimsona";
        let recognition;
        let isListening = false;
        let activeTask = null;
        let tasks = [];
        let timerInterval;

        // --- INIT ---
        window.onload = function() {
            document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            loadData(); // Load from Local Storage
            
            if ('webkitSpeechRecognition' in window) {
                setupVoice();
            } else {
                alert("Please use Google Chrome for Voice features.");
            }
        };

        // --- VOICE SETUP ---
        function setupVoice() {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isListening = true;
                const badge = document.getElementById('status-badge');
                badge.innerText = "Listening...";
                badge.className = "inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-mono mb-4 animate-pulse";
                document.getElementById('mic-btn').classList.add('mic-active');
            };

            recognition.onend = () => {
                if (isListening) recognition.start(); // Auto-restart (Always listening feel)
                else {
                    document.getElementById('status-badge').className = "inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-mono mb-4";
                    document.getElementById('mic-btn').classList.remove('mic-active');
                }
            };

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript) {
                    document.getElementById('transcript-box').innerText = finalTranscript;
                    processCommand(finalTranscript.toLowerCase());
                }
            };
        }

        function toggleListening() {
            isListening ? (isListening = false, recognition.stop()) : (isListening = true, recognition.start());
        }

        // --- AI LOGIC ---
        function processCommand(text) {
            console.log("Heard:", text);

            if (text.includes("hi " + WAKE_WORD) || text.includes("hey " + WAKE_WORD)) {
                speak("Hi! I'm ready. What's next?");
            }
            else if (text.includes("start task") || text.includes("start work")) {
                if (activeTask) return speak("Please stop the current task first.");
                let name = text.replace(/start task|start working on/g, "").trim() || "Untitled Task";
                startTask(name);
                speak("Task started.");
            }
            else if (text.includes("stop task") || text.includes("close ticket")) {
                if (!activeTask) return speak("No task is active.");
                stopCurrentTask();
                speak("Task saved.");
            }
            else if (activeTask && (text.includes("note") || text.includes("bug"))) {
                let note = text.replace(/note|add note/g, "").trim();
                addNote(note);
                speak("Note added.");
            }
        }

        // --- TASK LOGIC ---
        function startTask(title) {
            activeTask = {
                id: Date.now(),
                title: title,
                start_time: new Date().toISOString(),
                end_time: null,
                notes: [],
                status: 'In Progress'
            };
            saveData();
            updateUI();
        }

        function stopCurrentTask() {
            if (!activeTask) return;
            activeTask.end_time = new Date().toISOString();
            activeTask.status = 'Completed';
            activeTask.duration = document.getElementById('active-task-timer').innerText;
            tasks.unshift(activeTask);
            activeTask = null;
            saveData();
            updateUI();
        }

        function addNote(note) {
            if (activeTask) {
                activeTask.notes.push(`[${new Date().toLocaleTimeString()}] ${note}`);
                saveData();
            }
        }

        // --- LOCAL STORAGE & UI ---
        function saveData() {
            localStorage.setItem('krimsona_tasks', JSON.stringify(tasks));
            localStorage.setItem('krimsona_active', JSON.stringify(activeTask));
        }

        function loadData() {
            tasks = JSON.parse(localStorage.getItem('krimsona_tasks') || "[]");
            activeTask = JSON.parse(localStorage.getItem('krimsona_active') || "null");
            updateUI();
        }

        function updateUI() {
            // Update Active Task Card
            const card = document.getElementById('active-task-card');
            if (activeTask) {
                card.classList.remove('hidden');
                document.getElementById('active-task-title').innerText = activeTask.title;
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = setInterval(updateTimer, 1000);
            } else {
                card.classList.add('hidden');
                if (timerInterval) clearInterval(timerInterval);
                document.getElementById('active-task-timer').innerText = "00:00:00";
            }

            // Update Task List
            const list = document.getElementById('task-list');
            list.innerHTML = '';
            if(tasks.length === 0) {
                list.innerHTML = '<div class="text-center text-gray-400 py-10">No tasks yet.</div>';
                return;
            }
            tasks.forEach(t => {
                const time = new Date(t.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                const notesHtml = t.notes.map(n => `<li>${n}</li>`).join('');
                list.innerHTML += `
                    <div class="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                        <div class="flex justify-between">
                            <h4 class="font-bold text-slate-800">${t.title}</h4>
                            <span class="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">${t.duration}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">Started: ${time}</p>
                        ${notesHtml ? `<ul class="mt-2 text-xs text-slate-600 list-disc pl-4 bg-slate-50 p-2 rounded">${notesHtml}</ul>` : ''}
                    </div>
                `;
            });
        }

        function updateTimer() {
            const start = new Date(activeTask.start_time).getTime();
            const diff = new Date().getTime() - start;
            const h = Math.floor(diff / 3600000).toString().padStart(2,'0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2,'0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2,'0');
            document.getElementById('active-task-timer').innerText = `${h}:${m}:${s}`;
        }

        function speak(text) {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }

        async function exportData() {
            const formData = new FormData();
            formData.append('data', JSON.stringify(tasks));
            const res = await fetch('/export_tasks', { method: 'POST', body: formData });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = "Krimsona_Report.xlsx"; 
                document.body.appendChild(a); a.click(); a.remove();
            } else alert("Export failed.");
        }
    </script>
</body>
</html>
    """
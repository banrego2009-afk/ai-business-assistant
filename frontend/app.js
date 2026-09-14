const API_BASE = "http://127.0.0.1:8000/api";
let isRecording = false;

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    setupSpeechRecognition();
    
    document.getElementById("prompt-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendPrompt();
    });
});

async function sendPrompt() {
    const inputEl = document.getElementById("prompt-input");
    const prompt = inputEl.value.trim();
    if (!prompt) return;

    appendMessage("user", prompt);
    inputEl.value = "";

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        appendMessage("ai", data.reply);
        
        loadTasks();
    } catch (error) {
        appendMessage("ai", `Hiba történt: ${error.message}`);
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    
    if (sender === "user") {
        msgDiv.className = "bg-indigo-100 p-3 rounded shadow-sm self-end max-w-[80%] ml-auto";
    } else {
        msgDiv.className = "bg-white p-3 rounded shadow-sm self-start max-w-[80%] whitespace-pre-wrap";
    }
    
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        const data = await response.json();
        const list = document.getElementById("task-list");
        list.innerHTML = "";
        
        data.tasks.forEach(task => {
            const li = document.createElement("li");
            li.className = "flex items-center gap-2 border-b pb-1 border-gray-100";
            li.innerHTML = `
                <input type="checkbox" class="rounded text-indigo-600" ${task.status === 'done' ? 'checked' : ''}>
                <span class="${task.status === 'done' ? 'line-through text-gray-400' : ''}">${task.title}</span>
            `;
            list.appendChild(li);
        });
    } catch (e) {
        console.error("Nem sikerült betölteni a feladatokat", e);
    }
}

async function addTask() {
    const titleEl = document.getElementById("new-task-title");
    const title = titleEl.value.trim();
    if (!title) return;

    try {
        await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: "", project: "Általános" })
        });
        titleEl.value = "";
        loadTasks();
    } catch (e) {
        alert("Hiba a feladat hozzáadásakor");
    }
}

async function loadEmails() {
    try {
        const response = await fetch(`${API_BASE}/emails`);
        const data = await response.json();
        const list = document.getElementById("email-list");
        list.innerHTML = "";
        
        data.emails.forEach(email => {
            const li = document.createElement("li");
            li.className = "border-b pb-2 border-gray-100 text-xs";
            li.innerHTML = `
                <div class="font-bold">${email.subject}</div>
                <div class="text-gray-500">${email.from}</div>
                <div class="truncate text-gray-400">${email.body}</div>
            `;
            list.appendChild(li);
        });
    } catch (e) {
        console.error("Nem sikerült betölteni az e-maileket", e);
    }
}

async function runCommand() {
    const cmdEl = document.getElementById("cmd-input");
    const command = cmdEl.value.trim();
    if (!command) return;
    
    cmdEl.value = "";
    const outEl = document.getElementById("cmd-output");
    outEl.textContent = `Végrehajtás: ${command}...\n`;

    try {
        const response = await fetch(`${API_BASE}/local-command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command })
        });
        const data = await response.json();
        outEl.textContent += data.result;
    } catch (e) {
        outEl.textContent += `Hiba: ${e.message}`;
    }
}

function toggleSettings() {
    const modal = document.getElementById("settings-modal");
    modal.classList.toggle("hidden");
}

async function saveSettings() {
    const apiKey = document.getElementById("api-key-input").value;
    try {
        await fetch(`${API_BASE}/settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gemini_api_key: apiKey })
        });
        toggleSettings();
        alert("Beállítások sikeresen mentve!");
    } catch (e) {
        alert("Hiba a beállítások mentésekor.");
    }
}

function setupSpeechRecognition() {
    const micBtn = document.getElementById("mic-btn");
    const statusEl = document.getElementById("speech-status");
    const inputEl = document.getElementById("prompt-input");
    
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!window.SpeechRecognition) {
        micBtn.style.display = 'none';
        return; 
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hu-HU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.addEventListener("click", () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.addEventListener("start", () => {
        isRecording = true;
        micBtn.classList.replace("bg-red-500", "bg-green-500");
        micBtn.classList.add("animate-pulse");
        statusEl.classList.remove("hidden");
    });

    recognition.addEventListener("end", () => {
        isRecording = false;
        micBtn.classList.replace("bg-green-500", "bg-red-500");
        micBtn.classList.remove("animate-pulse");
        statusEl.classList.add("hidden");
    });

    recognition.addEventListener("result", (e) => {
        const transcript = e.results[0][0].transcript;
        inputEl.value = transcript;
        sendPrompt();
    });
    
    recognition.addEventListener("error", (e) => {
        console.error("Speech recognition error", e);
        isRecording = false;
        micBtn.classList.replace("bg-green-500", "bg-red-500");
        micBtn.classList.remove("animate-pulse");
        statusEl.classList.add("hidden");
    });
}

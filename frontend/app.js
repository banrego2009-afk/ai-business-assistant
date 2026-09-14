const API_BASE = "http://127.0.0.1:8000/api";
let isRecording = false;

document.addEventListener("DOMContentLoaded", () => {
    // Initial loads
    loadTasks();
    setupSpeechRecognition();
    
    // Auto-resize textarea in chat
    const promptInput = document.getElementById("prompt-input");
    promptInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
        if (this.value === "") this.style.height = "auto";
    });

    // Enter key handling for chat (Shift+Enter for new line)
    promptInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    });

    // Terminal enter key
    document.getElementById("cmd-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") runCommand();
    });
});

// --- Tab Navigation ---
function switchTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Show selected tab
    document.getElementById(`view-${tabId}`).classList.add('active');
    
    // Reset nav styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all";
        btn.firstElementChild.className = btn.firstElementChild.className.replace("text-indigo-200", "text-slate-400");
    });
    
    // Active nav style
    const activeBtn = document.getElementById(`nav-${tabId}`);
    activeBtn.className = "nav-btn w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white shadow-md shadow-indigo-600/20 transition-all";
    activeBtn.firstElementChild.classList.remove("text-slate-400");
    activeBtn.firstElementChild.classList.add("text-indigo-200");
    
    // Set Titles
    const titles = {
        'chat': 'AI Asszisztens',
        'tasks': 'Feladatok & CRM',
        'emails': 'E-mailek',
        'terminal': 'Helyi Gépvezérlés'
    };
    document.getElementById("page-title").innerText = titles[tabId];
    
    // Auto-focus logic
    if(tabId === 'terminal') document.getElementById('cmd-input').focus();
    if(tabId === 'chat') document.getElementById('prompt-input').focus();
    if(tabId === 'tasks') loadTasks();
}

// --- Chat & AI ---
async function sendPrompt() {
    const inputEl = document.getElementById("prompt-input");
    const prompt = inputEl.value.trim();
    if (!prompt) return;

    appendMessage("user", prompt);
    inputEl.value = "";
    inputEl.style.height = "auto";
    
    // Show loading state
    const loadingId = appendLoading();

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        removeLoading(loadingId);
        appendMessage("ai", data.reply);
        
        // Refresh tasks in background just in case AI created one
        loadTasks();
    } catch (error) {
        removeLoading(loadingId);
        appendMessage("error", `Hálózati hiba történt a szerver elérésekor.`);
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    
    if (sender === "user") {
        msgDiv.className = "flex justify-end gap-2 mb-2";
        msgDiv.innerHTML = `
            <div class="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] whitespace-pre-wrap">${escapeHTML(text)}</div>
        `;
    } else if (sender === "ai") {
        msgDiv.className = "flex gap-4 mb-2";
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-md mt-1">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[90%] text-slate-700 markdown-body overflow-hidden">
                ${marked.parse(text)}
            </div>
        `;
    } else if (sender === "error") {
        msgDiv.className = "flex justify-center my-2";
        msgDiv.innerHTML = `<div class="bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-semibold"><i class="fas fa-exclamation-triangle mr-1"></i> ${text}</div>`;
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.id = id;
    msgDiv.className = "flex gap-4 mb-2";
    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center mt-1 animate-pulse"></div>
        <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1 items-center">
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// --- Tasks CRUD ---
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        const data = await response.json();
        const list = document.getElementById("task-list");
        
        if (data.tasks.length === 0) {
            list.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm"><i class="fas fa-clipboard-list text-4xl mb-3 opacity-20 block"></i>Még nincsenek feladatok.</div>`;
            return;
        }
        
        list.innerHTML = "";
        data.tasks.forEach(task => {
            const isDone = task.status === 'done';
            const li = document.createElement("li");
            li.className = `group flex items-center justify-between p-3 rounded-xl border ${isDone ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'} transition-all hover:border-indigo-200`;
            
            li.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden flex-1">
                    <button onclick="toggleTaskStatus(${task.id}, '${isDone ? 'pending' : 'done'}')" class="flex-shrink-0 w-5 h-5 rounded border ${isDone ? 'bg-indigo-500 border-indigo-500 flex items-center justify-center' : 'border-slate-300 hover:border-indigo-400'} transition-colors">
                        ${isDone ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </button>
                    <div class="flex flex-col truncate">
                        <span class="text-sm font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'} truncate">${escapeHTML(task.title)}</span>
                        ${task.project ? `<span class="text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-slate-300' : 'text-indigo-500'} mt-0.5">${escapeHTML(task.project)}</span>` : ''}
                    </div>
                </div>
                <button onclick="deleteTask(${task.id})" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50 ml-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            list.appendChild(li);
        });
    } catch (e) {
        console.error(e);
    }
}

async function addTask() {
    const titleEl = document.getElementById("new-task-title");
    const projEl = document.getElementById("new-task-project");
    const title = titleEl.value.trim();
    if (!title) return;

    try {
        await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: "", project: projEl.value.trim() || "Általános" })
        });
        titleEl.value = "";
        loadTasks();
    } catch (e) {
        alert("Hiba a feladat hozzáadásakor");
    }
}

async function toggleTaskStatus(id, newStatus) {
    try {
        await fetch(`${API_BASE}/tasks/${id}?status=${newStatus}`, { method: "PUT" });
        loadTasks();
    } catch (e) {
        console.error(e);
    }
}

async function deleteTask(id) {
    if (!confirm("Biztosan törlöd ezt a feladatot?")) return;
    try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
        loadTasks();
    } catch (e) {
        console.error(e);
    }
}

// --- Emails ---
async function loadEmails() {
    const list = document.getElementById("email-list");
    list.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>E-mailek letöltése és AI kategorizálása folyamatban...</div>`;
    
    try {
        const response = await fetch(`${API_BASE}/emails`);
        const data = await response.json();
        
        if (data.emails.length === 0) {
            list.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm">Nincs új levél.</div>`;
            return;
        }
        
        list.innerHTML = "";
        data.emails.forEach(email => {
            // Category color logic
            let badgeClass = "bg-slate-100 text-slate-500";
            if (email.category === "Sürgős") badgeClass = "bg-red-100 text-red-600 border border-red-200";
            if (email.category === "Feladat") badgeClass = "bg-orange-100 text-orange-600 border border-orange-200";
            if (email.category === "Érdeklődés") badgeClass = "bg-emerald-100 text-emerald-600 border border-emerald-200";
            
            const li = document.createElement("li");
            li.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer";
            li.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <div class="font-bold text-slate-800 text-sm truncate pr-2">${escapeHTML(email.subject)}</div>
                    <div class="text-[10px] whitespace-nowrap font-bold px-2 py-0.5 rounded shadow-sm ${badgeClass}">${escapeHTML(email.category || "Információ")}</div>
                </div>
                <div class="text-xs text-slate-500 mb-2 font-medium">${escapeHTML(email.from)}</div>
                <div class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${escapeHTML(email.body)}</div>
                <div class="mt-3 flex gap-2">
                    <button class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 font-medium">Megnyitás</button>
                    <button class="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-medium" onclick="summarizeEmail('${escapeHTML(email.subject)}')">Kérdés az AI-tól</button>
                </div>
            `;
            list.appendChild(li);
        });
    } catch (e) {
        list.innerHTML = `<div class="text-center py-10 text-red-400 text-sm">Hiba a letöltéskor.</div>`;
    }
}

function summarizeEmail(subject) {
    switchTab('chat');
    const inputEl = document.getElementById("prompt-input");
    inputEl.value = `Mit mond ez az e-mail részletesebben: "${subject}"? Mit válaszoljak rá?`;
    sendPrompt();
}

// --- Terminal ---
async function runCommand() {
    const cmdEl = document.getElementById("cmd-input");
    const command = cmdEl.value.trim();
    if (!command) return;
    
    cmdEl.value = "";
    const outEl = document.getElementById("cmd-output");
    
    const cmdEcho = document.createElement("div");
    cmdEcho.innerHTML = `<span class="text-blue-400 font-bold">user@local:~$</span> <span class="text-white">${escapeHTML(command)}</span>`;
    outEl.appendChild(cmdEcho);
    
    const resultDiv = document.createElement("div");
    resultDiv.className = "text-slate-400 mb-2";
    outEl.appendChild(resultDiv);
    
    // Auto scroll terminal to bottom
    const termContent = document.getElementById("terminal-content");
    termContent.scrollTop = termContent.scrollHeight;

    if (command === 'clear') {
        outEl.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/local-command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command })
        });
        const data = await response.json();
        resultDiv.textContent = data.result;
    } catch (e) {
        resultDiv.textContent = `Error: ${e.message}`;
        resultDiv.className = "text-red-400 mb-2";
    }
    
    termContent.scrollTop = termContent.scrollHeight;
}

// --- Settings Modal ---
function toggleSettings() {
    const modal = document.getElementById("settings-modal");
    const panel = document.getElementById("settings-panel");
    
    if (modal.classList.contains("hidden")) {
        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.remove("opacity-0");
            panel.classList.remove("scale-95");
        }, 10);
    } else {
        modal.classList.add("opacity-0");
        panel.classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
    }
}

async function saveSettings() {
    const apiKey = document.getElementById("api-key-input").value;
    const emailUser = document.getElementById("email-user-input").value;
    const emailPass = document.getElementById("email-pass-input").value;
    const imapServer = document.getElementById("imap-server-input").value;
    
    try {
        await fetch(`${API_BASE}/settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                gemini_api_key: apiKey,
                email_address: emailUser,
                email_password: emailPass,
                imap_server: imapServer
            })
        });
        toggleSettings();
        
        // Show success toast
        const btn = document.querySelector('button[onclick="toggleSettings()"]').parentElement.parentElement.querySelector('.text-lg');
        btn.innerHTML += ' <span class="text-green-500 text-xs ml-2">Mentve!</span>';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-cog text-slate-400 mr-2"></i> Rendszer Beállítások';
        }, 3000);
    } catch (e) {
        alert("Hiba a beállítások mentésekor.");
    }
}

// --- Web Speech API ---
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
        if (isRecording) recognition.stop();
        else recognition.start();
    });

    recognition.addEventListener("start", () => {
        isRecording = true;
        micBtn.classList.add("text-red-500", "bg-red-50");
        micBtn.classList.remove("text-slate-400");
        statusEl.classList.remove("hidden");
    });

    recognition.addEventListener("end", () => {
        isRecording = false;
        micBtn.classList.remove("text-red-500", "bg-red-50");
        micBtn.classList.add("text-slate-400");
        statusEl.classList.add("hidden");
    });

    recognition.addEventListener("result", (e) => {
        const transcript = e.results[0][0].transcript;
        inputEl.value = transcript;
        sendPrompt();
    });
}

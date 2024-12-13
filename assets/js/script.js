/* ========================================
   ** VARIÁVEIS GLOBAIS **
======================================== */
const closeButton = document.getElementById("closeButton");
const chatBox = document.getElementById("chat-box");
const inputContainer = document.getElementById("input-container");
const chatActions = document.getElementById("chat-actions");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");
const exportButton = document.getElementById("exportButton");
const themeToggleButton = document.getElementById("themeToggleButton");

let isMinimized = false;
let isTabActive = true;
let chatHistory = [
    { role: "system", content: "Você é um assistente útil que ajuda o usuário com base em informações fornecidas." }
];
const defaultTitle = document.title;
const notificationSound = new Audio("/public/assets/sounds/notification.mp3");
notificationSound.volume = 0.5; // Volume do som de notificação

/* ========================================
   ** FUNÇÕES DE INTERFACE **
======================================== */
// Alterna entre minimizar e maximizar o chat
function toggleChat() {
    const displayState = isMinimized ? "block" : "none";
    chatBox.style.display = displayState;
    inputContainer.style.display = isMinimized ? "flex" : "none";
    chatActions.style.display = displayState;
    closeButton.textContent = isMinimized ? "Minimizar" : "Maximizar";
    isMinimized = !isMinimized;
}

// Alterna entre Modo Claro/Escuro
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    themeToggleButton.textContent = isDarkMode ? "Modo Claro" : "Modo Escuro";
}

// Carrega o tema salvo
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggleButton.textContent = "Modo Claro";
    }
}

/* ========================================
   ** FUNÇÕES DE MENSAGENS **
======================================== */
// Adiciona mensagens no chat
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    const timestamp = getCurrentTime();
    const formattedText = sender === "bot" ? formatBotResponse(text) : text;

    messageDiv.innerHTML = `${formattedText} <span class="timestamp">[${timestamp}]</span>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    saveMessageToLocalStorage(`${text} [${timestamp}]`, sender);
    if (sender === "bot" && !isTabActive) document.title = "💬 Nova mensagem no chat!";
}

// Obtém a hora atual
function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// Formata texto Markdown em HTML
function formatBotResponse(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
    return text.split(/\n+/).map((para) => `<p>${para}</p>`).join("");
}

// Salva mensagens no localStorage
function saveMessageToLocalStorage(text, sender) {
    const MAX_MESSAGES = 20;
    let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    messages.push({ text, sender });
    if (messages.length > MAX_MESSAGES) messages = messages.slice(-MAX_MESSAGES);
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

// Carrega o histórico salvo
function loadChatHistory() {
    const messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    messages.forEach((msg) => addMessage(msg.text, msg.sender));
}

// Limpa o chat
function clearChatHistory() {
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    addMessage("O histórico foi limpo com sucesso!", "bot");
}

// Exporta o chat como arquivo
function exportChatHistory(format = "txt") {
    const messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (messages.length === 0) {
        addMessage("O histórico está vazio. Nada para exportar.", "bot");
        return;
    }

    let content = format === "txt"
        ? messages.map(msg => `${msg.sender === "user" ? "Você" : "Bot"}: ${msg.text}`).join("\n")
        : JSON.stringify(messages, null, 2);

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat_history.${format}`;
    link.click();

    addMessage(`O histórico foi exportado como <strong>${link.download}</strong>!`, "bot");
}

/* ========================================
   ** EVENTOS E INICIALIZAÇÃO **
======================================== */
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
closeButton.addEventListener("click", toggleChat);
clearButton.addEventListener("click", clearChatHistory);
exportButton.addEventListener("click", () => exportChatHistory("txt"));
themeToggleButton.addEventListener("click", toggleTheme);

window.addEventListener("load", () => {
    loadTheme();
    loadChatHistory();
});

/* ========================================
   ** API COMUNICAÇÃO **
======================================== */
function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    chatHistory.push({ role: "user", content: userMessage });
    addMessage(userMessage, "user");
    userInput.value = "";
    const typingIndicator = createTypingIndicator();

    fetch("https://ronnysenna.com.br/chat/backend/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
    });
    
        .then(response => response.json())
        .then(result => {
            chatBox.removeChild(typingIndicator);
            const botResponse = result.answer || "Desculpe, não consegui gerar uma resposta.";
            chatHistory.push({ role: "assistant", content: botResponse });
            addMessage(botResponse, "bot");
        })
        .catch(() => {
            chatBox.removeChild(typingIndicator);
            addMessage("Erro ao conectar com o servidor. Tente novamente.", "bot");
        });
}

function createTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot-message");
    typingIndicator.innerHTML = `<div class="spinner"></div> O bot está digitando...`;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingIndicator;
}

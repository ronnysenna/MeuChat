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

// Detecta se a aba está ativa ou inativa
document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
    if (isTabActive) document.title = defaultTitle;
});

// Alternar modo noturno
themeToggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
});

const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
if (isDarkMode) document.body.classList.add("dark-mode");

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

    scrollToBottomSmooth();
    saveMessageToLocalStorage(text, sender);
    if (sender === "bot" && !isTabActive) document.title = "💬 Nova mensagem no chat!";
}

// Formata texto do bot
function formatBotResponse(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
    
    // Converte blocos de código com botão de copiar
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
        const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escapa HTML
        return `
            <div class="code-container">
                <pre><code>${escapedCode}</code></pre>
                <button class="copy-button" onclick="copyToClipboard(this)">Copiar</button>
            </div>
        `;
    });

    return text.split(/\n+/).map(para => `<p>${para}</p>`).join("");
}


function copyToClipboard(button) {
    // Seleciona o conteúdo do código dentro da tag <code>
    const codeBlock = button.previousElementSibling; // A tag <code> que está antes do botão
    const codeText = codeBlock.textContent || codeBlock.innerText; // Captura o texto do código

    // Cria um elemento temporário para copiar o texto
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = codeText;
    document.body.appendChild(tempTextArea);

    // Seleciona e copia o conteúdo
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // Atualiza o botão para "Copiado!"
    button.textContent = "Copiado!";
    setTimeout(() => button.textContent = "Copiar", 2000);
}


// Scroll automático suave
function scrollToBottomSmooth() {
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
}

// Obter hora atual
function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

// Salva mensagens no localStorage
function saveMessageToLocalStorage(text, sender) {
    const MAX_MESSAGES = 20;
    let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    messages.push({ text, sender });
    if (messages.length > MAX_MESSAGES) messages = messages.slice(-MAX_MESSAGES);
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadChatHistory() {
    const messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    messages.forEach(msg => addMessage(msg.text, msg.sender));
    scrollToBottomSmooth();
}

/* ========================================
   ** ENVIA A MENSAGEM AO BACKEND **
======================================== */
function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    sendButton.disabled = true;
    userInput.disabled = true;

    chatHistory.push({ role: "user", content: userMessage });
    addMessage(userMessage, "user");
    userInput.value = "";

    const typingIndicator = createTypingIndicator();

    fetch("./backend/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
    })
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
        })
        .finally(() => {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
        });
}

function createTypingIndicator() {
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot-message");
    typingIndicator.innerHTML = `<div class="spinner"></div> O bot está digitando...`;
    chatBox.appendChild(typingIndicator);
    scrollToBottomSmooth();
    return typingIndicator;
}

/* ========================================
   ** EVENTOS DE INICIALIZAÇÃO **
======================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();

    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    sendButton.addEventListener("click", sendMessage);
    clearButton.addEventListener("click", () => {
        localStorage.removeItem("chatHistory");
        chatBox.innerHTML = "";
        addMessage("O histórico foi limpo com sucesso!", "bot");
    });

    exportButton.addEventListener("click", () => exportChatHistory("txt"));
});

function exportChatHistory(format = "txt") {
    const messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
    let content = messages.map(msg => `${msg.sender}: ${msg.text}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat_history.${format}`;
    link.click();
}

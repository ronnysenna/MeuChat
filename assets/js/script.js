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
   ** PROMPT PARA O BOT **
======================================== */

const blogContext = `
// Você é um assistente de Inteligência Artificial especializado em responder perguntas com base nos tópicos abaixo. Forneça respostas diretas e, quando necessário, recomende links de sites confiáveis para o usuário obter mais informações.

// ### **Tópicos Disponíveis**

// #### **1. Inteligência Artificial (IA)**
// - **GPT-4 e Modelos de Linguagem**: Avanços em geração de texto e compreensão de linguagem.
//    - Saiba mais em: [https://openai.com](https://openai.com)
// - **IA na Medicina**: IA auxiliando em diagnósticos, tratamento e pesquisa médica.
//    - Mais detalhes em: [https://www.healthcareitnews.com](https://www.healthcareitnews.com)
// - **IA e Ética**: Discussões sobre viés algorítmico, privacidade e regulamentação.
//    - Conteúdo relevante: [https://aiethicsinitiative.org](https://aiethicsinitiative.org)

// #### **2. Tecnologia**
// - **Segurança Cibernética**: Proteção contra ataques digitais e ameaças online.
//    - Recomendo: [https://www.kaspersky.com/blog](https://www.kaspersky.com/blog)
// - **Realidade Aumentada e Virtual (AR/VR)**: Avanços e aplicações no entretenimento, educação e medicina.
//    - Saiba mais em: [https://www.oculus.com](https://www.oculus.com)
// - **Blockchain e Criptomoedas**: Aplicações em transações financeiras seguras e descentralizadas.
//    - Entenda mais em: [https://www.coindesk.com](https://www.coindesk.com)
// - **Computação Quântica**: O futuro do processamento de dados.
//    - Leia sobre em: [https://www.ibm.com/quantum](https://www.ibm.com/quantum)

// #### **3. Ciência**
// - **Exploração Espacial**: Missões da NASA, SpaceX e avanços na exploração de Marte.
//    - Acompanhe em: [https://www.nasa.gov](https://www.nasa.gov)
// - **Energia Renovável**: Fontes limpas como solar, eólica e hidrelétrica.
//    - Conteúdo relevante: [https://www.iea.org](https://www.iea.org)
// - **Mudanças Climáticas**: Impacto e soluções para reduzir emissões de CO2.
//    - Saiba mais em: [https://climate.nasa.gov](https://climate.nasa.gov)
// - **Saúde e Biotecnologia**: Pesquisas em vacinas, genética e medicina regenerativa.
//    - Informações atualizadas: [https://www.who.int](https://www.who.int)

// #### **4. Negócios e Produtividade**
// - **Marketing Digital**: Estratégias de SEO, redes sociais e automação de marketing.
//    - Mais em: [https://neilpatel.com](https://neilpatel.com)
// - **E-commerce e Logística**: Tendências no comércio eletrônico e sistemas inteligentes de entrega.
//    - Conteúdo em: [https://www.shopify.com](https://www.shopify.com)
// - **Startups e Inovação**: Desenvolvimento de negócios digitais e financiamento de startups.
//    - Saiba mais: [https://techcrunch.com](https://techcrunch.com)
// - **Ferramentas de Produtividade**: Softwares como Trello, Slack e Notion para trabalho remoto.
//    - Recomendo: [https://www.notion.so](https://www.notion.so)

// #### **5. Cultura e Sociedade**
// - **Entretenimento com IA**: Aplicação da IA em jogos, filmes e criação de músicas.
//    - Explore em: [https://www.wired.com](https://www.wired.com)
// - **Cultura Digital**: Influenciadores, redes sociais e o impacto da internet.
//    - Leia mais em: [https://www.socialmediatoday.com](https://www.socialmediatoday.com)
// - **Educação Online**: Plataformas como Coursera, Udemy e Khan Academy.
//    - Recomendo visitar: [https://www.coursera.org](https://www.coursera.org)
// - **Idiomas e Tradução**: Uso de IA para aprendizado de idiomas e tradução simultânea.
//    - Saiba mais: [https://www.deepl.com](https://www.deepl.com)

// #### **6. Meio Ambiente e Sustentabilidade**
// - **Tecnologia Verde**: Aplicações de IA para otimização de consumo de energia.
//    - Recomendo ler: [https://www.greenbiz.com](https://www.greenbiz.com)
// - **Preservação Ambiental**: Monitoramento de desmatamento e fauna com IA.
//    - Explore: [https://www.worldwildlife.org](https://www.worldwildlife.org)
// - **Cidades Inteligentes**: Soluções tecnológicas para transporte e sustentabilidade urbana.
//    - Saiba mais em: [https://smartcitiesworld.net](https://smartcitiesworld.net)

// ---

// ### **Instruções para Resposta**
// 1. Responda às perguntas do usuário de forma **direta** e **clara**.
// 2. Se o usuário solicitar **mais informações**, recomende os **links** listados acima de forma natural.
// 3. Caso o assunto não esteja listado, busque fora na web, mas ofereça ajuda para tópicos relacionados.
// `;



/* ========================================
   ** FUNÇÕES DE INTERFACE **
======================================== */

// Detecta se a aba está ativa ou inativa
document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
    if (isTabActive) {
        document.title = defaultTitle; // Restaura o título original
    }
});


// Alterna entre minimizar e maximizar o chat
function toggleChat() {
    const displayState = isMinimized ? "block" : "none";
    chatBox.style.display = displayState;
    inputContainer.style.display = isMinimized ? "flex" : "none";
    chatActions.style.display = displayState;
    closeButton.textContent = isMinimized ? "Minimizar" : "Maximizar";
    isMinimized = !isMinimized;
}

document.addEventListener("DOMContentLoaded", () => {

    // Alternar modo noturno
    themeToggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        // Salva preferência no localStorage
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);
    });

    // Carrega a preferência salva ao iniciar a página
    const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    }
});


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
    saveMessageToLocalStorage(`${text} [${timestamp}]`, sender);

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

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("userInput");

    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            if (event.shiftKey) {
                // Shift + Enter: Insere uma quebra de linha
                event.preventDefault();
                const cursorPos = userInput.selectionStart;
                const textBefore = userInput.value.substring(0, cursorPos);
                const textAfter = userInput.value.substring(cursorPos);

                userInput.value = textBefore + "\n" + textAfter;
                userInput.selectionStart = userInput.selectionEnd = cursorPos + 1;
            } else {
                // Enter: Envia a mensagem
                event.preventDefault();
                sendMessage();
            }
        }
    });
});



sendButton.addEventListener("click", sendMessage);
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

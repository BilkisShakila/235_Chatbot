const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

let messageHistory = [];

function appendMessage(role, text) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  
  if (role === "user") {
    messageDiv.classList.add("user-message");
  } else {
    messageDiv.classList.add("bot-message");
  }
  
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv;
}

async function handleSendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

  appendMessage("user", text);
  messageHistory.push({ role: "user", content: text });

  const botMessageDiv = appendMessage("assistant", "");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: messageHistory }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Gagal terhubung ke server.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantReply = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Sisakan baris yang belum lengkap di buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          // Backend mengirim JSON.stringify(content), jadi kita parse untuk mengambil string aslinya
          const content = JSON.parse(dataStr);
          if (content) {
            assistantReply += content;
            botMessageDiv.textContent = assistantReply;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) {
          // Abaikan jika ada potongan data yang belum valid JSON
        }
      }
    }

 
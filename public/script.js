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


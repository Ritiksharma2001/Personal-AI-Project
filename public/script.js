let recognition;
let isListening = false;

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

function removeEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
}

function addMessage(sender, text) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? "🧑" : "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  message.appendChild(avatar);
  message.appendChild(bubble);

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  await askAI(text);
}

async function askAI(message) {
  addMessage("ai", "Thinking...");

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    const aiMessages = document.querySelectorAll(".message.ai .bubble");
    aiMessages[aiMessages.length - 1].textContent = data.reply;

    speak(data.reply);

  } catch (error) {
    const aiMessages = document.querySelectorAll(".message.ai .bubble");
    aiMessages[aiMessages.length - 1].textContent =
      "Sorry, AI se connect nahi ho pa raha.";

    console.error(error);
  }
}

function startListening() {
  if (isListening) return;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    addMessage("ai", "Sorry, your browser voice recognition support nahi karta.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  isListening = true;
  addMessage("ai", "Listening... 🎤");

  recognition.start();

  recognition.onresult = async function (event) {
    const text = event.results[0][0].transcript;

    addMessage("user", text);
    await askAI(text);
  };

  recognition.onerror = function () {
    addMessage("ai", "Mic error aa gaya. Please try again.");
    isListening = false;
  };

  recognition.onend = function () {
    isListening = false;
  };
}

function stopListening() {
  if (recognition) {
    recognition.stop();
    isListening = false;
    addMessage("ai", "Mic stopped.");
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  const cleanText = removeEmojis(text);

  const speech = new SpeechSynthesisUtterance(cleanText);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function testVoice() {
  speak("Everything is working properly, Ritik sir.");
}

function newChat() {
  chatBox.innerHTML = `
    <div class="message ai">
      <div class="avatar">🤖</div>
      <div class="bubble">
        New chat started. How can I help you?
      </div>
    </div>
  `;
}

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});
let recognition;
let isListening = false;

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");


/* REMOVE EMOJIS FROM VOICE */
function removeEmojis(text) {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "");
}


/* ADD MESSAGE */
function addMessage(sender, text) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? "🧑" : "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  if (sender === "ai") {
    const speakBtn = document.createElement("button");
    speakBtn.className = "speak-btn";
    speakBtn.textContent = "🔊";
    speakBtn.onclick = function () {
      speak(bubble.textContent);
    };

    bubble.appendChild(document.createElement("br"));
    bubble.appendChild(speakBtn);
  }

  message.appendChild(avatar);
  message.appendChild(bubble);

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}



/* COMMAND SYSTEM */
function handleCommand(text) {

  const command = text.toLowerCase();


  if (command.includes("open youtube")) {

    addMessage("ai", "Opening YouTube.");
    speak("Opening YouTube.");

    window.open(
      "https://youtube.com",
      "_blank"
    );

    return true;
  }


  if (command.includes("open google")) {

    addMessage("ai", "Opening Google.");
    speak("Opening Google.");

    window.open(
      "https://google.com",
      "_blank"
    );

    return true;
  }


  if (command.includes("open instagram")) {

    addMessage("ai", "Opening Instagram.");
    speak("Opening Instagram.");

    window.open(
      "https://instagram.com",
      "_blank"
    );

    return true;
  }


  if (command.includes("open chatgpt")) {

    addMessage("ai", "Opening ChatGPT.");
    speak("Opening ChatGPT.");

    window.open(
      "https://chatgpt.com",
      "_blank"
    );

    return true;
  }


  if (command.includes("open github")) {

    addMessage("ai", "Opening GitHub.");
    speak("Opening GitHub.");

    window.open(
      "https://github.com",
      "_blank"
    );

    return true;
  }


  if (command.includes("time")) {

    const time = new Date()
      .toLocaleTimeString();

    addMessage(
      "ai",
      `Current time is ${time}`
    );

    speak(
      `Current time is ${time}`
    );

    return true;
  }


  if (command.includes("date")) {

    const date = new Date()
      .toDateString();

    addMessage(
      "ai",
      `Today's date is ${date}`
    );

    speak(
      `Today's date is ${date}`
    );

    return true;
  }


  return false;
}




/* SEND MESSAGE */
async function sendMessage() {

  const text = userInput.value.trim();

  if (!text) return;


  addMessage(
    "user",
    text
  );


  userInput.value = "";


  const commandFound =
    handleCommand(text);


  if (commandFound) return;


  await askAI(text);
}




/* AI REQUEST */
async function askAI(message) {


  addMessage(
    "ai",
    "Thinking..."
  );


  try {

    const response = await fetch(
      "/ask",
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({
          message
        })
      }
    );


    const data =
      await response.json();


    const aiMessages =
      document.querySelectorAll(
        ".message.ai .bubble"
      );


    aiMessages[
      aiMessages.length - 1
    ].textContent = data.reply;


    // speak(
    //   data.reply
    // );


  }

  catch(error) {


    const aiMessages =
      document.querySelectorAll(
        ".message.ai .bubble"
      );


    aiMessages[
      aiMessages.length - 1
    ].textContent =
    "Sorry, I cannot connect right now.";


    console.error(error);

  }

}




/* START VOICE */
function startListening() {


  if (isListening) return;


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    addMessage(
      "ai",
      "Your browser does not support voice recognition."
    );

    return;
  }



  recognition =
    new SpeechRecognition();



  recognition.lang =
    "en-US";


  recognition.continuous =
    false;


  recognition.interimResults =
    false;



  isListening = true;


  addMessage(
    "ai",
    "Listening..."
  );



  recognition.start();



  recognition.onresult =
  async function(event) {


    const text =
      event.results[0][0]
      .transcript;



    addMessage(
      "user",
      text
    );



    const commandFound =
      handleCommand(text);



    if(commandFound)
      return;



    await askAI(text);

  };



  recognition.onerror =
  function() {

    addMessage(
      "ai",
      "Microphone error. Try again."
    );


    isListening = false;

  };



  recognition.onend =
  function() {

    isListening = false;

  };


}




/* STOP MIC */
function stopListening() {

  if(recognition){

    recognition.stop();

    isListening = false;

    addMessage(
      "ai",
      "Microphone stopped."
    );

  }

}




/* SPEAK */
function speak(text) {


  if(
    !"speechSynthesis"
    in window
  )
  return;


  const cleanText =
    removeEmojis(text);



  const speech =
    new SpeechSynthesisUtterance(
      cleanText
    );


  speech.lang =
    "en-US";


  speech.rate = 1;


  speech.pitch = 0.8;



  window.speechSynthesis
  .cancel();



  window.speechSynthesis
  .speak(speech);

}




/* TEST VOICE */
function testVoice(){

  speak(
    "Everything is working properly, Ritik sir."
  );

}



/* NEW CHAT */
function newChat(){

  chatBox.innerHTML =
  `
  <div class="message ai">

  <div class="avatar">
  🤖
  </div>

  <div class="bubble">
  New chat started. How can I help you?
  </div>

  </div>
  `;

}




/* ENTER KEY */
userInput.addEventListener(
  "keydown",
  function(e){

    if(
      e.key === "Enter"
    ){

      sendMessage();

    }

  }
);
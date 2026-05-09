let recognition;
let isListening = false;


// 🎤 START LISTENING
function startListening() {

  if (isListening) return;

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  isListening = true;

  updateOutput('🎤 Listening...');

  recognition.onresult = function(event) {

    const text = event.results[0][0].transcript.toLowerCase();

    updateOutput('🧑 You: ' + text);

    // 🚀 COMMANDS

    // OPEN WEBSITES
    if (text.includes('open youtube')) {
      speak('Opening YouTube');
      window.open('https://youtube.com');
      stopListening();
      return;
    }

    if (text.includes('open chrome')) {
      speak('Opening Chrome');
      window.open('https:// google.com/chrome');
      stopListening();
      return;
    }

    if (text.includes('open google')) {
      speak('Opening Google');
      window.open('https://google.com');
      stopListening();
      return;
    }

    if (text.includes('open instagram')) {
      speak('Opening Instagram');
      window.open('https://instagram.com');
      stopListening();
      return;
    }

    if (text.includes('open chat')) {
      speak('Opening ChatGPT');
      window.open('https://chatgpt.com/');
      stopListening();
      return;
    }


    // SEARCH GOOGLE
    if (text.includes('search')) {

      const searchText = text.replace('search', '');

      speak('Searching ' + searchText);

      window.open(
        `https://www.google.com/search?q=${searchText}`
      );

      stopListening();
      return;
    }


    // TIME
    if (text.includes('what time')) {

      const time = new Date().toLocaleTimeString();

      speak('Current time is ' + time);

      stopListening();
      return;
    }


    // DATE
    if (text.includes('what date')) {

      const date = new Date().toDateString();

      speak('Today is ' + date);

      stopListening();
      return;
    }


    // BATTERY STATUS
    if (text.includes('battery')) {

      navigator.getBattery().then(function(battery) {

        const level = Math.floor(battery.level * 100);

        speak('Battery is at ' + level + ' percent');
      });

      stopListening();
      return;
    }


    // WEATHER
    if (text.includes('weather')) {

      speak('Opening weather report');

      window.open('https://www.google.com/search?q=weather');

      stopListening();
      return;
    }


    // JOKES
    if (text.includes('tell me a joke')) {

      const jokes = [
        'Why do programmers hate nature? Too many bugs.',
        'I told my computer I needed a break. It said no problem and crashed.',
        'Why was the JavaScript developer sad? Because he did not Node how to Express himself.'
      ];

      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

      updateOutput('🤖 AI: ' + randomJoke);

      speak(randomJoke);

      stopListening();
      return;
    }


    // 🤖 AI RESPONSE
    getAIResponse(text);

    stopListening();
  };


  recognition.onerror = function(event) {

    console.log('Mic Error:', event.error);

    updateOutput('❌ Mic Error: ' + event.error);

    isListening = false;
  };


  recognition.onend = function() {

    isListening = false;

    console.log('Mic stopped');
  };


  recognition.start();
}


// ⛔ STOP MIC
function stopListening() {

  if (recognition && isListening) {

    recognition.stop();

    isListening = false;

    updateOutput('⛔ Mic Stopped');
  }
}


// 🤖 GEMINI AI RESPONSE
async function getAIResponse(message) {

  speak('Thinking...');

  try {

    const response = await fetch('http://localhost:3000/ask', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({ message })
    });


    const data = await response.json();


    if (!data.reply) {
      throw new Error('No reply from AI');
    }


    updateOutput('🤖 AI: ' + data.reply);

    speak(data.reply);

  } catch (error) {

    console.error(error);

    updateOutput('❌ Error connecting to AI');

    speak('Fuck you, Speak properly');
  }
}


// 🔊 SPEAK FUNCTION
function speak(message) {

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);

  speech.lang = 'en-IN';
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

// 🖥️ UPDATE OUTPUT BOX
function updateOutput(message) {

    document.getElementById('output').innerText = message;
  }
  
  
  // 🚀 WELCOME MESSAGE WHEN PAGE LOADS
  window.onload = function() {
  
    updateOutput('🤖 Jarvis Ready...');
  
    speak('hey, how can i help you today');
  }
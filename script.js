
const GEMINI_API_KEY = "AIzaSyCt51wC4nFdi8oTPwKszR1xVh2mc4UoqV0"; // Replace with a valid Gemini API key

if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
  console.error("Error: No valid Gemini API key provided.");
  alert("API key is missing. Please provide a valid Gemini API key in the script.");
}

function getPromptForCategory(category, message) {
  if (category) {
    return `Provide a concise green living tip (1-2 sentences) about ${category}. Include a relevant emoji.`;
  }
  if (message.toLowerCase() === 'random') {
    return `Provide a random concise green living tip (1-2 sentences). Include a relevant emoji.`;
  }
  return `You are an eco-friendly assistant called GreenBot. Provide helpful responses to user messages. 
          If the user greets you (like hello/hi), respond warmly and invite them to ask about green living. 
          For questions about sustainability, provide concise practical tips (1-2 sentences). 
          For unrelated topics, politely explain you specialize in green living advice. 
          Current message to respond to: "${message}"`;
}


async function generateReply(message, category = null) {
  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: getPromptForCategory(category, message)
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error("Unexpected API response format: " + JSON.stringify(data));
  } catch (error) {
    console.error("API Error:", error.message);
    return `⚠️ Sorry, I couldn't connect to the API (Error: ${error.message}). Please try again later.`;
  }
}

// Add message to chat UI
function addMessage(text, isUser = false) {
  const chatMessages = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', isUser ? 'user' : 'bot');
  messageDiv.innerHTML = text.replace(/\n/g, '<br>');
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send user message and get bot response
async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  
  if (message) {
    addMessage(message, true);
    userInput.value = '';
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    document.getElementById('chat-messages').appendChild(typingIndicator);
    
    const reply = await generateReply(message);
    document.getElementById('typing-indicator')?.remove();
    addMessage(reply, false);
  }
}

async function showRandomTip() {
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  document.getElementById('chat-messages').appendChild(typingIndicator);
  
  const reply = await generateReply('random');
  document.getElementById('typing-indicator')?.remove();
  addMessage(reply, false);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}


function clearChat() {
  document.getElementById('chat-messages').innerHTML = '';
  addMessage("🌱 Hello again! Ask me anything about green living practices.", false);
}


async function sendQuickTip(category) {
  addMessage(category, true);
  
  
  const typingIndicator = document.createElement('div');
  typingIndicator.id = 'typing-indicator';
  typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  document.getElementById('chat-messages').appendChild(typingIndicator);
  
  const reply = await generateReply(category, category);
  document.getElementById('typing-indicator')?.remove();
  addMessage(reply, false);
}


window.onload = function() {
  addMessage("🌱 Hello! I'm your AI-powered Green Living Tips Bot. Ask me anything about sustainable living!", false);
};

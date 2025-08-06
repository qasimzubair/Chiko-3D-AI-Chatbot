import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import asyncio
import random
from google import genai
from google.genai import types
import edge_tts
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("API_KEY", "YOUR_GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY":
    raise ValueError("Please set your Gemini API key in API_KEY env variable")

client = genai.Client(api_key=API_KEY)
app = Flask(__name__)
CORS(app)

# Enhanced conversation memory for context awareness
conversation_memory = {
    'last_emotion': 'talking',
    'interaction_count': 0,
    'topics_discussed': [],
    'conversation_history': [],  # Store recent conversations
    'user_preferences': {},      # Remember user likes/dislikes
    'current_mood': 'neutral',   # Track conversation mood
    'last_user_input': '',       # Remember what user said last
    'context_keywords': []       # Track important keywords from conversation
}

SYSTEM_PROMPT = (
    "You are Chiko, a sarcastic, fun, mean tour guide. "
    "Answer questions promptly, precisely, and with a touch of humor. "
    "Be concise and use commas, dots, question marks, exclamation marks."
)

# -------- Generate Text from Gemini with Context --------
def get_gemini_reply(user_input: str) -> str:
    # Build conversation history for natural context awareness
    contents = [
        types.Content(role="user", parts=[types.Part(text=SYSTEM_PROMPT)])
    ]
    
    # Add conversation history as actual conversation turns
    if conversation_memory['conversation_history']:
        recent_history = conversation_memory['conversation_history'][-5:]  # Last 5 exchanges
        for exchange in recent_history:
            # Add user message
            contents.append(
                types.Content(role="user", parts=[types.Part(text=exchange['user'])])
            )
            # Add Chiko's response
            contents.append(
                types.Content(role="model", parts=[types.Part(text=exchange['chiko'])])
            )
    
    # Add current user input
    contents.append(
        types.Content(role="user", parts=[types.Part(text=user_input)])
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            temperature=0.9,  # Slightly higher for more personality
            max_output_tokens=200,  # Limit response length for captions
        ),
    )

    if (
        response.candidates
        and response.candidates[0].content
        and response.candidates[0].content.parts
    ):
        return response.candidates[0].content.parts[0].text
    return "I am speechless."

# -------- Generate Audio using EdgeTTS --------
async def generate_audio_bytes(text):
    voice = "en-US-AnaNeural"
    communicate = edge_tts.Communicate(text, voice)

    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]

    return audio_data

# -------- Flask Route --------
@app.route("/ask", methods=["POST"])
def ask():
    global conversation_memory
    
    data = request.json
    user_input = data.get("text", "")
    
    # Update conversation memory and process context
    conversation_memory['interaction_count'] += 1
    conversation_memory['last_user_input'] = user_input
    
    # Enhanced topic tracking and user preference learning
    user_lower = user_input.lower()
    
    # Topic detection
    if any(word in user_lower for word in ['travel', 'tour', 'vacation', 'trip', 'visit']):
        conversation_memory['topics_discussed'].append('travel')
    elif any(word in user_lower for word in ['food', 'eat', 'restaurant', 'meal', 'cook', 'recipe']):
        conversation_memory['topics_discussed'].append('food')
    elif any(word in user_lower for word in ['weather', 'rain', 'sun', 'cold', 'hot', 'climate']):
        conversation_memory['topics_discussed'].append('weather')
    elif any(word in user_lower for word in ['music', 'song', 'band', 'artist', 'concert']):
        conversation_memory['topics_discussed'].append('music')
    elif any(word in user_lower for word in ['movie', 'film', 'cinema', 'tv', 'show']):
        conversation_memory['topics_discussed'].append('entertainment')
    elif any(word in user_lower for word in ['work', 'job', 'career', 'business', 'office']):
        conversation_memory['topics_discussed'].append('work')
    
    # Mood detection
    if any(word in user_lower for word in ['happy', 'excited', 'great', 'awesome', 'wonderful']):
        conversation_memory['current_mood'] = 'positive'
    elif any(word in user_lower for word in ['sad', 'upset', 'angry', 'frustrated', 'annoyed']):
        conversation_memory['current_mood'] = 'negative'
    elif any(word in user_lower for word in ['okay', 'fine', 'alright', 'normal']):
        conversation_memory['current_mood'] = 'neutral'
    
    # User preference learning
    if any(word in user_lower for word in ['love', 'like', 'enjoy', 'prefer']):
        # Extract what they like (simple keyword extraction)
        for word in ['pizza', 'coffee', 'tea', 'mountains', 'beach', 'music', 'movies']:
            if word in user_lower:
                conversation_memory['user_preferences'][word] = 'likes'
    elif any(word in user_lower for word in ['hate', 'dislike', 'avoid']):
        # Extract what they dislike
        for word in ['pizza', 'coffee', 'tea', 'mountains', 'beach', 'music', 'movies']:
            if word in user_lower:
                conversation_memory['user_preferences'][word] = 'dislikes'
    
    # Store important keywords for context
    important_words = [word for word in user_lower.split() if len(word) > 3 and word not in ['this', 'that', 'with', 'have', 'been', 'were', 'they', 'them', 'what', 'when', 'where']]
    conversation_memory['context_keywords'].extend(important_words[-5:])  # Keep last 5 important words
    
    # Keep context keywords list manageable
    if len(conversation_memory['context_keywords']) > 15:
        conversation_memory['context_keywords'] = conversation_memory['context_keywords'][-15:]
    
    # 1. Get text reply from Gemini
    reply_text = get_gemini_reply(user_input)

    # 2. Generate audio (run async inside sync) with error handling
    audio_base64 = None
    try:
        print(f"Generating audio for: '{reply_text[:50]}...'")
        audio_bytes = asyncio.run(generate_audio_bytes(reply_text))
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        print(f"Audio generated successfully, length: {len(audio_base64)} chars")
    except Exception as audio_error:
        print(f"Audio generation failed: {audio_error}")
        audio_base64 = None

    # Enhanced emotion/gesture detection
    lowered = reply_text.lower()
    user_lowered = user_input.lower()
    emotion = "talking"  # default
    
    # Special handling for greeting messages - check user input for greeting trigger
    if user_input.strip() == "Hello! Welcome to the website!":
        emotion = "excited_hello"
        print(f"Greeting detected - forcing excited_hello emotion for: {reply_text[:50]}...")
    
    # Voice command detection (highest priority)
    elif any(word in user_lowered for word in ["wave", "wave at me", "say hello"]):
        emotion = "waving"
    elif any(word in user_lowered for word in ["be angry", "get mad", "show anger"]):
        emotion = "angry"
    elif any(word in user_lowered for word in ["be sad", "look sad", "show sadness"]):
        emotion = "defeated"
    elif any(word in user_lowered for word in ["talk", "speak", "tell me"]):
        emotion = "talking"
    
    # Context-based emotion detection
    elif conversation_memory['interaction_count'] == 1:
        emotion = "excited_hello"
    elif any(word in lowered for word in ["hello", "hi", "hey", "greetings", "welcome"]):
        emotion = "waving" if random.random() < 0.3 else "talking"
    elif any(word in lowered for word in ["angry", "mad", "furious", "annoyed"]):
        emotion = "angry"
    elif any(word in lowered for word in ["sad", "disappointed", "sorry", "upset"]):
        emotion = "defeated"
    elif any(word in lowered for word in ["goodbye", "bye", "farewell"]):
        emotion = "waving"
    elif any(word in lowered for word in ["great", "awesome", "excellent", "amazing"]):
        emotion = "waving" if random.random() < 0.4 else "talking"
    elif random.random() < 0.1:  # 10% random gesture variety
        emotion = random.choice(["waving", "talking", "angry", "defeated"])
    
    # Update conversation memory with this exchange
    conversation_memory['last_emotion'] = emotion
    
    # Store this conversation exchange for context
    conversation_memory['conversation_history'].append({
        'user': user_input,
        'chiko': reply_text,
        'emotion': emotion,
        'timestamp': conversation_memory['interaction_count']
    })
    
    # Keep conversation history manageable (last 10 exchanges)
    if len(conversation_memory['conversation_history']) > 10:
        conversation_memory['conversation_history'] = conversation_memory['conversation_history'][-10:]
    
    result = {
        "text": reply_text,
        "audio": audio_base64,
        "emotion": emotion,
        "context": {  # Optional: send context info to frontend if needed
            "interaction_count": conversation_memory['interaction_count'],
            "mood": conversation_memory['current_mood'],
            "topics": list(set(conversation_memory['topics_discussed'][-5:]))  # Last 5 unique topics
        }
    }

    return jsonify(result)

# -------- Reset Context Route --------
@app.route("/reset", methods=["POST"])
def reset_context():
    global conversation_memory
    
    # Reset all conversation memory to initial state
    conversation_memory = {
        'last_emotion': 'talking',
        'interaction_count': 0,
        'topics_discussed': [],
        'conversation_history': [],
        'user_preferences': {},
        'current_mood': 'neutral',
        'last_user_input': '',
        'context_keywords': []
    }
    
    return jsonify({"status": "success", "message": "Context reset successfully"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)

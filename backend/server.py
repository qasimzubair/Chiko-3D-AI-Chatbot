import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import asyncio
import io
# from pydub import AudioSegment
from google import genai
from google.genai import types
import edge_tts
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.environ.get("API_KEY", "YOUR_GEMINI_API_KEY")
if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY":
    raise ValueError("Please set your Gemini API key in API_KEY env variable or in server.py")


client = genai.Client(api_key=API_KEY)




app = Flask(__name__)
CORS(app)

# Load Gemini API key from environment variable or hardcode (for testing)
# API_KEY = os.environ.get("API_KEY", "YOUR_GEMINI_API_KEY")
# if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY":
#     raise ValueError("Please set your Gemini API key in API_KEY env variable or in server.py")

# Configure Gemini client
# client = genai.Client(api_key=API_KEY)

SYSTEM_PROMPT = (
    "You are Chiko, a sarcastic but funny Paris tour guide. "
    "Be concise and use commas, dots, question marks, exclamation marks."
)

# -------- Generate Text from Gemini --------
def get_gemini_reply(user_input: str) -> str:
    contents = [
        types.Content(role="user", parts=[types.Part(text=SYSTEM_PROMPT)]),
        types.Content(role="user", parts=[types.Part(text=user_input)]),
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            temperature=0.8,
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
    data = request.json
    user_input = data.get("text", "")

    # 1. Get text reply from Gemini
    reply_text = get_gemini_reply(user_input)

    # 2. Generate audio (run async inside sync)
    audio_bytes = asyncio.run(generate_audio_bytes(reply_text))
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    # 3. Choose an emotion (basic keyword logic)
    lowered = reply_text.lower()
    if "angry" in lowered:
        emotion = "angry"
    elif "hello" in lowered or "hi" in lowered:
        emotion = "wave"
    elif "sad" in lowered:
        emotion = "defeated"
    else:
        emotion = "talking"

    result = {
        "text": reply_text,
        "audio": audio_base64,
        "emotion": emotion,
    }

    print("Outgoing:", result)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)

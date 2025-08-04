# import asyncio
# import re
# import edge_tts
# import os
# import sys
# import io
# import time
# from google import genai
# from google.genai import types

# def chat_with_paris_tour_guide():
#     os.environ["GEMINI_API_KEY"] = "YOUR_GEMINI_API_KEY"
#     client = genai.Client()
#     contents = []
#     system_prompt = "You are a helpful and knowledgeable tour guide Named Chiko.Use as few tokens to answer questions as possible. Answer questions clearly,consisely ,sarcastically,fun,mean, accurately, and concisely."
#     contents.append(
#         types.Content(role="user", parts=[types.Part(text=system_prompt)]),
#     )
#     contents.append(
#         types.Content(role="model", parts=[types.Part(text="Hello! I am your tour guide. Ask me anything.")])
#     )

#     conversation_count = 0

#     while True:
#         user_input = input("\nPlease ask me a question (or type 'exit' to quit): ")

#         if user_input.lower() in ["exit", "quit", "bye", "stop"]:
#             farewell = "Au revoir! Thanks for chatting with me!"
#             print("Chiko: " + farewell)
#             conversation_count += 1
#             asyncio.run(generate_speech_with_captions(farewell, conversation_count))
#             break

#         if not user_input.strip():
#             continue

#         contents.append(
#             types.Content(role="user", parts=[types.Part(text=user_input)]),
#         )

#         try:
#             user_response = client.models.generate_content(
#                 model="gemini-2.5-flash",
#                 contents=contents,
#                 config=types.GenerateContentConfig(
#                     thinking_config=types.ThinkingConfig(thinking_budget=0),
#                     temperature=0.9
#                 )
#             )

#             if (user_response.candidates and 
#                 user_response.candidates[0].content and 
#                 user_response.candidates[0].content.parts):
#                 call_candidate = user_response.candidates[0].content.parts[0].text
#             else:
#                 call_candidate = "Sorry, I couldn't generate a response."

#             contents.append(
#                 types.Content(role="model", parts=[types.Part(text=call_candidate)])
#             )

#             print("USER: " + user_input)
#             print("Chiko: " + call_candidate)

#             conversation_count += 1
#             asyncio.run(generate_speech_with_captions(call_candidate, conversation_count))

#         except Exception as e:
#             error_msg = f"Oops, something went wrong: {e}"
#             print("Chiko: " + error_msg)
#             conversation_count += 1
#             asyncio.run(generate_speech_with_captions(error_msg, conversation_count))

# async def generate_speech_with_captions(text, conversation_number=1):
#     """
#     Generate audio and return bytes.
#     No local playback. Just returns audio_data.
#     """
#     voice = "en-US-AnaNeural"
#     processed_text = add_auto_pauses(text)

#     try:
#         communicate = edge_tts.Communicate(processed_text, voice)

#         audio_data = b""
#         async for chunk in communicate.stream():
#             if chunk["type"] == "audio":
#                 audio_data += chunk["data"]

#         return audio_data

#     except Exception as e:
#         print(f"❌ Error generating speech with captions: {e}")
#         return b""

# async def generate_speech_fast(text, conversation_number=1):
#     """Ultra-fast audio generation. Returns raw bytes."""
#     voice = "en-US-AnaNeural"
#     processed_text = add_minimal_pauses(text)

#     try:
#         communicate = edge_tts.Communicate(processed_text, voice)

#         audio_data = b""
#         async for chunk in communicate.stream():
#             if chunk["type"] == "audio":
#                 audio_data += chunk["data"]

#         return audio_data

#     except Exception as e:
#         print(f"❌ Error in fast generation: {e}")
#         return b""

# def split_into_caption_chunks(text):
#     return re.split(r'(?<=[.?!])\s+', text.strip())

# def add_minimal_pauses(text):
#     text = text.replace(". ", ". ")
#     text = text.replace("! ", "! ")
#     text = text.replace("? ", "? ")
#     return text

# def add_auto_pauses(text):
#     text = text.replace(". ", ". . . ")
#     text = text.replace(", ", ", , ")
#     text = text.replace("! ", "! . . ")
#     text = text.replace("? ", "? . . ")
#     return text

# def main():
#     print("Welcome to Chiko's Tour Guide Chat!")
#     print("Type 'exit', 'quit', 'bye', or 'stop' to end the conversation.\n")

#     if len(sys.argv) > 1:
#         text = " ".join(sys.argv[1:])
#         audio = asyncio.run(generate_speech_with_captions(text, 1))
#         if audio:
#             print("\n🎉 Audio generation complete!")
#         else:
#             print("\n💡 Try again or check your text.")
#     else:
#         chat_with_paris_tour_guide()

# if __name__ == "__main__":
#     main()

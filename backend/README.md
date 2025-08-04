# Chatbot Backend

This is the backend for the 3D Chatbot application featuring Chiko, a tour guide assistant.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file in the backend directory with your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   
3. Edit the `.env` file and replace `your_gemini_api_key_here` with your actual Gemini API key.

## Usage

Run the chatbot:
```bash
python text_to_speech.py
```

Or generate speech for a specific text:
```bash
python text_to_speech.py "Hello, this is a test message"
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

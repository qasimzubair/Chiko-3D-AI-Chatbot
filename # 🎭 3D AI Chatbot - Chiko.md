# 🎭 3D AI Chatbot - Chiko

A sophisticated 3D AI-powered chatbot featuring real-time animations, context-aware conversations, and immersive audio-visual interactions. Meet **Chiko** - your sarcastic, fun, and engaging AI bot with a full 3D animated personality.

## ✨ Features

### 🤖 **Advanced AI Conversations**
- **Context-Aware Memory**: Remembers previous conversations, topics, and user preferences
- **Personality-Driven**: Sarcastic, fun, and engaging responses powered by Google Gemini 2.5 Flash
- **Mood Detection**: Tracks conversation sentiment and adapts responses accordingly
- **Topic Learning**: Automatically categorizes discussions (travel, food, weather, entertainment, etc.)

### 🎭 **Real-Time 3D Animations**
- **Command-Triggered Animations**: Direct animation control via voice commands
- **Emotion Mapping**: Automatic animation selection based on conversation context
- **Professional Rigging**: Mixamo-based skeletal animation system
- **Smooth Transitions**: Seamless animation blending and timing

### 🎵 **Immersive Audio System**
- **Text-to-Speech**: Microsoft EdgeTTS with natural-sounding voice (en-US-AnaNeural)
- **Auto-Generated Audio**: Every response converted to speech automatically
- **Smart Autoplay**: Multiple fallback strategies for browser restrictions
- **Synchronized Captions**: Visual text display synced with audio playback

### 📱 **Responsive Design**
- **Mobile-Optimized**: Touch-friendly controls and optimized 3D rendering
- **Glassmorphism UI**: Modern, elegant interface with smooth animations
- **Cross-Platform**: Compatible with all modern browsers and devices
- **Performance Optimized**: Efficient 3D rendering for mobile GPUs

## 🚀 Quick Start

### Prerequisites
```bash
# Frontend Requirements
- Node.js 18+
- npm or yarn

# Backend Requirements  
- Python 3.8+
- pip
- Google Gemini API Key
```

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/qasimzubair/Chiko-3D-AI-Chatbot
cd Chiko-3D-AI-Chatbot
```

2. **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

3. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install flask flask-cors google-generativeai edge-tts python-dotenv

# Create environment file
echo "API_KEY=your_gemini_api_key_here" > .env

# Start Flask server
python server.py
```

4. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file in the backend directory

5. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

## 🎮 Usage Guide

### **Basic Interaction**
1. **Visit the Website** → Chiko automatically greets you with audio and animation
2. **Type Your Message** → Use the chat input at the bottom right
3. **Press Enter** → Send your message (Shift+Enter for new lines)
4. **Watch & Listen** → Chiko responds with synchronized animation, audio, and captions

### **Animation Commands**
Trigger specific animations by typing these commands:

| Command | Animation | Effect |
|---------|-----------|--------|
| `"be angry"` | Angry | Aggressive gestures |
| `"get mad"` | Angry | Furious expressions |
| `"wave at me"` | Waving | Friendly greeting |
| `"say hello"` | Waving | Welcome gesture |
| `"be sad"` | Defeated | Disappointed pose |
| `"start talking"` | Talking | Conversational movements |

### **Advanced Controls**
Open browser console for programmatic control:
```javascript
// Check available animations
avatarAnimations.available()

// Trigger specific animation
avatarAnimations.trigger('angry', 5)  // Play for 5 seconds

// Loop animation continuously
avatarAnimations.loop('talking')

// Stop current animation
avatarAnimations.stop()
```

## 🏗️ Architecture

### **System Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│   (Next.js)     │◄──►│    (Flask)       │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • React Three   │    │ • Gemini AI      │    │ • Google AI     │
│ • Three.js      │    │ • EdgeTTS        │    │ • EdgeTTS API   │
│ • Audio System  │    │ • Context Memory │    │                 │
│ • UI/UX         │    │ • Emotion Logic  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **User Input** → Frontend captures and processes
2. **API Request** → Sent to Flask backend with context
3. **AI Processing** → Gemini generates contextual response
4. **Audio Generation** → EdgeTTS converts text to speech
5. **Emotion Detection** → Backend analyzes for appropriate animation
6. **Response Package** → Text, audio, and emotion data returned
7. **Frontend Rendering** → 3D animation, audio playback, and captions displayed

## 📁 Project Structure

```
chatBot3D-v2/
├── app/
│   ├── page.js                 # Main application component
│   ├── layout.js              # App layout and metadata
│   └── globals.css            # Global styles
├── components/
│   └── Avatar.jsx             # 3D character component
├── backend/
│   ├── server.py              # Flask API server
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
├── public/
│   ├── scene.gltf            # Primary 3D character model
│   ├── model.glb             # Fallback 3D model
│   ├── textures/             # Character textures
│   └── animations/           # FBX animation files
└── package.json              # Node.js dependencies
```

## 🛠️ Technical Details

### **Frontend Stack**
- **Framework**: Next.js 14 with React 18
- **3D Engine**: Three.js with React Three Fiber (@react-three/fiber)
- **3D Utilities**: React Three Drei (@react-three/drei)
- **Styling**: Bootstrap 5 + Custom CSS with Glassmorphism
- **Audio**: Web Audio API with autoplay optimization

### **Backend Stack**
- **Server**: Flask with CORS support
- **AI Model**: Google Gemini 2.5 Flash
- **TTS Engine**: Microsoft EdgeTTS (en-US-AnaNeural)
- **Memory**: In-memory conversation storage
- **Audio Processing**: Base64 encoding for efficient transfer

### **3D Assets**
- **Primary Model**: `scene.gltf` (Mixamo-rigged character)
- **Fallback Model**: `model.glb` (basic character)
- **Textures**: PBR materials (diffuse, normal, specular)
- **Animations**: Command-triggered with emotion mapping

## 🔧 Configuration

### **Environment Variables**

**Backend (`.env`):**
```env
API_KEY=your_gemini_api_key_here
```

**Frontend (Optional - `next.config.js`):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
```

### **Conversation Memory Settings**
```python
conversation_memory = {
    'conversation_history': [],    # Max 10 exchanges
    'topics_discussed': [],        # Auto-categorized topics
    'user_preferences': {},        # Learned likes/dislikes
    'current_mood': 'neutral',     # positive/negative/neutral
    'context_keywords': [],        # Max 15 important terms
    'interaction_count': 0         # Session tracking
}
```

## 🎨 Customization

### **Character Personality**
Modify the system prompt in `backend/server.py`:
```python
SYSTEM_PROMPT = (
    "You are Chiko, a sarcastic, fun, mean tour guide. "
    "Answer questions promptly, precisely, and with a touch of humor. "
    "Be concise and use commas, dots, question marks, exclamation marks."
)
```

### **Voice Settings**
Change the TTS voice in `backend/server.py`:
```python
voice = "en-US-AnaNeural"  # Available: JennyNeural, AriaNeural, etc.
```

### **Animation Mapping**
Customize emotion-to-animation mapping in `components/Avatar.jsx`:
```javascript
const emotionAnimations = {
  'excited_hello': ['waving', 'talking'],
  'angry': ['angry'],
  'defeated': ['defeated'],
  'waving': ['waving'],
  'talking': ['talking']
}
```

### **UI Theme**
Modify colors and styles in `app/globals.css`:
```css
:root {
  --primary-color: #b3d9ff;
  --accent-color: #667eea;
  --text-color: #ffffff;
  --glass-bg: rgba(255, 255, 255, 0.1);
}
```

## 📱 Browser Compatibility

| Browser | Desktop | Mobile | Features |
|---------|---------|--------|----------|
| Chrome | ✅ Full | ✅ Full | Hardware acceleration |
| Safari | ✅ Full | ✅ Full | WebGL, Audio |
| Firefox | ✅ Full | ✅ Good | Standard support |
| Edge | ✅ Full | ✅ Good | Chromium-based |

**Note**: Audio autoplay may be restricted in some browsers due to security policies.

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
# Build production version
npm run build

# Deploy to Vercel
npx vercel --prod

# Or deploy to Netlify
npm run build && npx netlify deploy --prod --dir=out
```

### **Backend (Railway/Heroku)**
```bash
# Prepare for deployment
echo "web: python server.py" > Procfile

# Deploy to Railway
railway login
railway deploy

# Or deploy to Heroku
heroku create your-app-name
git push heroku main
```

### **Environment Variables for Production**
```bash
# Set production API key
export API_KEY="your_production_gemini_api_key"

# Update CORS origins in server.py for production domain
```

## 🔍 Troubleshooting

### **Common Issues**

**1. Audio Not Playing**
- Browsers block autoplay without user interaction
- Try clicking anywhere on the page before expecting audio
- Check browser console for audio-related errors

**2. 3D Model Not Loading**
- Verify `/public/scene.gltf` and `/public/model.glb` exist
- Check browser console for WebGL errors
- Ensure device supports hardware acceleration

**3. API Connection Issues**
- Verify backend server is running on port 5001
- Check CORS configuration in Flask app
- Confirm Gemini API key is valid and has quota

**4. Animation Commands Not Working**
- Ensure exact command syntax (e.g., "be angry")
- Check browser console for animation loading errors
- Verify 3D model contains the requested animations

### **Debug Mode**
Enable additional logging:

**Frontend:**
```javascript
// Add to page.js
console.log('Animation state:', emotion)
console.log('Audio data:', !!data.audio)
```

**Backend:**
```python
# Set Flask debug mode
app.run(debug=True, port=5001)
```

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Contribution Guidelines**
- Follow existing code style and patterns
- Add comments for complex functionality
- Test on multiple browsers and devices
- Update documentation for new features
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini**: AI conversation capabilities
- **Microsoft EdgeTTS**: Natural text-to-speech
- **Three.js Community**: 3D rendering framework
- **Mixamo**: Character rigging and animations
- **React Three Fiber**: React integration for Three.js



*Experience the future of conversational AI with immersive 3D interactions!*
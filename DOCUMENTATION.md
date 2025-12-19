# 🌾 AgriSaarthi - Technical Documentation

## Overview

AgriSaarthi is a multilingual agricultural chatbot powered by Bhashini AI that provides farmers with intelligent assistance in their native languages. The system integrates speech recognition, translation, text-to-speech, and OCR capabilities to create a seamless conversational experience.

## 🏗️ Architecture

### Frontend (Next.js + React)
- **Framework**: Next.js 14 with App Router
- **UI**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Voice**: Web Speech API + Bhashini ASR/TTS

### Backend (Python Flask)
- **Framework**: Flask with CORS
- **AI Integration**: Bhashini API services
- **File Processing**: Base64 encoding/decoding
- **Audio Processing**: MP3 generation and serving

### Bhashini Integration
- **ASR**: Speech-to-Text conversion
- **MT**: Machine Translation between languages
- **TTS**: Text-to-Speech synthesis
- **OCR**: Optical Character Recognition for documents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Bhashini API Key

### Installation

#### Windows
```bash
# Run setup script
scripts\setup.bat

# Start the application
scripts\start.bat
```

#### Linux/Mac
```bash
# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start the application
./scripts/start.sh
```

### Manual Setup

1. **Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
# Copy environment files
cp env.local.example .env.local
cp backend/env.example backend/.env

# Update with your API keys
# .env.local
NEXT_PUBLIC_BHASHINI_API_KEY=your_api_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# backend/.env
BHASHINI_API_KEY=your_api_key_here
BHASHINI_BASE_URL=https://api.bhashini.gov.in
```

3. **Start Services**
```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

## 📱 Features

### 1. Multimodal Input Support
- **Voice Input**: Speech recognition in 12+ Indian languages
- **Text Input**: Type messages in any supported language
- **Image Upload**: Document and image analysis with OCR

### 2. Intelligent Conversation Flow
- **Intent Recognition**: Automatically detects user intent
- **Context Awareness**: Maintains conversation context
- **Language Detection**: Auto-detects input language

### 3. Agricultural Expertise
- **Crop Advice**: Disease identification and treatment
- **Government Schemes**: PM-KISAN and other scheme information
- **Market Prices**: Real-time commodity prices
- **Weather Information**: Irrigation and weather advice

### 4. Community Features
- **Cross-language Communication**: Translate between farmers
- **Knowledge Sharing**: Community discussions
- **Expert Connect**: Connect with agricultural experts

## 🔧 API Endpoints

### Frontend API Routes
```
/api/bhashini/asr     - Speech to Text
/api/bhashini/tts     - Text to Speech  
/api/bhashini/mt      - Machine Translation
/api/bhashini/ocr     - Optical Character Recognition
```

### Backend API Endpoints
```
POST /api/chat        - Main chat endpoint
GET  /api/tts         - Text to speech conversion
GET  /api/audio/<id>  - Serve generated audio files
```

## 🌐 Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| hi   | Hindi    | हिन्दी      |
| en   | English  | English     |
| bn   | Bengali  | বাংলা       |
| te   | Telugu   | తెలుగు      |
| mr   | Marathi  | मराठी       |
| ta   | Tamil    | தமிழ்       |
| gu   | Gujarati | ગુજરાતી     |
| kn   | Kannada  | ಕನ್ನಡ       |
| ml   | Malayalam| മലയാളം     |
| pa   | Punjabi  | ਪੰਜਾਬੀ      |
| or   | Odia     | ଓଡ଼ିଆ      |
| as   | Assamese | অসমীয়া     |

## 🧠 Conversation Scenarios

### 1. Document Simplification
```
User: [Uploads government scheme document]
AgriSaarthi: "यह PM-KISAN योजना है। आपको ₹6000 प्रति वर्ष मिल सकते हैं।"
```

### 2. Crop Problem Diagnosis
```
User: "मेरी फसल में पीले पत्ते आ रहे हैं"
AgriSaarthi: "यह नाइट्रोजन की कमी का लक्षण है। यूरिया का छिड़काव करें।"
```

### 3. Market Price Inquiry
```
User: "आज गेहूं का भाव क्या है?"
AgriSaarthi: "आज गेहूं का भाव ₹2500-2600 प्रति क्विंटल है।"
```

### 4. Community Discussion
```
User: "अन्य किसानों से बात करना चाहता हूं"
AgriSaarthi: "आप किस विषय पर चर्चा करना चाहते हैं?"
```

## 🔄 Data Flow

### Voice Message Flow
```
User Speech → ASR → Text → MT (to English) → AI Processing → 
MT (to User Language) → TTS → Audio Response
```

### Image Message Flow
```
User Image → OCR → Text → MT (to English) → AI Analysis → 
MT (to User Language) → TTS → Audio Response
```

### Text Message Flow
```
User Text → MT (to English) → AI Processing → 
MT (to User Language) → TTS → Audio Response
```

## 🛠️ Development

### Project Structure
```
megathon_2k25/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat component
│   ├── MessageBubble.tsx  # Message display
│   ├── ImageUploader.tsx  # Image upload
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useChat.ts         # Chat functionality
│   └── useVoice.ts        # Voice features
├── lib/                   # Utility libraries
│   ├── bhashini-api.ts    # Bhashini integration
│   └── chat-service.ts    # Chat service
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask app
│   ├── requirements.txt  # Python dependencies
│   └── env.example       # Environment template
└── scripts/              # Setup and start scripts
```

### Key Components

#### ChatInterface.tsx
- Main chat interface with multimodal input
- Voice recording and playback
- Image upload and processing
- Real-time message display

#### BhashiniService (Python)
- ASR: Speech-to-text conversion
- TTS: Text-to-speech synthesis
- MT: Machine translation
- OCR: Document text extraction

#### useChat Hook
- Message state management
- API integration
- Error handling
- Loading states

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_BHASHINI_API_KEY=your_production_key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Docker Deployment
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing Scenarios
1. **Voice Input**: Test speech recognition in different languages
2. **Text Translation**: Verify accurate translation between languages
3. **Image Processing**: Test OCR with various document types
4. **Conversation Flow**: Test complete conversation scenarios

### API Testing
```bash
# Test ASR
curl -X POST http://localhost:5000/api/bhashini/asr \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64_audio_data","sourceLanguage":"hi"}'

# Test TTS
curl "http://localhost:5000/api/tts?text=Hello&lang=hi"
```

## 🔧 Configuration

### Bhashini API Setup
1. Register at [Bhashini Portal](https://bhashini.gov.in)
2. Get API key from dashboard
3. Update environment variables
4. Test API connectivity

### Language Configuration
- Update `BHASHINI_LANGUAGES` in `lib/bhashini-api.ts`
- Add new language support in backend
- Update UI language selector

## 📊 Performance Optimization

### Frontend Optimizations
- Lazy loading of components
- Image optimization
- Audio compression
- Caching strategies

### Backend Optimizations
- Connection pooling
- Response caching
- Audio file cleanup
- Error rate monitoring

## 🐛 Troubleshooting

### Common Issues

#### Voice Recognition Not Working
- Check browser permissions for microphone
- Verify Bhashini API key
- Test with different browsers

#### Translation Errors
- Verify source/target language codes
- Check API rate limits
- Test with simple text first

#### Image Processing Fails
- Check image format (JPG, PNG supported)
- Verify file size limits
- Test with clear, high-contrast images

### Debug Mode
```bash
# Enable debug logging
DEBUG=agrisaarthi:* npm run dev
```

## 📈 Future Enhancements

### Planned Features
- **Video Support**: Video-based crop diagnosis
- **IoT Integration**: Sensor data from smart farms
- **Blockchain**: Transparent supply chain tracking
- **AR/VR**: Augmented reality crop guidance

### Scalability Improvements
- **Microservices**: Break down monolithic backend
- **Caching**: Redis for response caching
- **CDN**: Global content delivery
- **Load Balancing**: Multiple backend instances

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- TypeScript for frontend
- Python PEP 8 for backend
- ESLint for code quality
- Prettier for formatting

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **Bhashini Team**: For multilingual AI capabilities
- **Indian Government**: For digital agriculture initiatives
- **Open Source Community**: For foundational technologies

---

**AgriSaarthi** - Empowering farmers through technology, one conversation at a time. 🌾

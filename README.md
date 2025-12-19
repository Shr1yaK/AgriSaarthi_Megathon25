
AgriSaarthi - Multilingual Agricultural AI Assistant

AgriSaarthi is an intelligent, voice-enabled multilingual chatbot designed to assist Indian farmers by providing expert agricultural advice in their native language. The application bridges the language gap in agriculture by offering real-time support through speech recognition, AI-powered responses, translation, and text-to-speech capabilities.

Features

Voice Interaction

Speech-to-Text (ASR): Speak your questions in any supported Indian language
Real-time voice recording with visual feedback
Hands-free operation for farmers working in fields


Multilingual Support

22+ Indian Languages supported via Bhashini Dhruva API:
    - Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more
Translation Mode: Instant text and voice translation between any two supported languages
Language-specific responses tailored to regional agricultural practices


AI-Powered Agricultural Advice

Google Gemini AI integration for expert farming guidance
- Real-time answers on:
    - Crop cultivation techniques (rice, wheat, vegetables, etc.)
    - Pest and disease management
    - Government schemes and subsidies (PM-KISAN, Kisan Credit Card, etc.)
    - Market prices and selling strategies
    - Soil health and fertilization
    - Irrigation and water management


Text-to-Speech (TTS)

Audio playback of bot responses in user's preferred language
- Individual play/stop controls for each message
- Bhashini TTS for natural-sounding regional voices


Document Support

- Image upload capability for crop photos and documents
- Future OCR integration for text extraction from documents


Smart Chat Interface

- Clean, farmer-friendly UI with intuitive controls
- Show Original toggle to view English translations
- Quick-access buttons for common farming queries
- Real-time loading indicators

Architecture

Frontend (Next.js + React + TypeScript)

- Modern React components with TypeScript
- Tailwind CSS for responsive design
- Custom hooks for chat and voice management
- Real-time audio recording with MediaRecorder API


 Backend (Flask + Python)

- RESTful API endpoints
- Integration with Bhashini Dhruva for ASR, Translation, TTS
- Google Gemini AI for agricultural knowledge
- Fallback mechanisms for robustness


APIs Used

- **Bhashini Dhruva API**: Speech recognition, translation, text-to-speech
- **Google Gemini API**: AI-powered agricultural responses



Getting Started

Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- Bhashini API Key
- Google Gemini API Key


Installation

1. Clone the Repository

```bash
git clone https://github.com/yourusername/agrisaarthi.git
cd agrisaarthi
```


2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

Add to `.env`:

```
BHASHINI_API_KEY=your_bhashini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```


3. Frontend Setup

```bash
cd ../frontend  # or wherever your Next.js app is

# Install dependencies
npm install
```


***

Running the Application

### **Start Backend (Flask)**

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python3 app.py
```

Backend will run on: `http://localhost:8000`

### **Start Frontend (Next.js)**

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

### **Access the Application**

Open your browser and navigate to:

```
http://localhost:3000
```


***

Usage

Chat Mode

1. Select your preferred language from the initial screen
2. Type your farming question or click quick-access buttons
3. Get AI-powered responses in your language
4. Click speaker icon to hear responses

Voice Mode

1. Click the microphone icon in the chat input
2. Speak your question clearly
3. Voice is converted to text, processed by AI
4. Get spoken response in your language

Translation Mode

1. Click the "Translate" button in the header
2. Select source and target languages
3. Type or speak to get instant translations
4. Perfect for cross-regional communication

***

🛠️ Tech Stack

| Component | Technology |
| :-- | :-- |
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Flask, Python 3.8+ |
| **ASR** | Bhashini Dhruva Speech Recognition |
| **Translation** | Bhashini Dhruva Translation API |
| **TTS** | Bhashini Dhruva Text-to-Speech |
| **AI** | Google Gemini (gemini-2.0-flash-exp) |
| **Audio** | MediaRecorder API, Web Audio API |
| **State Management** | React Hooks (useState, useCallback, useRef) |



Project Structure

```
agrisaarthi/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── lib/
│   │   └── bhashini_dhruva.py # Bhashini API integration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── VoiceRecorder.tsx
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useVoice.ts
│   │   └── useAudioPlayer.ts
│   ├── lib/                   # Utilities & services
│   │   ├── bhashini-client.ts
│   │   └── chat-service.ts
│   └── package.json
└── README.md
```

Key Features Breakdown

Complete Voice Pipeline

```
User speaks → Bhashini ASR → Translation → Gemini AI → Translation → Bhashini TTS → Audio response
```


Translation Pipeline

```
Text/Voice input → Bhashini Translation → Instant output (bypasses AI for speed)
```

Supported Languages

English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Assamese, and more.

 Future Enhancements

- **OCR Integration**: Extract text from uploaded documents
- **Crop Disease Detection**: AI-powered image analysis
- **Weather API**: Real-time weather updates
- **Market Prices API**: Live mandi rates
- **Offline Mode**: Basic functionality without internet
- **Progressive Web App**: Installable mobile experience


Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



Contact

For questions or support, reach out at: [Udhav.malpani@research.iiit.ac.in]


This README covers installation, features, usage, and architecture comprehensively! Copy this into your `README.md` file and customize the repository URL, email, and author information as needed.

[^1]: https://www.neuroquantology.com/media/article_pdfs/AGRICULTURAL_SUPPORT_CHATBOT_FOR_FARMERS.pdf

[^2]: https://www.ijraset.com/research-paper/an-ai-based-multilingual-chatbot-for-agricultural-assistance

[^3]: https://github.com/adil200/Farmer-Support-ChatBot

[^4]: https://renewator.com/automated-technical-documentation-tool-for-multilingual-chatbot-training-in-agriculture/

[^5]: https://www.irjweb.com/AI – Powered Farming Guide.pdf

[^6]: https://www.ijcrt.org/papers/IJCRT24A4640.pdf

[^7]: https://www.nielit.gov.in/aurangabad/sites/default/files/Aurangabad/AgroBuddy_Empowering_Indian_Farmers_Through_Precision_Farming_Chatbot.pdf

[^8]: https://biogecko.co.nz/admin/uploads/A19.pdf


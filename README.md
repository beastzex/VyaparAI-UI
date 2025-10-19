# VyaparAI - Your AI Co-Founder 🚀

**Empowering India's 60+ million small businesses with autonomous AI assistance**

VyaparAI is an intelligent business automation platform that transforms handwritten ledgers and documents into actionable insights. Built for the Mumbai Hackathon, it serves as your virtual CA and COO, accessible 24/7 via WhatsApp or web interface.

## 🌟 Features

- **📊 Automated Finance & Tax**: Photo-to-bookkeeping, GST calculations, ITC management
- **🚀 Proactive Operations**: Inventory alerts, competitor analysis, sales insights  
- **💬 Zero-Friction Interface**: WhatsApp integration + intuitive web dashboard
- **🤖 AI-Powered**: Leverages Google's Gemini AI for document processing
- **📱 Multi-Platform**: Works on mobile (WhatsApp) and desktop (web)

## 🏗️ Project Structure

```
Mumbai_Hacks/
├── vyaparai_hackathon/          # Backend API
│   ├── api/
│   │   ├── agent.py             # AI agent logic
│   │   ├── main.py              # FastAPI server
│   │   └── tools.py             # AI tools & functions
│   ├── ngrok/                   # Tunneling for WhatsApp webhooks
│   ├── temp_uploads/            # Temporary file storage
│   ├── .env                     # Environment variables
│   └── essential_commands.txt   # Quick reference commands
└── vyaparai-frontend-simple/    # Frontend web interface
    ├── index.html
    ├── script.js
    ├── style.css
    └── README.md
```

# to get the frontend files you need to clone it from different repo named VyaparAI-UI and make sure to make a different duirectory from vyaparAi-Hackathon

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js (optional, for advanced frontend development)
- Twilio account (for WhatsApp integration)
- Google AI API key

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd Mumbai_Hacks
```

### 2. Backend Setup

```bash
mkdir vyaparai_hackathon
and place the api directory whch you cloned from the repo in this vyapar ai directory 

create virtual environment venv 
inside the virtual env download the below packages 
# Install Python dependencies
pip install fastapi uvicorn python-dotenv twilio google-generativeai langchain langchain-google-genai

# Configure environment variables
# Edit .env file with your credentials:
# GOOGLE_API_KEY="your_google_ai_key"
# TWILIO_ACCOUNT_SID="your_twilio_sid"
# TWILIO_AUTH_TOKEN="your_twilio_token"
# TWILIO_PHONE_NUMBER="whatsapp:+your_number"
```

### 3. Start Backend Server

```bash
# Start the FastAPI server
uvicorn api.main:app --reload

# Server will run on http://localhost:8000
```

### 4. Setup Ngrok (for WhatsApp)

```bash
# Navigate to ngrok directory
cd ngrok/ngrok-v3-stable-windows-amd64

# Add authentication token
ngrok config add-authtoken 34GAhk72gKQZr5miy4zmTYKFYuV_6Nz5qvt4iF7k3yYu2rNy3

# Create tunnel to your local server
ngrok http 8000
```

### 5. Frontend Setup

```bash
cd ../vyaparai-frontend-simple

# Open index.html in your browser
# Or use a local server:
python -m http.server 3000
# Then visit http://localhost:3000
```

## 📱 Usage

### Web Interface
1. Open the frontend in your browser
2. Drag & drop or select a ledger image/PDF
3. Click "Upload & Process"
4. View automated analysis and insights

### WhatsApp Integration
1. Send a photo of your ledger to the configured WhatsApp number
2. Receive instant AI-powered analysis
3. Get actionable business insights via chat

## 🔧 Configuration

### Environment Variables (.env)

```env
GOOGLE_API_KEY="your_google_gemini_api_key"
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="whatsapp:+your_twilio_number"
```

### Twilio Webhook Setup
1. Get your ngrok URL (e.g., `https://abc123.ngrok.io`)
2. In Twilio Console, set webhook URL to: `https://abc123.ngrok.io/api/webhook/whatsapp`
3. Set HTTP method to POST

## 🛠️ Development

### Essential Commands

```bash
# Start backend server
uvicorn api.main:app --reload

# Start ngrok tunnel
ngrok http 8000

# Install new Python packages
pip install package_name

# Check server status
curl http://localhost:8000
```

### API Endpoints

- `GET /` - Health check
- `POST /api/webhook/whatsapp` - WhatsApp webhook
- `POST /api/upload_document` - Web file upload (if enabled)
- `GET /api/task_status/{task_id}` - Check processing status

## 🧪 Testing

### Test WhatsApp Integration
1. Ensure ngrok is running and webhook is configured
2. Send a test image to your WhatsApp number
3. Check server logs for processing status

### Test Web Interface
1. Open frontend in browser
2. Upload a sample ledger image
3. Verify processing and results display

## 🚨 Troubleshooting

### Common Issues

**Server won't start:**
- Check if port 8000 is available
- Verify all dependencies are installed
- Check .env file configuration

**WhatsApp not responding:**
- Verify ngrok tunnel is active
- Check Twilio webhook configuration
- Ensure .env credentials are correct

**File upload fails:**
- Check temp_uploads directory exists
- Verify file permissions
- Check server logs for errors

### Debug Commands

```bash
# Check Python packages
pip list

# Test API directly
curl -X POST http://localhost:8000/api/webhook/whatsapp

# View server logs
# Check terminal where uvicorn is running
```

## 🏆 Hackathon Submission

This project was built for the Mumbai Hackathon, focusing on:
- **Problem**: Simplifying business operations for Indian SMEs
- **Solution**: AI-powered automation via familiar interfaces (WhatsApp)
- **Impact**: Reducing administrative burden, improving financial compliance
- **Innovation**: Seamless integration of AI with everyday communication tools

## 📞 Contact

**Team VyaparAI**
- Email: akshatarya2507@gmail.com
- Project: Mumbai Hackathon 2025

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for India's entrepreneurs**

# Prompt Template Lab - AI Co-pilot สำหรับนักการตลาดและ Creator

เว็บแอปพลิเคชัน AI ที่ช่วยสร้างคอนเทนต์คุณภาพสูงด้วยเทมเพลต AI สำหรับนักการตลาดและ Creator

## 🚀 Live Website

**URL:** https://web-production-28b73.up.railway.app

## ✨ Features

- 🤖 **AI Content Generation** - ใช้ Google Gemini API
- 📝 **Prompt Templates** - เทมเพลตสำเร็จรูปสำหรับการสร้างคอนเทนต์
- 🎨 **Modern UI** - ออกแบบด้วย Tailwind CSS
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- ⚡ **Fast Performance** - ใช้ nginx สำหรับ static hosting

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API
- **Hosting:** Railway.app
- **Web Server:** nginx
- **Containerization:** Docker

## 📁 Project Structure

```
Prompt Template Lab/
├── Prompt Template Lab.html    # Main application file
├── Dockerfile                  # Docker configuration
├── nginx.conf                  # nginx configuration
├── health.html                 # Health check endpoint
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
└── docs/                       # Documentation files
    ├── ADMIN_GUIDE.md
    ├── DEPLOYMENT_GUIDE.md
    └── DEVELOPER_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites
- Google Gemini API Key (Get from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Local Development
1. Clone the repository
2. Open `Prompt Template Lab.html` in your browser
3. Enter your Google Gemini API Key
4. Start creating content!

### Deployment
The application is automatically deployed on Railway when you push to the main branch.

## 🔧 Configuration

### Environment Variables
- No environment variables needed (uses client-side API key)

### API Configuration
- Get your API key from Google AI Studio
- Enter it in the web interface when prompted

## 📖 Usage

1. **Open the website** - Visit the live URL
2. **Enter API Key** - Get your Google Gemini API key
3. **Select Template** - Choose from available prompt templates
4. **Generate Content** - Create high-quality content with AI
5. **Copy & Use** - Copy the generated content for your projects

## 🛡️ Security

- API key is stored locally in browser
- No server-side storage of sensitive data
- HTTPS enabled for secure communication

## 📞 Support

For support or questions, please check the documentation files in the `docs/` directory.

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for content creators and marketers**
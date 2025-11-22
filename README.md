# ConExt.AI - Smart Contact Extraction

🚀 **ConExt.AI** is an intelligent business card extraction system that transforms physical business cards into structured, searchable digital contacts using cutting-edge OCR and AI technology. Upload one or multiple business card images, and watch as AI instantly extracts, validates, and organizes contact information with high accuracy.

## 📖 Project Description

ConExt.AI combines **Tesseract OCR** for text extraction with **Google Gemini 2.0 Flash** LLM for intelligent parsing and validation. The system features a modern **Next.js** frontend with real-time extraction, a **FastAPI** backend for processing, and **SQLite** database for persistent storage. All contacts are automatically saved, searchable, and manageable through an intuitive interface.

### Architecture Overview
- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python 3.13 + SQLAlchemy ORM
- **AI Pipeline**: Tesseract OCR → Gemini 2.0 Flash → Structured JSON
- **Database**: SQLite with full-text search indexing

## ✨ Features

### Core Functionality
- **📸 Multi-Image Upload**: Upload single or multiple business cards at once
- **🤖 AI-Powered Extraction**: OCR + LLM pipeline for accurate contact parsing
- **💾 Auto-Save Database**: All contacts automatically stored with timestamps
- **🔍 Smart Search**: Full-text search across name, email, phone, company
- **📊 Database Browser**: View, search, and manage all saved contacts at `/database`
- **🗑️ Individual Deletion**: Remove unwanted contacts with one click
- **🔗 Intelligent Merging**: Detect and merge duplicate contacts automatically
- **✨ Data Improvement**: One-click AI refinement to fix OCR errors
- **📱 Responsive Design**: Modern, mobile-friendly interface with smooth animations

### Advanced AI Features
- **Context-Aware Field Inference**: Automatically extracts job titles, departments, addresses, websites
- **Smart Duplicate Detection**: Identifies duplicates by matching names with contact info
- **Semantic Merging**: Combines duplicate entries intelligently, preserving all unique data
- **OCR Error Correction**: Fixes common OCR mistakes using AI pattern recognition
- **Format Normalization**: Phone numbers, emails, and addresses standardized automatically

## 🚀 Instructions to Run Locally

### Prerequisites
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Tesseract OCR** installed and available on PATH ([Installation Guide](https://github.com/tesseract-ocr/tesseract))
- **Google Gemini API Key** ([Get API Key](https://makersuite.google.com/app/apikey))

### Step 1: Clone and Setup Backend

```powershell
# Navigate to project directory
cd contact-ai

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r backend/requirements.txt

# Create environment file
Copy-Item .env.example backend/.env

# Edit backend/.env and add your Gemini API key:
# GEMINI_API_KEY=your_api_key_here
```

### Step 2: Setup Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Return to root directory
cd ..
```

### Step 3: Start Development Servers

```powershell
# Terminal 1: Start Backend (from project root with venv active)
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend (from frontend directory)
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Database Browser**: http://localhost:3000/database
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠️ Tools & Libraries Used

### Frontend Stack
| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 14.2.5 | React framework with SSR and routing |
| **React** | 18.3.1 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Fetch API** | Native | HTTP client for API calls |

### Backend Stack
| Tool | Version | Purpose |
|------|---------|---------|
| **FastAPI** | 0.114.0 | High-performance async web framework |
| **Python** | 3.13.5 | Programming language |
| **SQLAlchemy** | 2.0.32 | SQL ORM for database operations |
| **SQLite** | 3.x | Lightweight embedded database |
| **Tesseract OCR** | 5.x | Open-source OCR engine |
| **Pillow** | 10.4.0 | Image processing library |
| **pytesseract** | 0.3.13 | Python wrapper for Tesseract |
| **google-generativeai** | 0.8.3 | Official Gemini API SDK |
| **pydantic** | 2.9.0 | Data validation using type hints |
| **uvicorn** | 0.30.6 | ASGI server |

### AI & ML
- **Google Gemini 2.0 Flash**: Multimodal LLM for contact parsing, field inference, and deduplication
- **Tesseract OCR**: Text extraction from images with confidence scoring

## 📂 Project Structure

```
contact-ai/
├── backend/              # FastAPI service
│   ├── core/            # Core logic (OCR, LLM, database)
│   │   ├── llm.py      # Gemini API integration
│   │   ├── ocr.py      # Tesseract OCR processing
│   │   └── db.py       # SQLAlchemy models & database
│   ├── routes/          # API endpoints
│   │   ├── extract.py  # Contact extraction endpoint
│   │   ├── improve.py  # Data improvement endpoint
│   │   ├── dedupe.py   # Deduplication endpoint
│   │   └── contacts.py # CRUD operations
│   └── main.py          # FastAPI application entry
├── frontend/            # Next.js application
│   ├── app/            # Next.js app directory
│   │   ├── components/ # React components
│   │   │   ├── ContactWorkspace.tsx  # Main extraction UI
│   │   │   ├── ContactCard.tsx       # Contact display card
│   │   │   ├── ContactList.tsx       # Contact grid
│   │   │   └── UploadCard.tsx        # File upload component
│   │   ├── database/   # Database browser page
│   │   └── page.tsx    # Home page
│   ├── lib/            # API client & utilities
│   └── hooks/          # React custom hooks
├── contacts.db          # SQLite database (auto-created)
└── README.md           # This file
```

## 🔍 REST API Endpoints

### Contact Extraction
- **POST** `/extract/` - Extract contacts from business card image
- **POST** `/improve/` - Improve contact data quality with AI
- **POST** `/dedupe/` - Detect and merge duplicate contacts

### Database Operations
- **GET** `/contacts/` - List all contacts (with search & pagination)
- **POST** `/contacts/` - Create new contact
- **GET** `/contacts/{id}` - Get contact by ID
- **PUT** `/contacts/{id}` - Update contact
- **DELETE** `/contacts/{id}` - Delete contact
- **GET** `/contacts/search/by-name?name=John` - Search by name

### System
- **GET** `/health` - Health check endpoint
- **GET** `/docs` - Interactive API documentation (Swagger UI)

## ⚠️ Limitations

### Current Constraints
1. **OCR Accuracy**
   - Depends on image quality (lighting, resolution, angle)
   - Handwritten text may not be recognized accurately
   - Complex layouts or artistic designs can confuse OCR
   - Best results with high-contrast, well-lit, straight-on photos

2. **Language Support**
   - Currently optimized for English text only
   - Non-Latin scripts (Chinese, Arabic, Cyrillic) may extract poorly
   - Mixed-language cards require manual review

3. **API Rate Limits**
   - Google Gemini API has rate limits based on your tier
   - Free tier: 15 requests per minute
   - Batch processing many cards may hit rate limits

4. **Field Detection**
   - Unconventional business card formats may confuse field detection
   - Missing fields cannot be inferred if no context clues exist
   - Extra fields stored as key-value pairs, not validated

5. **Duplicate Detection**
   - Requires exact name + matching contact info (email/phone)
   - Different people sharing contact info (coworkers) not detected as duplicates
   - Typos in names prevent duplicate detection

6. **Browser Compatibility**
   - Requires modern browser with Fetch API and ES6+ support
   - File upload limited by browser file size restrictions
   - Best experience on Chrome, Firefox, Edge (latest versions)

## 🚧 Future Improvements

### Planned Features
- **Multi-Language OCR**: Language detection + support for Chinese, Japanese, Arabic, Russian
- **Batch Processing**: Queue system for processing 50+ cards simultaneously
- **Export Options**: 
  - Export to vCard (.vcf) for direct import to phone contacts
  - CSV export for spreadsheet analysis
  - JSON export for integration with other systems
- **CRM Integration**: Direct sync with Salesforce, HubSpot, Google Contacts
- **Mobile App**: Native iOS/Android apps with camera integration
- **Cloud Storage**: Optional Google Drive / OneDrive backup
- **Advanced Search**: Filters by company, date added, tag categories
- **Contact Tagging**: Custom labels (client, vendor, lead, etc.)
- **Email Validation**: Real-time email validation using SMTP checks
- **Phone Validation**: International phone number validation with libphonenumber

### Technical Enhancements
- **PostgreSQL Migration**: Scale beyond SQLite for production deployments
- **Redis Caching**: Cache LLM responses to reduce API costs
- **Background Jobs**: Celery task queue for async processing
- **Docker Compose**: One-command deployment with containerization
- **Kubernetes**: Helm charts for cloud-native deployment
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions
- **Monitoring**: Prometheus metrics + Grafana dashboards
- **Error Tracking**: Sentry integration for production error monitoring


Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ by Azhar Iqbal**  
📧 azhartula125@gmail.com  
📱 +92 348 1892160

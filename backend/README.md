# Backend (FastAPI)

FastAPI service responsible for OCR + Gemini post-processing. Key endpoints:

- `POST /extract/` – Accepts a multipart image, runs Tesseract OCR, normalizes fields, and returns structured contacts.
- `POST /improve/` – Re-prompts Gemini with existing contacts to auto-correct or enrich data.

## Key Modules

- `core/config.py` – Loads settings (Gemini key, OCR language, allowed origins).
- `core/ocr.py` – Tesseract-based OCR with confidence aggregation.
- `core/llm.py` – Gemini SDK helper, prompts, and JSON parsing.
- `services/contact_processor.py` – Orchestrates OCR + LLM pipeline and normalization.
- `routes/` – FastAPI routers exposing the service.

## Running Locally

```powershell
pip install -r backend/requirements.txt
Copy-Item .env.example backend/.env
# edit backend/.env and set GEMINI_API_KEY=<your key>
uvicorn backend.main:app --reload
```

Health check available at `GET /health`.

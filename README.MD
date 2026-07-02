# MedQuery AI 

A RAG-based (Retrieval-Augmented Generation) medical document assistant that lets you upload PDFs — fact sheets, lab reports, research documents — and ask natural-language questions grounded strictly in the uploaded content. Built to avoid hallucination: every answer is backed by cited sources, or the app honestly says it doesn't know.

##  Features

- **PDF Upload & Chunking** — drag-and-drop or browse to upload multiple PDFs, automatically parsed and embedded into a vector store
- **Document-Grounded Chat** — ask questions and get answers sourced *only* from your uploaded documents, with inline citations
- **Multi-Document Support** — upload several documents and query across all of them, or scope a question to one specific document
- **Fair Cross-Document Retrieval** — when querying across multiple documents, each document gets fair representation in retrieval rather than one document dominating results
- **Source Citation** — every answer shows exactly which document(s) it drew from, extracted directly from the LLM's own reasoning (not just "whatever was retrieved")
- **Hallucination Guardrails** — if information isn't in the uploaded documents, the app says so explicitly instead of guessing
- **Relevance Scoring** — each answer includes a visual relevance/confidence indicator based on vector similarity
- **Document Summarization** — generate a quick bullet-point summary of any uploaded document on demand
- **Conversation Memory** — maintains context across a chat session, including the ability to recall earlier questions
- **Analytics Dashboard** — view upload stats, question history, chunk distribution, and relevance trends over time
- **Duplicate Prevention** — re-uploading a document with the same name cleanly replaces old data instead of duplicating it

##  Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- Recharts (data visualization)
- React Markdown
- Axios

**Backend**
- FastAPI (Python)
- LangChain
- ChromaDB (vector store)
- Groq API (LLM inference — `llama-3.1-8b-instant`)
- Sentence embeddings for semantic search

##  Project Structure

```
medquery-ai/
├── backend/
│   ├── main.py           # FastAPI app & routes
│   ├── rag.py             # Retrieval + LLM answer generation
│   ├── embeddings.py       # Embedding model & document parsing
│   ├── schemas.py          # Pydantic request/response models
│   ├── utils.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # FileUpload, DocLibrary, ChatMessage, Disclaimer, Navbar
│   │   ├── pages/          # Chat, Dashboard
│   │   ├── api.js          # API client
│   │   └── App.jsx
│   └── package.json
└── README.md
```

##  Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (see `.env.example`):
```
GROQ_API_KEY=your_groq_api_key_here
```

Run the backend:
```bash
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000` — API docs available at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` (see `.env.example`):
```
VITE_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

##  Usage

1. Upload one or more PDF documents via the sidebar
2. Ask questions in the chat — optionally scope your question to a specific document using the dropdown
3. View cited sources and a relevance score with each answer
4. Check the Dashboard for usage analytics and question history
5. Click the summarize icon on any document in the library for a quick overview

##  Disclaimer

This tool is built for educational and informational purposes. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.

##  Roadmap / Ideas

- [ ] Persistent chat history (currently resets on page refresh)
- [ ] User authentication for multi-user document libraries
- [ ] Support for additional file types (DOCX, images with OCR)
- [ ] Export chat conversations as PDF

##  License

This project is for educational/portfolio purposes.
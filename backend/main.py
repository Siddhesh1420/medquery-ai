from fastapi import FastAPI,UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from schemas import UploadResponse, QuestionInput, AnswerResponse, SummaryRequest, SummaryResponse
from utils import parse_and_chunk
from rag import embed_and_store, retrieve_and_answer , summarize_document , delete_document,vector_store

app = FastAPI(
    title="Medquery-AI",
    description="A medical assistant that multiple files from user and answer their question",
    version="1.0.0",
    debug=True,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://65.0.97.255"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

documents=[]
history=[]

@app.get("/")
async def root():
    return {"message": "MedQuery API is running"}

@app.post("/upload")
async def upload_documents(files: list[UploadFile]=File(...)):
    responses=[]
    for file in files:
        chunks=await parse_and_chunk(file,file.filename)
        # Removes older uploads
        existing = vector_store.get(where={"source": file.filename})
        if existing["ids"]:
            vector_store.delete(where={"source": file.filename})
        n_chunks=embed_and_store(chunks,file.filename)
        # Removes older uploads from the documents list
        documents[:] = [d for d in documents if d["filename"] != file.filename]
        documents.append({"filename":file.filename,"chunks":n_chunks})
        response=UploadResponse(filename=file.filename, chunks_stored=n_chunks)
        responses.append(response)
    return responses
        
    
@app.post("/ask")
def question_answer(input: QuestionInput):
    result=retrieve_and_answer(input.question,input.chat_history,input.selected_doc)
    history.append({"question":input.question,"answer":result["answer"],"avg_score":result["avg_score"]})
    response=AnswerResponse(answer=result["answer"],sources=result["sources"],avg_score=result["avg_score"])
    return response
    
@app.post("/summarize")
def summarize(input: SummaryRequest):
    summary=summarize_document(input.doc_id)
    response=SummaryResponse(summary=summary["summary"])
    return response

@app.get("/documents")
def get_docs():
    return documents

@app.get("/history")
def get_history():
    return history[-20:]

@app.delete("/documents/{doc_id}")
def delete_documents(doc_id:str):
    delete_document(doc_id)
    global documents
    documents=[doc for doc in documents if doc['filename']!=doc_id]
    return {"message":f"Document {doc_id} deleted successfully."}

# Checks if server is working
@app.get("/health")
def get_health():
    return {"status":"ok"}

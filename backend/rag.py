from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from embeddings import embedding_model
import os 
import re
from dotenv import load_dotenv

load_dotenv() # load environment variables from .env file
vector_store=Chroma(persist_directory="./chroma_db",embedding_function=embedding_model,collection_name="medquery")

llm=ChatGroq(api_key=os.getenv("GROQ_API_KEY"),model="llama-3.1-8b-instant",temperature=0.2,max_tokens=500)

def embed_and_store(chunks,doc_id):
    """
    Embed the text chunks and store them in the vector store with the given document ID.
    """
    vector_store.add_documents(chunks)
    return len(chunks)

def retrieve_and_answer(question,chat_history,selected_doc=None):
    """
    Retrieve relevant chunks from the vector store based on the question and generate an answer using the LLM.
    """
    if selected_doc:
        result = vector_store.similarity_search_with_score(
            question, k=4, filter={"source": {"$eq": selected_doc}}
    )
    else:
        # "All documents" mode — retrieve fairly from EACH document, not one global top-k
        all_metadatas = vector_store.get()["metadatas"]
        doc_names = sorted(set(m["source"] for m in all_metadatas))

        result = []
        per_doc_k = 5  # top 5 chunks from each document
        for doc_name in doc_names:
            doc_result = vector_store.similarity_search_with_score(
                question, k=per_doc_k, filter={"source": doc_name}
            )
            result.extend(doc_result)

        # Sort combined results by score (best first) and cap total to avoid huge prompts
        result = sorted(result, key=lambda x: x[1])[:8]
    docs=[doc for doc,score in result]
    scores=[score for doc,score in result]
    
    context=""
    sources=[] # extract unique sources from the retrieved documents
    for doc in docs:
        text=doc.page_content
        filename=doc.metadata["source"]
        context+=f"Source: {filename}\n{text}\n\n---\n\n"
        if filename not in sources:
            sources.append(filename)
    
    # Conversation history formatting
    history_text=""
    for hist in chat_history[-6:]: # Considers only last 6 chats
        role=hist["role"]
        content=hist["content"]
        if role=="user":
            history_text+=f"User: {content}\n"
        elif role=="assistant":
            history_text+=f"Assistant: {content}\n"
    history_text=history_text.strip()
    
    # Constructing the prompt for the LLM
    prompt = f"""
    You are MedQuery AI, a medical document assistant.

    Your task is to answer the user's question ONLY using the information provided in the retrieved context.

    Rules:

    1. Use ONLY the retrieved context to answer the question.
    2. Do NOT use your own medical knowledge.
    3. If the answer is not present or cannot be inferred from the context, reply exactly:
    "I could not find this information in the uploaded documents."
    4. Never fabricate, guess, or assume information.
    5. If multiple documents contain relevant information, summarize them clearly.
    6. Cite the document name(s) or source(s) after the relevant statements.
    7. Keep answers concise, accurate, and well-structured.
    8. Maintain context from the previous conversation only if it is supported by the retrieved context.
    9. If the user's question is unrelated to the uploaded medical documents, politely state that you can only answer questions based on the uploaded documents.
    10. Always end your answer with this disclaimer on a new line:
    "⚠️ This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider."
    11. You may reference what the user previously asked (e.g. "you asked me X earlier") purely as conversational recall — but you must NEVER reuse, repeat, or reference specific medical facts, numbers, or claims from your own previous answers unless those same facts also appear in the CURRENT retrieved context below. Each answer must be grounded only in the current retrieval, not in earlier turns of this conversation.
    12. On a new line AFTER the disclaimer, list only the source filenames actually used to answer, in this exact format (no extra text):
    SOURCES_USED: filename1.pdf, filename2.pdf
    13. If the user asks for treatment, improvement, or management advice for a specific value that is not explained in the retrieved context, explicitly state that this document only contains lab values, not treatment guidance, and recommend they discuss results with their doctor — rather than staying silent on that part of the question.
    Previous Conversation:
    {history_text}

    Retrieved Context:
    {context}

    User Question:
    {question}

    Answer:
    """
    result=llm.invoke(prompt)
    text=result.content.strip()
    
    # Extracting the sources actually used in the answer
    sources_used=sources
    match=re.search(r"SOURCES_USED:\s*(.*)", text)
    if match:
        sources_used = [s.strip() for s in match.group(1).split(",") if s.strip()]
        text = re.sub(r"\n?SOURCES_USED:\s*.+", "", text).strip()
    avg_dist=sum(scores)/len(scores) if scores else 0.0
    avg_score = 1 / (1 + avg_dist) # Convert distance to a similarity score
    return {"answer":text, "sources":sources_used , "avg_score":avg_score}

    
def summarize_document(doc_id):
    """
    Summarize the document with the given document ID using the LLM.
    """
    chunks=vector_store.get(where={"source":doc_id})
    text=""
    documents=chunks["documents"] if "documents" in chunks else []
    documents=documents[:10]  # Limit to first 10 chunks for summarization
    for doc in documents:
        text+=f"{doc}\n\n"
    
    prompt=f"""
    You are MedQuery AI, a medical document assistant.

    Your task is to summarize the content of the document provided below in a clear and structured bullet point format.
    
    Rules:
    1. Summarize ONLY the content provided below.
    2. Do NOT use your own medical knowledge.
    3. Cover main topics, key findings, and important warnings/contraindications if any
    4. Keep the summary concise, accurate, and well-structured.
    
    
    Document Content:
    {text}
    Summary:
    """
    result=llm.invoke(prompt)
    return {"summary":result.content.strip()}
    
    
def delete_document(doc_id):
    """
    Delete the document with the given id from vector store.
    """
    vector_store.delete(where={"source":doc_id})
        

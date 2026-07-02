from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os,shutil

async def parse_and_chunk(file,filename):
    """
    Parse and chunk the uploaded PDF file into smaller text chunks.
    """
    temp_dir="./temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path=os.path.join(temp_dir,filename)
    
    content=await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
        
    loader=PyPDFLoader(file_path)
    documents=loader.load()
    
    text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)
    chunks=text_splitter.split_documents(documents)
    
    # Add filename as metadata to each chunk
    for chunk in chunks:
        chunk.metadata["source"]=filename
        
    # Clean up the temporary file after processing
    os.remove(file_path)
    return chunks
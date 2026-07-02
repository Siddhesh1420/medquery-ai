from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    filename: str=Field(..., description="The name of the uploaded file.")
    chunks_stored: int=Field(..., description="The number of chunks stored for the uploaded file.")
    
class QuestionInput(BaseModel):
    question: str=Field(...,description="The question to be answered based on the uploaded file.")
    chat_history: list[dict]=Field(..., description="The chat history for context.")
    selected_doc: str | None=Field(None, description="The ID of the selected document.")
    
class AnswerResponse(BaseModel):
    answer: str=Field(..., description="The answer to the question")
    sources: list=Field(..., description="The sources used to generate the answer.")
    avg_score: float=Field(..., description="The average score of the sources used to generate the answer.")
    
class SummaryRequest(BaseModel):
    doc_id: str=Field(..., description="The document ID for which the summary is requested.")
    
class SummaryResponse(BaseModel):
    summary: str=Field(..., description="The generated summary of the document")
    

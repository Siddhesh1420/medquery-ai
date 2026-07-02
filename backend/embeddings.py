from langchain_huggingface import HuggingFaceEmbeddings

embedding_model=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2") # model = not used as some models dont accept

def get_embedding(texts: list[str]) :
    """ 
    Get the embedding for a given text"""
    return embedding_model.embed_documents(texts)

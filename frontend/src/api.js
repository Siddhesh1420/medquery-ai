import axios from "axios"
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const uploadPDFs= async(files)=>{
    const formData= new FormData()
    files.forEach(file=>{
        formData.append("files",file)
    })
    const response= await axios.post(`${BASE_URL}/upload`,formData,{
        headers:{
            "Content-Type":"multipart/form-data"
        }
    })
    return response.data
}

export const askQuestion= async(question,chatHistory,selectedDoc=null)=>{
    const response= await axios.post(`${BASE_URL}/ask`,{
        question,
        chat_history:chatHistory,
        selected_doc:selectedDoc
    })
    return response.data
}

export const getDocuments= async()=>{
    const response= await axios.get(`${BASE_URL}/documents`)
    return response.data
}

export const deleteDocument= async(docId)=>{
    const response= await axios.delete(`${BASE_URL}/documents/${docId}`)
    return response.data
}

export const summarizeDocument= async(docId)=>{
    const response= await axios.post(`${BASE_URL}/summarize`,{
        doc_id:docId
    })
    return response.data
}

export const getHistory= async()=>{
    const response= await axios.get(`${BASE_URL}/history`)
    return response.data
}

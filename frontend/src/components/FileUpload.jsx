import { useState, useRef } from "react"
import { uploadPDFs } from "../api"

export default function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf")
    if (files.length > 0) handleUpload(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) handleUpload(files)
  }

  const handleUpload = async (files) => {
    setIsUploading(true)
    try {
      const result = await uploadPDFs(files)
      setUploadedFiles(prev => [...prev, ...result])
      onUploadSuccess(result)
    } catch (err) {
      console.error("Upload failed:", err)
    }
    setIsUploading(false)
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{color: '#64748b'}}>
        Upload Documents
      </p>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl p-4 text-center cursor-pointer transition-all"
        style={{
          border: `2px dashed ${isDragging ? '#00d4ff' : '#1e3a5f'}`,
          backgroundColor: isDragging ? '#001a2e' : 'transparent'
        }}>
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{borderColor: '#00d4ff', borderTopColor: 'transparent'}} />
            <p className="text-xs" style={{color: '#00d4ff'}}>Processing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">📎</span>
            <p className="text-xs" style={{color: '#64748b'}}>
              Drop PDFs here or <span style={{color: '#00d4ff'}}>browse</span>
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Recently uploaded in this session */}
      {uploadedFiles.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {uploadedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded"
              style={{backgroundColor: '#003a3a', color: '#00ffcc'}}>
              <span>✅</span>
              <span className="truncate">{f.filename}</span>
              <span style={{color: '#64748b'}}>({f.chunks_stored} chunks)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
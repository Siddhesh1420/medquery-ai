import { useState, useEffect } from "react"
import { getDocuments, deleteDocument, summarizeDocument } from "../api"

export default function DocLibrary({ refreshTrigger }) {
  const [documents, setDocuments] = useState([])
  const [summaries, setSummaries] = useState({})
  const [loadingSummary, setLoadingSummary] = useState(null)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const [expandedSummary, setExpandedSummary] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    }
  }

  const handleDelete = async (filename) => {
    setDeletingDoc(filename)
    try {
      await deleteDocument(filename)
      setDocuments(prev => prev.filter(d => d.filename !== filename))
      setSummaries(prev => { const s = {...prev}; delete s[filename]; return s })
    } catch (err) {
      console.error("Delete failed:", err)
    }
    setDeletingDoc(null)
  }

  const handleSummarize = async (filename) => {
    setLoadingSummary(filename)
    try {
      const result = await summarizeDocument(filename)
      setSummaries(prev => ({...prev, [filename]: result.summary}))
    } catch (err) {
      console.error("Summary failed:", err)
    }
    setLoadingSummary(null)
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs" style={{color: '#64748b'}}>No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{color: '#64748b'}}>
        Document Library ({documents.length})
      </p>
      <div className="flex flex-col gap-2">
        {documents.map((doc, i) => (
          <div key={i} className="rounded-xl p-3"
            style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
            
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">📄</span>
                <span className="text-xs font-medium truncate" style={{color: '#e2e8f0'}}>
                  {doc.filename}
                </span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleSummarize(doc.filename)}
                  disabled={loadingSummary === doc.filename}
                  className="text-xs px-2 py-1 rounded transition-all"
                  style={{backgroundColor: '#003a3a', color: '#00ffcc', border: '1px solid #00ffcc44'}}>
                  {loadingSummary === doc.filename ? '...' : '📝'}
                </button>
                <button
                  onClick={() => handleDelete(doc.filename)}
                  disabled={deletingDoc === doc.filename}
                  className="text-xs px-2 py-1 rounded transition-all"
                  style={{backgroundColor: '#1a0000', color: '#ef4444', border: '1px solid #ef444444'}}>
                  {deletingDoc === doc.filename ? '...' : '🗑️'}
                </button>
              </div>
            </div>

            <div className="text-xs" style={{color: '#64748b'}}>
              {doc.chunks} chunks indexed
            </div>

            {/* Summary section */}
            {summaries[doc.filename] && (
            <div className="mt-2 p-2 rounded text-xs leading-relaxed"
            style={{backgroundColor: '#001a2e', color: '#94a3b8', border: '1px solid #1e3a5f'}}>
            <p className="font-semibold mb-1" style={{color: '#00d4ff'}}>Summary:</p>
            <p className={expandedSummary === doc.filename ? '' : 'line-clamp-4'}>
            {summaries[doc.filename]}
            </p>
            <button
            onClick={() => setExpandedSummary(
                expandedSummary === doc.filename ? null : doc.filename
            )}
            className="text-xs mt-1 font-medium"
            style={{color: '#00d4ff'}}>
            {expandedSummary === doc.filename ? 'Show less' : 'Show more'}
            </button>
            </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
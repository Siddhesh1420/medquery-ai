import { useState, useRef, useEffect } from "react"
import { askQuestion, getDocuments } from "../api"
import FileUpload from "../components/FileUpload"
import DocLibrary from "../components/DocLibrary"
import ChatMessage from "../components/ChatMessage"

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [refreshDocs, setRefreshDocs] = useState(0)
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState("")

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocuments()
        setDocuments(docs)
      } catch (err) {
        console.error("Failed to fetch documents for selector:", err)
      }
    }
    fetchDocs()
  }, [refreshDocs])

  const handleUploadSuccess = () => {
    setRefreshDocs(prev => prev + 1)
  }

  const handleSend = async () => {
    if (!question.trim()) return

    const userMessage = { role: "user", content: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const chatHistory = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }))

      const result = await askQuestion(question, chatHistory, selectedDoc || null)

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          avg_score: result.avg_score
        }
      ])
    } catch (err) {
      console.error("Failed to get answer:", err)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong while processing your question. Please try again.",
          sources: [],
          avg_score: undefined
        }
      ])
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen pt-20 flex" style={{ backgroundColor: '#0a0f1e' }}>

      {/* Sidebar */}
      <aside
        className="flex-shrink-0 overflow-y-auto px-4 py-6"
        style={{ width: '280px', borderRight: '1px solid #1e3a5f' }}
      >
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <DocLibrary refreshTrigger={refreshDocs} />
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <span className="text-3xl">💬</span>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Ask a question about your uploaded documents
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, i) => (
                <ChatMessage key={i} message={message} />
              ))}

              {loading && (
                <div className="flex gap-3 mb-6">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: '#003a3a',
                      border: '1px solid #00ffcc',
                      color: '#00ffcc'
                    }}
                  >
                    🏥
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-2"
                    style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f' }}
                  >
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#00d4ff', borderTopColor: 'transparent' }}
                    />
                    <span className="text-xs" style={{ color: '#64748b' }}>Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-8 py-4" style={{ borderTop: '1px solid #1e3a5f' }}>

          {/* Document scope selector */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: '#64748b' }}>Ask about:</span>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg outline-none"
                style={{
                  backgroundColor: '#0a0f1e',
                  color: selectedDoc ? '#00d4ff' : '#94a3b8',
                  border: '1px solid #1e3a5f'
                }}
              >
                <option value="">All documents</option>
                {documents.map((doc, i) => (
                  <option key={i} value={doc.filename}>{doc.filename}</option>
                ))}
              </select>
            </div>
          )}

          <div
            className="flex items-end gap-3 rounded-2xl p-3"
            style={{ backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f' }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none"
              style={{ color: '#e2e8f0', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !question.trim()}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: loading || !question.trim() ? '#1e3a5f' : '#00d4ff',
                color: loading || !question.trim() ? '#64748b' : '#0a0f1e',
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
import ReactMarkdown from "react-markdown"
import Disclaimer from "./Disclaimer"

export default function ChatMessage({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: isUser ? '#1e3a5f' : '#003a3a',
          border: `1px solid ${isUser ? '#00d4ff' : '#00ffcc'}`,
          color: isUser ? '#00d4ff' : '#00ffcc'
        }}>
        {isUser ? '🙂' : '🩺'}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            backgroundColor: isUser ? '#1e3a5f' : '#0d1b2a',
            border: `1px solid ${isUser ? '#00d4ff33' : '#1e3a5f'}`,
            color: '#e2e8f0'
          }}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((source, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full"
                style={{backgroundColor: '#003a3a', color: '#00ffcc', border: '1px solid #00ffcc44'}}>
                 {source}
              </span>
            ))}
          </div>
        )}

        {/* Confidence score */}
        {!isUser && message.avg_score !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full" style={{backgroundColor: '#1e3a5f'}}>
              <div className="h-1.5 rounded-full"
                style={{
                  width: `${Math.max(0, (1 - message.avg_score) * 100).toFixed(0)}%`,
                  backgroundColor: message.avg_score < 0.5 ? '#00ffcc' : message.avg_score < 0.8 ? '#fbbf24' : '#ef4444'
                }}
              />
            </div>
            <span className="text-xs" style={{color: '#64748b'}}>
              relevance
            </span>
          </div>
        )}

        {/* Disclaimer on AI messages */}
        {!isUser && <Disclaimer />}
      </div>
    </div>
  )
}
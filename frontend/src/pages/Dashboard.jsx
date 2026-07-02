import { useState, useEffect } from "react"
import { getHistory, getDocuments } from "../api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hist, docs] = await Promise.all([getHistory(), getDocuments()])
        setHistory(hist)
        setDocuments(docs)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const avgScore = history.length
    ? (history.reduce((sum, h) => sum + (h.avg_score || 0), 0) / history.length).toFixed(2)
    : 0

  const scoreData = history.map((h, i) => ({
  index: i + 1,
  score: h.avg_score ? Number((h.avg_score * 100).toFixed(1)) : 0
  }))

  const pieData = [
    { name: "Docs Uploaded", value: documents.length },
    { name: "Questions Asked", value: history.length }
  ]

  const COLORS = ["#00d4ff", "#00ffcc"]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#0a0f1e'}}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{borderColor: '#00d4ff', borderTopColor: 'transparent'}} />
          <p className="text-sm" style={{color: '#64748b'}}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 px-8 pb-8" style={{backgroundColor: '#0a0f1e'}}>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{color: '#00d4ff'}}>Dashboard</h1>
        <p className="text-sm mt-1" style={{color: '#64748b'}}>Session analytics and recent activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
          <p className="text-3xl font-bold" style={{color: '#00d4ff'}}>{documents.length}</p>
          <p className="text-sm mt-1" style={{color: '#64748b'}}>Documents Uploaded</p>
        </div>
        <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
          <p className="text-3xl font-bold" style={{color: '#00ffcc'}}>{history.length}</p>
          <p className="text-sm mt-1" style={{color: '#64748b'}}>Questions Asked</p>
        </div>
        <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
          <p className="text-3xl font-bold" style={{color: '#fbbf24'}}>{avgScore}</p>
          <p className="text-sm mt-1" style={{color: '#64748b'}}>Avg Relevance Score</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        
        {/* Bar chart — chunks per document */}
        <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
          <h2 className="text-sm font-semibold mb-4" style={{color: '#e2e8f0'}}>Chunks per Document</h2>
          {documents.length === 0 ? (
            <p className="text-xs text-center py-8" style={{color: '#64748b'}}>No documents yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={documents}>
                <XAxis dataKey="filename" tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={v => v.split('.')[0].slice(0, 10)} />
                <YAxis tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip
                  contentStyle={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#e2e8f0'}}
                  labelStyle={{color: '#00d4ff'}}
                />
                <Bar dataKey="chunks" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Relevance score over time */}
        <div className="rounded-2xl p-6 mb-8" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
        <h2 className="text-sm font-semibold mb-4" style={{color: '#e2e8f0'}}>Relevance Score Trend</h2>
        {scoreData.length === 0 ? (
            <p className="text-xs text-center py-8" style={{color: '#64748b'}}>No questions asked yet</p>
        ) : (
            <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreData}>
                <XAxis dataKey="index" tick={{fontSize: 10, fill: '#64748b'}} label={{ value: 'Question #', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{fontSize: 10, fill: '#64748b'}} domain={[0, 100]} />
                <Tooltip
                contentStyle={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#e2e8f0'}}
                labelStyle={{color: '#00d4ff'}}
                formatter={(value) => [`${value}%`, 'Relevance']}
                />
                <Line type="monotone" dataKey="score" stroke="#00ffcc" strokeWidth={2} dot={{ fill: '#00ffcc', r: 3 }} />
            </LineChart>
            </ResponsiveContainer>
        )}
        </div>

        {/* Pie chart */}
        <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
          <h2 className="text-sm font-semibold mb-4" style={{color: '#e2e8f0'}}>Session Overview</h2>
          {documents.length === 0 && history.length === 0 ? (
            <p className="text-xs text-center py-8" style={{color: '#64748b'}}>No activity yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#e2e8f0'}}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent questions */}
      <div className="rounded-2xl p-6" style={{backgroundColor: '#0d1b2a', border: '1px solid #1e3a5f'}}>
        <h2 className="text-sm font-semibold mb-4" style={{color: '#e2e8f0'}}>Recent Questions</h2>
        {history.length === 0 ? (
          <p className="text-xs text-center py-4" style={{color: '#64748b'}}>No questions asked yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {[...history].reverse().map((item, i) => (
              <div key={i} className="rounded-xl p-4" style={{backgroundColor: '#0a0f1e', border: '1px solid #1e3a5f'}}>
                <p className="text-xs font-medium mb-2" style={{color: '#00d4ff'}}>Q: {item.question}</p>
                <p className="text-xs leading-relaxed line-clamp-2" style={{color: '#94a3b8'}}>
                  A: {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
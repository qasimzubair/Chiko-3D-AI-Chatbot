'use client'
import { useState } from 'react'
import Avatar from '../components/Avatar'

export default function Home() {
  const [emotion, setEmotion] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!text.trim()) return
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()
      setEmotion(data.emotion || '')

      if (data.audio) {
        const audio = new Audio('data:audio/mp3;base64,' + data.audio)
        audio.play()
      }
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
  }

  return (
    <div className="container-fluid" style={{ height: '100vh' }}>
      <div className="row h-100">
        {/* Left: 3D Avatar */}
        <div className="col-md-7 d-flex align-items-center justify-content-center bg-light">
          <div style={{ width: '100%', height: '80%' }}>
            <Avatar emotion={emotion} />
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="col-md-5 d-flex flex-column align-items-center justify-content-center p-4 bg-white">
          <h1 className="mb-4">Ask Chiko</h1>
          <textarea
            className="form-control mb-3"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your question..."
          />
          <button
            className="btn btn-primary w-50"
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}

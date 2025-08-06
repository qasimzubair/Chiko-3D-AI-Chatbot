'use client'
import { useState, useEffect } from 'react'
import Avatar from '../components/Avatar'

export default function Home() {
  const [emotion, setEmotion] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [chikoResponse, setChikoResponse] = useState('')
  const [showCaption, setShowCaption] = useState(false)

  // Reset context and greeting on page load
  useEffect(() => {
    const initializePage = async () => {
      // First, reset the context
      try {
        await fetch("http://127.0.0.1:5001/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        console.log("Context reset successfully")
      } catch (err) {
        console.error("Context reset failed:", err)
      }

      // Enable audio context for better autoplay support
      const enableAudio = () => {
        if (typeof window !== 'undefined' && window.AudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)()
          if (audioContext.state === 'suspended') {
            audioContext.resume()
          }
        }
      }
      enableAudio()

      // Then send greeting with audio
      const sendGreeting = async () => {
        try {
          const res = await fetch("http://127.0.0.1:5001/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "Hello! Welcome to the website!" }),
          })

          const data = await res.json()
          console.log('Greeting response:', { 
            hasAudio: !!data.audio, 
            audioLength: data.audio ? data.audio.length : 0,
            emotion: data.emotion,
            text: data.text 
          })
          
          setEmotion(data.emotion || 'excited_hello')
          setChikoResponse(data.text || "Hey there! Welcome! I'm Chiko, your sarcastic tour guide. Ask me anything!")
          setShowCaption(true)

          if (data.audio) {
            try {
              console.log('Creating audio element with base64 data')
              const audio = new Audio('data:audio/wav;base64,' + data.audio)
              audio.volume = 0.8
              
              // Set attributes that help with autoplay
              audio.muted = false
              audio.preload = 'auto'
              
              // Hide caption when audio ends
              audio.onended = () => {
                console.log('Greeting audio ended')
                setShowCaption(false)
              }
              
              // Force autoplay for greeting - try multiple approaches
              const forcePlay = async () => {
                try {
                  // Attempt 1: Direct play
                  await audio.play()
                  console.log('Greeting audio playing successfully')
                } catch (error) {
                  console.log('Direct play failed, trying workarounds:', error)
                  
                  try {
                    // Attempt 2: Set volume and try again
                    audio.volume = 1.0
                    await audio.play()
                    console.log('Greeting audio playing after volume adjustment')
                  } catch (error2) {
                    console.log('Volume adjustment failed, trying muted play:', error2)
                    
                    try {
                      // Attempt 3: Start muted then unmute (browser workaround)
                      audio.muted = true
                      await audio.play()
                      setTimeout(() => {
                        audio.muted = false
                        console.log('Greeting audio unmuted and playing')
                      }, 100)
                    } catch (error3) {
                      console.log('All autoplay attempts failed:', error3)
                      // Keep caption visible for longer when audio fails
                      setTimeout(() => setShowCaption(false), 10000)
                    }
                  }
                }
              }
              
              // Immediate play attempt
              forcePlay()
            } catch (audioError) {
              console.log("Greeting audio creation error:", audioError)
              setTimeout(() => setShowCaption(false), 8000)
            }
          } else {
            console.log('No audio data received in greeting response')
            // If no audio, hide caption after 8 seconds for greeting
            setTimeout(() => setShowCaption(false), 8000)
          }
        } catch (err) {
          console.error("Greeting error:", err)
          // Fallback greeting without server
          setEmotion('excited_hello')
          setChikoResponse("Hey there! Welcome! I'm Chiko, your sarcastic tour guide. Ask me anything!")
          setShowCaption(true)
          setTimeout(() => setShowCaption(false), 6000)
        }
      }

      // Small delay after reset before greeting
      setTimeout(sendGreeting, 500)
    }

    // Delay initialization slightly to let the page load
    const timer = setTimeout(initializePage, 1000)
    return () => clearTimeout(timer)
  }, []) // Empty dependency array means this runs once on mount

  const handleAsk = async () => {
    if (!text.trim()) return
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()
      setEmotion(data.emotion || '')
      setChikoResponse(data.text || '')
      setShowCaption(true)

      if (data.audio) {
        try {
          const audio = new Audio('data:audio/wav;base64,' + data.audio)
          audio.volume = 0.8
          
          // Hide caption when audio ends
          audio.onended = () => {
            setShowCaption(false)
          }
          
          // Mobile audio playbook
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Audio autoplay prevented:", error)
              // If audio fails, hide caption after 5 seconds as fallback
              setTimeout(() => setShowCaption(false), 5000)
            })
          }
        } catch (audioError) {
          console.log("Audio playback error:", audioError)
          // If audio fails, hide caption after 5 seconds as fallback
          setTimeout(() => setShowCaption(false), 5000)
        }
      } else {
        // If no audio, hide caption after 5 seconds
        setTimeout(() => setShowCaption(false), 5000)
      }
    } catch (err) {
      console.error("Error:", err)
    }
    setLoading(false)
    setText('') // Clear the input after sending
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Prevent default textarea behavior
      handleAsk()
    }
  }

  return (
    <div className="container-fluid p-0" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="row h-100 g-0">
        {/* Left: 3D Avatar - Stack on mobile */}
        <div className="col-12 col-md-7 d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Avatar emotion={emotion} />
            
            {/* Caption overlay */}
            {showCaption && chikoResponse && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '15px 25px',
                borderRadius: '25px',
                maxWidth: '80%',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '500',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 10,
                animation: 'fadeIn 0.5s ease-in'
              }}>
                <div style={{ marginBottom: '5px', fontSize: '12px', color: '#87CEEB', fontWeight: 'bold' }}>
                  Chiko says:
                </div>
                {chikoResponse}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat Panel - Stack on mobile */}
        <div className="col-12 col-md-5 d-flex flex-column align-items-center justify-content-center p-3 bg-white" style={{ height: '100vh' }}>
          <h1 className="mb-3 text-center" style={{ color: '#000000', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Ask Chiko</h1>
          <textarea
            className="form-control mb-3 w-100"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question... (Press Enter to send, Shift+Enter for new line)"
            style={{ color: '#000000', fontSize: '16px' }}
          />
          <button
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '200px', fontSize: '16px', padding: '12px' }}
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

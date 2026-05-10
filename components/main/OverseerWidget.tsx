'use client'

import { useState, useTransition } from 'react'
import { Send, Bot } from 'lucide-react'

export function OverseerWidget({ todayContext }: { todayContext: object }) {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || isLoading) return
    const msg = message.trim()
    setMessage('')
    setIsLoading(true)
    setResponse(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/overseer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, context: todayContext }),
        })
        const data = await res.json()
        setResponse(data.response ?? 'No response.')
      } catch {
        setResponse('Failed to reach Overseer.')
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="px-5 pt-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2">
        <Bot size={14} className="text-text-tertiary shrink-0" />
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Message Overseer…"
          className="flex-1 bg-transparent text-text-secondary text-sm placeholder:text-text-tertiary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="text-text-tertiary hover:text-gold transition-colors duration-150 disabled:opacity-40 shrink-0"
        >
          <Send size={13} />
        </button>
      </form>

      {isLoading && (
        <p className="text-text-tertiary text-xs mt-2 px-3 italic">Overseer is thinking…</p>
      )}

      {response && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border-subtle animate-in">
          <p className="text-text-secondary text-sm leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  )
}

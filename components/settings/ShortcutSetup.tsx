'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Copy, Check } from 'lucide-react'

export function ShortcutSetup({ shortcutToken }: { shortcutToken: string }) {
  const [copied, setCopied] = useState(false)
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/health/shortcut`
    : '/api/health/shortcut'

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle p-5 space-y-4">
      <SectionHeader title="APPLE HEALTH SHORTCUT" />

      <p className="text-text-secondary text-sm leading-relaxed">
        Use an iOS Shortcut to push steps, sleep, and screen time from Apple Health into GoalMaxx automatically.
      </p>

      <div className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase">Setup steps</p>
        <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
          <li>Open the Shortcuts app on your iPhone</li>
          <li>Create a new shortcut with a <strong className="text-text-primary">Personal Automation</strong> trigger (e.g. daily at 7 AM)</li>
          <li>Add a <strong className="text-text-primary">Get Contents of URL</strong> action with the URL below</li>
          <li>Set method to <strong className="text-text-primary">POST</strong></li>
          <li>Set body type to <strong className="text-text-primary">JSON</strong></li>
          <li>
            Add fields: <code className="bg-bg-input px-1 rounded text-gold text-xs">date</code>,{' '}
            <code className="bg-bg-input px-1 rounded text-gold text-xs">steps</code>,{' '}
            <code className="bg-bg-input px-1 rounded text-gold text-xs">sleep_minutes</code>,{' '}
            <code className="bg-bg-input px-1 rounded text-gold text-xs">screen_time_minutes</code>,{' '}
            <code className="bg-bg-input px-1 rounded text-gold text-xs">social_minutes</code>
          </li>
          <li>Add header <code className="bg-bg-input px-1 rounded text-gold text-xs">x-shortcut-token</code> with your token</li>
        </ol>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-2">Webhook URL</p>
        <div className="flex items-center gap-2 bg-bg-input border border-border-subtle rounded-lg px-3 py-2">
          <code className="text-gold text-xs flex-1 truncate">{webhookUrl}</code>
          <button onClick={copyUrl} className="shrink-0 text-text-secondary hover:text-gold transition-colors duration-150">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {shortcutToken && (
        <div>
          <p className="text-[11px] font-medium tracking-[0.15em] text-text-secondary uppercase mb-2">Your token</p>
          <code className="block bg-bg-input border border-border-subtle rounded-lg px-3 py-2 text-gold text-xs break-all">
            {shortcutToken}
          </code>
        </div>
      )}

      {!shortcutToken && (
        <p className="text-text-tertiary text-xs">
          Set <code className="text-gold">SHORTCUT_TOKEN</code> in your .env.local, then it will appear here.
        </p>
      )}
    </div>
  )
}

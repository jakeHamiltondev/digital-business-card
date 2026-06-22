'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeBlock({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700">
        <QRCodeSVG value={url} size={160} marginSize={1} />
      </div>
      <p className="max-w-xs truncate text-xs text-zinc-500 dark:text-zinc-400">{url}</p>
      <button
        onClick={copyLink}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

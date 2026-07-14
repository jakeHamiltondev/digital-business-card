'use client'

import { useState, useEffect, useTransition } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { submitFeedback } from '@/app/actions/feedback'

export default function FeedbackModal() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  useEffect(() => {
    if (!open) {
      setMessage('')
      setSuccess(false)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setOpen(false), 2000)
    return () => clearTimeout(timer)
  }, [success])

  function handleSubmit() {
    if (!message.trim()) return
    startTransition(async () => {
      const result = await submitFeedback(message.trim(), pathname)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Send Feedback
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {success ? (
              <p className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                Thanks for your feedback!
              </p>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind? Suggestions, bugs, or anything else."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">{error}</p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isPending || !message.trim()}
                  className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isPending ? 'Sending…' : 'Send'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

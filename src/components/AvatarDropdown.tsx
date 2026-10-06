'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LogOut, MessageSquare } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import FeedbackModal from '@/components/FeedbackModal'

interface AvatarDropdownProps {
  initial: string
  email: string
}

export default function AvatarDropdown({ initial, email }: AvatarDropdownProps) {
  const [open, setOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const closeFeedback = useCallback(() => setFeedbackOpen(false), [])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #6d28d9)' }}
          aria-label="Account menu"
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 top-10 z-50 min-w-[180px] rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <p className="px-3 py-2 font-mono text-xs text-zinc-400">
              {email}
            </p>
            <div className="mx-2 border-t border-zinc-100 dark:border-zinc-800" />
            <button
              onClick={() => { setOpen(false); setFeedbackOpen(true) }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </button>
            <div className="mx-2 border-t border-zinc-100 dark:border-zinc-800" />
            <form action={signOut}>
              <button
                type="submit"
                className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>

      <FeedbackModal open={feedbackOpen} onClose={closeFeedback} />
    </>
  )
}

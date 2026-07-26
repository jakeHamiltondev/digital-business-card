'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { saveCard, unsaveCard } from '@/app/actions/saved-cards'

export default function SaveCardButton({
  profileId,
  initialSaved,
}: {
  profileId: string
  initialSaved: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (saved) {
    if (confirming) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <span>Remove from My Cards?</span>
            <button
              onClick={() => {
                startTransition(async () => {
                  const result = await unsaveCard(profileId)
                  if (result.error) {
                    setErrorMsg(result.error)
                  } else {
                    setSaved(false)
                  }
                  setConfirming(false)
                })
              }}
              disabled={isPending}
              className="font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="text-zinc-500 hover:underline disabled:opacity-60 dark:text-zinc-400"
            >
              No
            </button>
          </div>
          {errorMsg && (
            <p className="text-center text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
          )}
        </div>
      )
    }

    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-3 text-sm font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      >
        <Bookmark className="h-4 w-4" fill="currentColor" />
        Saved
      </button>
    )
  }

  const handleSave = () => {
    setSaved(true)
    setErrorMsg(null)
    startTransition(async () => {
      const result = await saveCard(profileId)
      if (result.error) {
        setSaved(false)
        setErrorMsg(result.error)
      } else {
        router.push('/cards')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Bookmark className="h-4 w-4" fill="none" />
        Save Card
      </button>
      {errorMsg && (
        <p className="text-center text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}

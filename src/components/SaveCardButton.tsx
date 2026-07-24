'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { saveCard } from '@/app/actions/saved-cards'

export default function SaveCardButton({
  profileId,
  initialSaved,
}: {
  profileId: string
  initialSaved: boolean
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (saved) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-3 text-sm font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900">
        <Bookmark className="h-4 w-4" fill="currentColor" />
        Saved
      </div>
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

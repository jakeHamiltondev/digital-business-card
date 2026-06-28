'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { saveCard, unsaveCard } from '@/app/actions/saved-cards'

export default function SaveCardButton({
  profileId,
  initialSaved,
}: {
  profileId: string
  initialSaved: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const result = next ? await saveCard(profileId) : await unsaveCard(profileId)
      if (result.error) setSaved(!next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-60 ${
        saved
          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
      }`}
    >
      <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save Card'}
    </button>
  )
}

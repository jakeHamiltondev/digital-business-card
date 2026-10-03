'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/actions/account'

export default function DangerZone() {
  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteAccount()
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  if (!confirming) {
    return (
      <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
        >
          Delete my account
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Are you sure? This will permanently delete your account and all your data. This cannot be undone.
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Yes, delete my account'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { deleteAccount } from '@/app/actions/account'

export default function DangerZone() {
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openModal() {
    setConfirmText('')
    setError(null)
    setShowModal(true)
  }

  function closeModal() {
    if (isPending) return
    setShowModal(false)
    setConfirmText('')
    setError(null)
  }

  function handleDelete() {
    if (confirmText !== 'DELETE') return
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      // deleteAccount redirects on success — we only land here on error
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <>
      <section className="rounded-xl border border-red-200 p-6 dark:border-red-900/60">
        <h2 className="mb-1 text-base font-semibold text-red-700 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Permanently delete your account and all associated data.
        </p>
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Delete Account
        </button>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="p-6">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Delete your account?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete your account? This will permanently delete your
                profile, saved cards, and all associated data. This action cannot be undone.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="confirm-delete"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Type <span className="font-mono font-bold tracking-widest">DELETE</span> to
                  confirm
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                  placeholder="DELETE"
                  autoFocus
                  className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
                />
              </div>

              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

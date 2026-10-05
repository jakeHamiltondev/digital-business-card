'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ExternalLink, Loader2, Upload, X } from 'lucide-react'
import { uploadResume, deleteResume } from '@/app/actions/resume'

export default function ResumeUploadSection({
  resumeUrl,
  signedUrl,
}: {
  resumeUrl: string | null
  signedUrl: string | null
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('File must be a PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.')
      return
    }

    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await uploadResume(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteResume()
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Resume PDF
        </h2>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Upload a PDF to show a &ldquo;View Resume&rdquo; link on your card. Free for all users.
        </p>
      </div>

      {resumeUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
            resume.pdf
          </span>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </a>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
          >
            {isPending ? 'Working…' : 'Replace'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-zinc-700"
            aria-label="Remove resume"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Resume (PDF, max 5 MB)
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </section>
  )
}

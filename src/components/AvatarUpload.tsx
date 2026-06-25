'use client'

import { useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateAvatarUrl } from '@/app/dashboard/actions'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

function AvatarPreview({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Profile photo'}
        className="h-20 w-20 rounded-full object-cover"
      />
    )
  }
  const initial = name?.trim().charAt(0).toUpperCase() ?? '?'
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
      {initial}
    </div>
  )
}

export default function AvatarUpload({
  userId,
  avatarUrl: initialAvatarUrl,
  fullName,
}: {
  userId: string
  avatarUrl: string | null
  fullName: string | null
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be 2 MB or smaller.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const path = `${userId}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      const result = await updateAvatarUrl(publicUrl)
      if (result.error) {
        setError(result.error)
        return
      }

      setAvatarUrl(publicUrl)
    })
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <AvatarPreview name={fullName} avatarUrl={avatarUrl} />
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {isPending ? 'Uploading…' : 'Change photo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-zinc-400">JPG, PNG or WebP · max 2 MB</p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}

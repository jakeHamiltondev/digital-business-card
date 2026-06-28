'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Star, Trash2, Plus, X } from 'lucide-react'
import type { SavedCardWithProfile } from '@/lib/types'

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
]

function tagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

function formatRelativeDate(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks === 1) return '1 week ago'
  if (weeks < 4) return `${weeks} weeks ago`
  const months = Math.floor(days / 30)
  if (months === 1) return '1 month ago'
  return `${months} months ago`
}

function Avatar({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? 'Profile photo'}
        className="h-10 w-10 shrink-0 rounded-full object-cover object-top"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
      {name?.trim().charAt(0).toUpperCase() ?? '?'}
    </div>
  )
}

type Props = {
  card: SavedCardWithProfile
  onToggleFavorite: (savedCardId: string, currentIsFavorite: boolean) => void
  onAddTag: (savedCardId: string, tag: string) => void
  onRemoveTag: (savedCardId: string, tag: string) => void
  onDelete: (savedCardId: string) => void
}

export default function SavedCardItem({
  card,
  onToggleFavorite,
  onAddTag,
  onRemoveTag,
  onDelete,
}: Props) {
  const { profile } = card
  const tags = card.tags ?? []

  const [isAddingTag, setIsAddingTag] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAddingTag) tagInputRef.current?.focus()
  }, [isAddingTag])

  const titleLine = [profile.title, profile.company].filter(Boolean).join(' at ')

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !tags.includes(trimmed)) {
        onAddTag(card.id, trimmed)
      }
      setTagInput('')
      setIsAddingTag(false)
    }
    if (e.key === 'Escape') {
      setTagInput('')
      setIsAddingTag(false)
    }
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <Link href={`/${profile.username}`} className="shrink-0">
          <Avatar name={profile.full_name} avatarUrl={profile.avatar_url} />
        </Link>

        <Link href={`/${profile.username}`} className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
            {profile.full_name ?? profile.username}
          </p>
          {titleLine && (
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{titleLine}</p>
          )}
        </Link>

        <button
          onClick={() => onToggleFavorite(card.id, card.is_favorite)}
          aria-label={card.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-400"
        >
          <Star
            className="h-4 w-4"
            fill={card.is_favorite ? 'currentColor' : 'none'}
            stroke={card.is_favorite ? 'none' : 'currentColor'}
            color={card.is_favorite ? '#f59e0b' : undefined}
          />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColor(tag)}`}
          >
            {tag}
            <button
              onClick={() => onRemoveTag(card.id, tag)}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {isAddingTag ? (
          <input
            ref={tagInputRef}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => {
              setTagInput('')
              setIsAddingTag(false)
            }}
            placeholder="Add tag…"
            className="h-5 rounded-full border border-zinc-300 bg-white px-2 text-xs outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
        ) : (
          <button
            onClick={() => setIsAddingTag(true)}
            aria-label="Add tag"
            className="flex items-center gap-0.5 rounded-full border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-400"
          >
            <Plus className="h-3 w-3" />
            Tag
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {formatRelativeDate(card.saved_at)}
        </p>

        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Remove?</span>
            <button
              onClick={() => {
                onDelete(card.id)
                setShowDeleteConfirm(false)
              }}
              className="rounded px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded px-2 py-0.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete saved card"
            className="rounded-lg p-1 text-zinc-300 transition-colors hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

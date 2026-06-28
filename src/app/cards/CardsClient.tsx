'use client'

import { useState, useTransition, useMemo } from 'react'
import { Search, Bookmark } from 'lucide-react'
import type { SavedCardWithProfile } from '@/lib/types'
import {
  toggleFavorite,
  addTag,
  removeTag,
  deleteSavedCard,
} from '@/app/actions/saved-cards'
import SavedCardItem from './SavedCardItem'

type SortOption = 'saved_at_desc' | 'saved_at_asc' | 'name_asc'
type FilterMode = 'all' | 'favorites'

export default function CardsClient({
  initialCards,
}: {
  initialCards: SavedCardWithProfile[]
}) {
  const [cards, setCards] = useState(initialCards)
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [filterTag, setFilterTag] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('saved_at_desc')
  const [, startTransition] = useTransition()

  const allTags = useMemo(
    () => Array.from(new Set(cards.flatMap((c) => c.tags ?? []))).sort(),
    [cards],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return cards
      .filter((card) => {
        if (filterMode === 'favorites' && !card.is_favorite) return false
        if (filterTag && !(card.tags ?? []).includes(filterTag)) return false
        if (q) {
          const name = (card.profile.full_name ?? '').toLowerCase()
          const username = card.profile.username.toLowerCase()
          if (!name.includes(q) && !username.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'saved_at_asc')
          return new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime()
        if (sortBy === 'name_asc') {
          const nameA = (a.profile.full_name ?? a.profile.username).toLowerCase()
          const nameB = (b.profile.full_name ?? b.profile.username).toLowerCase()
          return nameA.localeCompare(nameB)
        }
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
      })
  }, [cards, search, filterMode, filterTag, sortBy])

  const handleToggleFavorite = (savedCardId: string, currentIsFavorite: boolean) => {
    const newValue = !currentIsFavorite
    setCards((prev) =>
      prev.map((c) => (c.id === savedCardId ? { ...c, is_favorite: newValue } : c)),
    )
    startTransition(async () => {
      const result = await toggleFavorite(savedCardId, newValue)
      if (result.error) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === savedCardId ? { ...c, is_favorite: currentIsFavorite } : c,
          ),
        )
      }
    })
  }

  const handleAddTag = (savedCardId: string, tag: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === savedCardId ? { ...c, tags: [...(c.tags ?? []), tag] } : c,
      ),
    )
    startTransition(async () => {
      const result = await addTag(savedCardId, tag)
      if (result.error) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === savedCardId
              ? { ...c, tags: (c.tags ?? []).filter((t) => t !== tag) }
              : c,
          ),
        )
      }
    })
  }

  const handleRemoveTag = (savedCardId: string, tag: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === savedCardId ? { ...c, tags: (c.tags ?? []).filter((t) => t !== tag) } : c,
      ),
    )
    startTransition(async () => {
      const result = await removeTag(savedCardId, tag)
      if (result.error) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === savedCardId ? { ...c, tags: [...(c.tags ?? []), tag] } : c,
          ),
        )
      }
    })
  }

  const handleDelete = (savedCardId: string) => {
    const snapshot = cards.find((c) => c.id === savedCardId)
    setCards((prev) => prev.filter((c) => c.id !== savedCardId))
    startTransition(async () => {
      const result = await deleteSavedCard(savedCardId)
      if (result.error && snapshot) {
        setCards((prev) =>
          [...prev, snapshot].sort(
            (a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime(),
          ),
        )
      }
    })
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Bookmark className="mb-4 h-12 w-12 text-zinc-200 dark:text-zinc-700" />
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          No saved cards yet
        </p>
        <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
          When you visit someone&apos;s Linkfol card, tap <strong>Save Card</strong> to add them
          here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1" style={{ minWidth: '180px' }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
          />
        </div>

        <div className="flex rounded-lg border border-zinc-200 bg-white text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={() => setFilterMode('all')}
            className={`rounded-l-lg px-3 py-2 font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`rounded-r-lg px-3 py-2 font-medium transition-colors ${
              filterMode === 'favorites'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Favorites
          </button>
        </div>

        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-500"
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-500"
        >
          <option value="saved_at_desc">Newest first</option>
          <option value="saved_at_asc">Oldest first</option>
          <option value="name_asc">Name A–Z</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No cards match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <SavedCardItem
              key={card.id}
              card={card}
              onToggleFavorite={handleToggleFavorite}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, X, Check, Loader2 } from 'lucide-react'
import {
  addResumeEntry,
  updateResumeEntry,
  deleteResumeEntry,
} from '@/app/actions/resume'
import type { ResumeEntry, ResumeEntryType } from '@/lib/types'

const SECTION_LABELS: Record<ResumeEntryType, string> = {
  experience: 'Work Experience',
  education: 'Education',
  skill: 'Skills',
  project: 'Projects',
  certification: 'Certifications',
}

const ENTRY_TYPES: ResumeEntryType[] = [
  'experience',
  'education',
  'skill',
  'project',
  'certification',
]

type FormState = {
  title: string
  organization: string
  location: string
  start_date: string
  end_date: string
  description: string
  skills_list: string
}

const emptyForm = (): FormState => ({
  title: '',
  organization: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
  skills_list: '',
})

function entryToForm(entry: ResumeEntry): FormState {
  return {
    title: entry.title,
    organization: entry.organization ?? '',
    location: entry.location ?? '',
    start_date: entry.start_date ?? '',
    end_date: entry.end_date ?? '',
    description: entry.description ?? '',
    skills_list: (entry.skills_list ?? []).join(', '),
  }
}

function parseSkillsList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

type ActiveForm =
  | { mode: 'add'; type: ResumeEntryType }
  | { mode: 'edit'; entry: ResumeEntry }
  | null

function EntryForm({
  type,
  initial,
  onSave,
  onCancel,
}: {
  type: ResumeEntryType
  initial: FormState
  onSave: (data: FormState) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await onSave(form)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  const inputCls =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-500'
  const labelCls = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div>
        <label className={labelCls}>
          {type === 'skill' ? 'Skill Category' : type === 'education' ? 'Degree / Program' : 'Title'}
        </label>
        <input className={inputCls} value={form.title} onChange={set('title')} required placeholder={
          type === 'skill' ? 'e.g. Programming Languages' : type === 'education' ? 'e.g. B.S. Computer Science' : 'e.g. Senior Engineer'
        } />
      </div>

      {type !== 'project' && type !== 'skill' && (
        <div>
          <label className={labelCls}>
            {type === 'education' ? 'School' : type === 'certification' ? 'Issuing Organization' : 'Company'}
          </label>
          <input className={inputCls} value={form.organization} onChange={set('organization')} placeholder={
            type === 'education' ? 'e.g. MIT' : type === 'certification' ? 'e.g. AWS' : 'e.g. Acme Corp'
          } />
        </div>
      )}

      {(type === 'experience' || type === 'education') && (
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location} onChange={set('location')} placeholder='e.g. San Francisco, CA or Remote' />
        </div>
      )}

      {type !== 'skill' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              {type === 'certification' ? 'Date Earned' : 'Start Date'}
            </label>
            <input className={inputCls} value={form.start_date} onChange={set('start_date')} placeholder='e.g. Jan 2022' />
          </div>
          {type !== 'certification' && (
            <div>
              <label className={labelCls}>End Date</label>
              <input className={inputCls} value={form.end_date} onChange={set('end_date')} placeholder='e.g. Present' />
            </div>
          )}
        </div>
      )}

      {type !== 'skill' && (
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.description}
            onChange={set('description')}
            placeholder={type === 'experience' ? 'Key responsibilities and achievements…' : 'Additional details…'}
          />
        </div>
      )}

      {(type === 'skill' || type === 'project' || type === 'experience' || type === 'education') && (
        <div>
          <label className={labelCls}>
            {type === 'skill' ? 'Skills (comma-separated)' : 'Skills / Tools Used'}
          </label>
          <input
            className={inputCls}
            value={form.skills_list}
            onChange={set('skills_list')}
            placeholder={type === 'skill' ? 'e.g. TypeScript, React, Node.js' : 'e.g. React, Postgres'}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </form>
  )
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ResumeEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await onDelete()
    })
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{entry.title}</p>
          {entry.organization && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{entry.organization}</p>
          )}
          {(entry.start_date || entry.end_date || entry.location) && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
              {[entry.location, [entry.start_date, entry.end_date].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
            </p>
          )}
          {entry.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{entry.description}</p>
          )}
          {entry.skills_list && entry.skills_list.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.skills_list.map((s) => (
                <span key={s} className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={pending}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResumeSection({
  type,
  entries,
  activeForm,
  onSetActiveForm,
  onClearActiveForm,
  onRefresh,
}: {
  type: ResumeEntryType
  entries: ResumeEntry[]
  activeForm: ActiveForm
  onSetActiveForm: (f: ActiveForm) => void
  onClearActiveForm: () => void
  onRefresh: () => void
}) {
  const isAddingHere =
    activeForm?.mode === 'add' && activeForm.type === type

  async function handleAdd(form: FormState) {
    const result = await addResumeEntry({
      type,
      title: form.title,
      organization: form.organization || undefined,
      location: form.location || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      description: form.description || undefined,
      skills_list: parseSkillsList(form.skills_list),
    })
    if (result.error) throw new Error(result.error)
    onClearActiveForm()
    onRefresh()
  }

  async function handleEdit(entry: ResumeEntry, form: FormState) {
    const result = await updateResumeEntry(entry.id, {
      title: form.title,
      organization: form.organization || undefined,
      location: form.location || undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      description: form.description || undefined,
      skills_list: parseSkillsList(form.skills_list),
    })
    if (result.error) throw new Error(result.error)
    onClearActiveForm()
    onRefresh()
  }

  async function handleDelete(entry: ResumeEntry) {
    await deleteResumeEntry(entry.id)
    onRefresh()
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {SECTION_LABELS[type]}
        </h2>
        <button
          onClick={() => onSetActiveForm({ mode: 'add', type })}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {entries.map((entry) => {
        const isEditingThis =
          activeForm?.mode === 'edit' && activeForm.entry.id === entry.id
        return isEditingThis ? (
          <EntryForm
            key={entry.id}
            type={type}
            initial={entryToForm(entry)}
            onSave={(form) => handleEdit(entry, form)}
            onCancel={onClearActiveForm}
          />
        ) : (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => onSetActiveForm({ mode: 'edit', entry })}
            onDelete={() => handleDelete(entry)}
          />
        )
      })}

      {isAddingHere && (
        <EntryForm
          type={type}
          initial={emptyForm()}
          onSave={handleAdd}
          onCancel={onClearActiveForm}
        />
      )}

      {entries.length === 0 && !isAddingHere && (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">No entries yet.</p>
      )}
    </section>
  )
}

export default function ResumeClient({ initialEntries }: { initialEntries: ResumeEntry[] }) {
  const router = useRouter()
  const [entries] = useState<ResumeEntry[]>(initialEntries)
  const [activeForm, setActiveForm] = useState<ActiveForm>(null)

  function refresh() {
    router.refresh()
  }

  function entriesFor(type: ResumeEntryType) {
    return entries.filter((e) => e.type === type)
  }

  return (
    <div className="space-y-10">
      {ENTRY_TYPES.map((type) => (
        <ResumeSection
          key={type}
          type={type}
          entries={entriesFor(type)}
          activeForm={activeForm}
          onSetActiveForm={setActiveForm}
          onClearActiveForm={() => setActiveForm(null)}
          onRefresh={refresh}
        />
      ))}
    </div>
  )
}

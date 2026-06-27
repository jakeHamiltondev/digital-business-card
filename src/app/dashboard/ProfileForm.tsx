'use client'

import { useActionState } from 'react'
import { updateProfile } from './actions'
import type { FormState } from './actions'
import type { Profile } from '@/lib/types'

const initialState: FormState = { success: false, error: null }

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500'

const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  defaultValue?: string | null
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const social = profile.social_links ?? {}

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Basic Information
        </h2>
        <div>
          <label htmlFor="username" className={labelClass}>
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            defaultValue={profile.username}
            placeholder="your-username"
            className={inputClass}
          />
        </div>
        <Field label="Full Name" name="full_name" defaultValue={profile.full_name} placeholder="Jane Smith" />
        <Field label="Title" name="title" defaultValue={profile.title} placeholder="Software Engineer" />
        <Field label="Company" name="company" defaultValue={profile.company} placeholder="Acme Corp" />
        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile.bio ?? ''}
            placeholder="A short description about yourself..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Contact
        </h2>
        <Field label="Email" name="email" type="email" defaultValue={profile.email} placeholder="jane@example.com" />
        <Field label="Phone" name="phone" type="tel" defaultValue={profile.phone} placeholder="+1 (555) 000-0000" />
        <Field label="Website" name="website" type="url" defaultValue={profile.website} placeholder="https://example.com" />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Social Links
        </h2>
        <Field label="LinkedIn" name="linkedin" defaultValue={social.linkedin} placeholder="https://linkedin.com/in/username" />
        <Field label="Twitter / X" name="twitter" defaultValue={social.twitter} placeholder="https://x.com/username" />
        <Field label="Instagram" name="instagram" defaultValue={social.instagram} placeholder="https://instagram.com/username" />
        <Field label="GitHub" name="github" defaultValue={social.github} placeholder="https://github.com/username" />
      </section>

      <div className="space-y-3">
        {state.success && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Profile saved successfully.
          </p>
        )}
        {state.error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}

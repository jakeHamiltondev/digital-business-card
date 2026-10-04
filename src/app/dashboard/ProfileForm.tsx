'use client'

import { useRef, useState } from 'react'
import { X, Plus, Lock, Mail, Phone, Globe, MapPin, QrCode } from 'lucide-react'
import ProfileTabs from '@/components/ProfileTabs'
import type { TabId } from '@/components/ProfileTabs'
import AvatarUpload from '@/components/AvatarUpload'
import { updateProfile } from './actions'
import type { Profile, Persona, AddressVisibility, PhoneEntry, WorkAddress, StudentInfo, RecruiterInfo, SocialLinks } from '@/lib/types'
import { themes } from '@/lib/themes'
import { isPro } from '@/lib/subscription'
import { PERSONA_CONFIG, FIELD_DEFS, UNIVERSAL_EDITOR_SECTIONS, PRO_EDITOR_SECTION } from '@/lib/persona-config'
import type { EditorSectionDef, FieldKey } from '@/lib/persona-config'
import { createClient } from '@/lib/supabase/client'
import LayoutSelector from '@/components/card/LayoutSelector'
import type { CardLayout } from '@/components/card/LayoutSelector'

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500'

const selectClass =
  'rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-500'

const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

// ── Sub-components ────────────────────────────────────────────────────────────

function ProBadge() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      Pro
    </span>
  )
}

function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 10)
  if (d.length === 0) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function PhonesRepeater({
  phones,
  onChange,
}: {
  phones: PhoneEntry[]
  onChange: (phones: PhoneEntry[]) => void
}) {
  function add() {
    onChange([...phones, { type: 'mobile', number: '' }])
  }

  function remove(i: number) {
    onChange(phones.filter((_, j) => j !== i))
  }

  function updateType(i: number, type: PhoneEntry['type']) {
    onChange(phones.map((p, j) => (j === i ? { ...p, type } : p)))
  }

  function updateNumber(i: number, raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    onChange(phones.map((p, j) => (j === i ? { ...p, number: digits } : p)))
  }

  return (
    <div className="space-y-2">
      {phones.map((phone, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={phone.type}
            onChange={(e) => updateType(i, e.target.value as PhoneEntry['type'])}
            className={`${selectClass} w-28 shrink-0`}
          >
            <option value="mobile">Mobile</option>
            <option value="office">Office</option>
            <option value="fax">Fax</option>
          </select>
          <input
            type="tel"
            value={formatPhoneDisplay(phone.number)}
            onChange={(e) => updateNumber(i, e.target.value)}
            placeholder="(555) 000-0000"
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
            aria-label="Remove phone"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <Plus className="h-4 w-4" />
        Add phone
      </button>
    </div>
  )
}

function WorkAddressBlock({
  value,
  onChange,
}: {
  value: WorkAddress | null
  onChange: (v: WorkAddress) => void
}) {
  const addr = value ?? {}

  function set(field: keyof WorkAddress, val: string) {
    onChange({ ...addr, [field]: val || undefined })
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={addr.street1 ?? ''}
        onChange={(e) => set('street1', e.target.value)}
        placeholder="Street address"
        className={inputClass}
      />
      <input
        type="text"
        value={addr.street2 ?? ''}
        onChange={(e) => set('street2', e.target.value)}
        placeholder="Apt, suite, floor (optional)"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={addr.city ?? ''}
          onChange={(e) => set('city', e.target.value)}
          placeholder="City"
          className={inputClass}
        />
        <input
          type="text"
          value={addr.state ?? ''}
          onChange={(e) => set('state', e.target.value)}
          placeholder="State"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={addr.zip ?? ''}
          onChange={(e) => set('zip', e.target.value)}
          placeholder="ZIP / Postal code"
          className={inputClass}
        />
        <input
          type="text"
          value={addr.country ?? ''}
          onChange={(e) => set('country', e.target.value)}
          placeholder="Country"
          className={inputClass}
        />
      </div>
    </div>
  )
}

const VISIBILITY_OPTIONS: Array<{ value: AddressVisibility; label: string; hint: string }> = [
  { value: 'public',     label: 'Show on card',          hint: 'Visible on your public card' },
  { value: 'vcard_only', label: 'Contact save only',      hint: 'Included when someone saves your contact, not shown on card' },
  { value: 'hidden',     label: 'Hidden',                 hint: 'Never shared' },
]

function AddressVisibilitySelector({
  value,
  onChange,
}: {
  value: AddressVisibility
  onChange: (v: AddressVisibility) => void
}) {
  return (
    <div className="space-y-2">
      {VISIBILITY_OPTIONS.map((opt) => (
        <label key={opt.value} className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="address_visibility"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-zinc-900 dark:accent-zinc-50"
          />
          <div>
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{opt.label}</span>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{opt.hint}</p>
          </div>
        </label>
      ))}
    </div>
  )
}

function LogoUpload({
  value,
  onChange,
  userId,
}: {
  value: string
  onChange: (url: string) => void
  userId: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Logo must be under 2 MB.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${userId}/logo.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (error) {
      setUploadError('Upload failed. Check storage bucket permissions.')
      setIsUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    onChange(`${data.publicUrl}?t=${Date.now()}`)
    setIsUploading(false)
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="flex items-center gap-4">
          <img
            src={value}
            alt="Logo"
            className="h-14 w-auto max-w-[160px] rounded object-contain ring-1 ring-zinc-200 dark:ring-zinc-700"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {isUploading ? 'Uploading…' : value ? 'Replace logo' : 'Upload logo'}
        </button>
        <span className="text-xs text-zinc-400">PNG, JPG, WebP · max 2 MB</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) handleFile(f)
        }}
      />
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  )
}

// ── Card Back Picker ──────────────────────────────────────────────────────────

function PickerToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative shrink-0 cursor-pointer rounded-full border-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
      style={{ width: 36, height: 20, background: checked ? '#6366f1' : '#d1d5db' }}
    >
      <span
        className="absolute top-0.5 block rounded-full bg-white shadow transition-all"
        style={{ width: 16, height: 16, left: checked ? 18 : 2 }}
      />
    </button>
  )
}

function LinkedInPickerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" /></svg>
}
function TwitterPickerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}
function InstagramPickerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-zinc-500"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="3" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
}
function GitHubPickerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" /></svg>
}
function TikTokPickerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.56a4.85 4.85 0 0 1-1.01.13z" /></svg>
}

function CardBackPicker({
  email, phones, linkedin, twitter, instagram, github, tiktok, website, location,
  value, onChange,
}: {
  email: string; phones: PhoneEntry[]; linkedin: string; twitter: string; instagram: string
  github: string; tiktok: string; website: string; location: string
  value: string[] | null; onChange: (v: string[] | null) => void
}) {
  type FieldRow = { id: string; label: string; displayValue: string; icon: React.ReactNode }
  const available: FieldRow[] = []

  if (email)
    available.push({ id: 'email', label: 'Email', displayValue: email, icon: <Mail className="h-4 w-4 shrink-0 text-zinc-500" /> })
  const primaryPhone = phones.find(p => p.number)
  if (primaryPhone)
    available.push({ id: 'phone', label: 'Phone', displayValue: formatPhoneDisplay(primaryPhone.number), icon: <Phone className="h-4 w-4 shrink-0 text-zinc-500" /> })
  if (linkedin)
    available.push({ id: 'linkedin', label: 'LinkedIn', displayValue: linkedin.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <LinkedInPickerIcon /> })
  if (twitter)
    available.push({ id: 'twitter', label: 'Twitter / X', displayValue: twitter.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <TwitterPickerIcon /> })
  if (instagram)
    available.push({ id: 'instagram', label: 'Instagram', displayValue: instagram.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <InstagramPickerIcon /> })
  if (github)
    available.push({ id: 'github', label: 'GitHub', displayValue: github.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <GitHubPickerIcon /> })
  if (tiktok)
    available.push({ id: 'tiktok', label: 'TikTok', displayValue: tiktok.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <TikTokPickerIcon /> })
  if (website)
    available.push({ id: 'website', label: 'Website', displayValue: website.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 40), icon: <Globe className="h-4 w-4 shrink-0 text-zinc-500" /> })
  if (location)
    available.push({ id: 'location', label: 'Location', displayValue: location, icon: <MapPin className="h-4 w-4 shrink-0 text-zinc-500" /> })

  const allIds = [...available.map(f => f.id), 'qr']
  const effectiveSelected = value ?? allIds

  const isOn = (id: string) => effectiveSelected.includes(id)
  const qrOn = isOn('qr')
  const maxContact = qrOn ? 4 : 6
  const contactSelected = effectiveSelected.filter(id => id !== 'qr')
  const overLimit = contactSelected.length > maxContact

  function toggle(id: string) {
    const current = value ?? allIds
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    onChange(next)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Card back</h2>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Choose what appears on the back of your card.</p>
        </div>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 pb-0.5">
          {contactSelected.length}/{maxContact}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        {available.map((field, i) => (
          <div
            key={field.id}
            className={`flex items-center gap-3 px-3 py-2.5 ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}
          >
            {field.icon}
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{field.label}</span>
              <span className="ml-2 truncate text-xs text-zinc-400 dark:text-zinc-500">{field.displayValue}</span>
            </div>
            <PickerToggle checked={isOn(field.id)} onChange={() => toggle(field.id)} />
          </div>
        ))}

        <div className="border-t border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800/50">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">QR Code</span>
        </div>
        <div className={`flex items-center gap-3 px-3 py-2.5 ${available.length > 0 ? '' : ''}`}>
          <QrCode className="h-4 w-4 shrink-0 text-zinc-500" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">QR Code</span>
            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">Scan to connect</span>
          </div>
          <PickerToggle checked={isOn('qr')} onChange={() => toggle('qr')} />
        </div>
      </div>

      {overLimit && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Too many fields selected (max {maxContact} with QR {qrOn ? 'on' : 'off'})
        </p>
      )}
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileForm({
  profile,
  userId,
}: {
  profile: Profile
  userId: string
}) {
  const userIsPro = isPro(profile)
  const social = profile.social_links ?? {}

  // ── State ──────────────────────────────────────────────────────────────────

  const [persona, setPersona] = useState<Persona>(profile.persona ?? 'professional')
  const [username, setUsername] = useState(profile.username)
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [email, setEmail] = useState(profile.email ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')

  // Professional
  const [title, setTitle] = useState(profile.title ?? '')
  const [company, setCompany] = useState(profile.company ?? '')
  const [department, setDepartment] = useState(profile.department ?? '')

  // Contact (all personas)
  const [phones, setPhones] = useState<PhoneEntry[]>(profile.phones ?? [])
  const [website, setWebsite] = useState(profile.website ?? '')
  const [location, setLocation] = useState(profile.location ?? '')

  // Address (professional + recruiter)
  const [workAddress, setWorkAddress] = useState<WorkAddress | null>(profile.work_address ?? null)
  const [addressVisibility, setAddressVisibility] = useState<AddressVisibility>(
    profile.address_visibility ?? 'vcard_only'
  )

  // Student
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(profile.student_info ?? {})

  // Recruiter
  const [recruiterInfo, setRecruiterInfo] = useState<RecruiterInfo>(profile.recruiter_info ?? {})

  // Social links
  const [linkedin, setLinkedin] = useState(social.linkedin ?? '')
  const [twitter, setTwitter] = useState(social.twitter ?? '')
  const [instagram, setInstagram] = useState(social.instagram ?? '')
  const [github, setGithub] = useState(social.github ?? '')
  const [tiktok, setTiktok] = useState(social.tiktok ?? '')

  // Theme + Layout + Pro
  const [selectedTheme, setSelectedTheme] = useState(profile.theme ?? 'midnight')
  const [cardLayout, setCardLayout] = useState<CardLayout>(
    (profile.card_layout as CardLayout) ?? 'letterhead'
  )
  const [logoUrl, setLogoUrl] = useState(profile.logo_url ?? '')
  const [brandPrimary, setBrandPrimary] = useState(profile.brand_color_primary ?? '#000000')
  const [brandAccent, setBrandAccent] = useState(profile.brand_color_accent ?? '#ffffff')
  const [useCustomColors, setUseCustomColors] = useState(!!(profile.brand_color_primary))

  // Card back fields
  const [cardBackFields, setCardBackFields] = useState<string[] | null>(
    profile.card_back_fields ?? null
  )

  // Submit state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<TabId>('basic')

  // ── Helpers ────────────────────────────────────────────────────────────────

  function updateStudentInfo<K extends keyof StudentInfo>(key: K, val: string) {
    setStudentInfo((prev) => ({ ...prev, [key]: val || undefined }))
  }

  function updateRecruiterInfo<K extends keyof RecruiterInfo>(key: K, val: string) {
    setRecruiterInfo((prev) => ({ ...prev, [key]: val || undefined }))
  }

  // ── Field renderer ─────────────────────────────────────────────────────────

  function renderField(key: FieldKey): React.ReactNode {
    const def = FIELD_DEFS[key]
    const label = <label className={labelClass}>{def.label}</label>

    switch (key) {
      // ── Top-level profile fields ──────────────────────────────────────────
      case 'title':
        return (
          <div key={key}>
            {label}
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'company':
        return (
          <div key={key}>
            {label}
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'department':
        return (
          <div key={key}>
            {label}
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'website':
        return (
          <div key={key}>
            {label}
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'location':
        return (
          <div key={key}>
            {label}
            {def.hint && <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">{def.hint}</p>}
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )

      // ── Contact ───────────────────────────────────────────────────────────
      case 'phones':
        return (
          <div key={key}>
            {label}
            <PhonesRepeater phones={phones} onChange={setPhones} />
          </div>
        )

      // ── Address ───────────────────────────────────────────────────────────
      case 'work_address':
        return (
          <div key={key}>
            {label}
            <WorkAddressBlock value={workAddress} onChange={setWorkAddress} />
          </div>
        )
      case 'address_visibility':
        return (
          <div key={key}>
            {label}
            <AddressVisibilitySelector value={addressVisibility} onChange={setAddressVisibility} />
          </div>
        )

      // ── Student info ──────────────────────────────────────────────────────
      case 'university':
        return (
          <div key={key}>
            {label}
            <input type="text" value={studentInfo.university ?? ''} onChange={(e) => updateStudentInfo('university', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'major':
        return (
          <div key={key}>
            {label}
            <input type="text" value={studentInfo.major ?? ''} onChange={(e) => updateStudentInfo('major', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'expected_graduation':
        return (
          <div key={key}>
            {label}
            {def.hint && <p className="mb-1 text-xs text-zinc-400 dark:text-zinc-500">{def.hint}</p>}
            <input type="month" value={studentInfo.expected_graduation ?? ''} onChange={(e) => updateStudentInfo('expected_graduation', e.target.value)} className={inputClass} />
          </div>
        )
      case 'campus_org':
        return (
          <div key={key}>
            {label}
            <input type="text" value={studentInfo.campus_org ?? ''} onChange={(e) => updateStudentInfo('campus_org', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )

      // ── Recruiter info ────────────────────────────────────────────────────
      case 'hiring_focus':
        return (
          <div key={key}>
            {label}
            <input type="text" value={recruiterInfo.hiring_focus ?? ''} onChange={(e) => updateRecruiterInfo('hiring_focus', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'scheduling_link':
        return (
          <div key={key}>
            {label}
            <input type="url" value={recruiterInfo.scheduling_link ?? ''} onChange={(e) => updateRecruiterInfo('scheduling_link', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )
      case 'careers_page_url':
        return (
          <div key={key}>
            {label}
            <input type="url" value={recruiterInfo.careers_page_url ?? ''} onChange={(e) => updateRecruiterInfo('careers_page_url', e.target.value)} placeholder={def.placeholder} className={inputClass} />
          </div>
        )

      // ── Pro fields ────────────────────────────────────────────────────────
      case 'logo_url':
        return (
          <div key={key}>
            <label className={labelClass}>
              {def.label}
              <ProBadge />
            </label>
            <LogoUpload value={logoUrl} onChange={setLogoUrl} userId={userId} />
          </div>
        )
      case 'brand_color_primary':
        return (
          <div key={key}>
            <label className={labelClass}>
              {def.label}
              <ProBadge />
            </label>
            <div className="flex items-center gap-3">
              <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-zinc-200 p-0.5 dark:border-zinc-700" />
              <input type="text" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} placeholder="#000000" maxLength={7} className={`${inputClass} font-mono`} />
            </div>
          </div>
        )
      case 'brand_color_accent':
        return (
          <div key={key}>
            <label className={labelClass}>
              {def.label}
              <ProBadge />
            </label>
            <div className="flex items-center gap-3">
              <input type="color" value={brandAccent} onChange={(e) => setBrandAccent(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-zinc-200 p-0.5 dark:border-zinc-700" />
              <input type="text" value={brandAccent} onChange={(e) => setBrandAccent(e.target.value)} placeholder="#ffffff" maxLength={7} className={`${inputClass} font-mono`} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ── Section renderer ───────────────────────────────────────────────────────

  function renderSection(section: EditorSectionDef) {
    return (
      <section key={section.id} className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {section.heading}
          </h2>
          {section.description && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{section.description}</p>
          )}
        </div>
        <div className="space-y-4">
          {section.fields.map((key) => renderField(key))}
        </div>
      </section>
    )
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  function normalizeUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    const socialLinks: SocialLinks = {}
    if (linkedin.trim()) socialLinks.linkedin = normalizeUrl(linkedin)
    if (twitter.trim()) socialLinks.twitter = normalizeUrl(twitter)
    if (instagram.trim()) socialLinks.instagram = normalizeUrl(instagram)
    if (github.trim()) socialLinks.github = normalizeUrl(github)
    if (tiktok.trim()) socialLinks.tiktok = normalizeUrl(tiktok)

    const hasStudentInfo = Object.values(studentInfo).some(Boolean)
    const hasRecruiterInfo = Object.values(recruiterInfo).some(Boolean)

    try {
      const result = await updateProfile({
        username,
        persona,
        full_name: fullName || null,
        title: title || null,
        company: company || null,
        department: department || null,
        bio: bio || null,
        phones,
        email: email || null,
        website: normalizeUrl(website) || null,
        social_links: socialLinks,
        theme: selectedTheme,
        card_layout: cardLayout,
        work_address: workAddress,
        address_visibility: addressVisibility,
        location: location || null,
        logo_url: logoUrl || null,
        brand_color_primary: useCustomColors ? (brandPrimary || null) : null,
        brand_color_accent: useCustomColors ? (brandAccent || null) : null,
        student_info: hasStudentInfo ? studentInfo : null,
        recruiter_info: hasRecruiterInfo ? recruiterInfo : null,
        card_back_fields: cardBackFields,
      })
      setSaveError(result.error)
    } catch {
      // redirect() throws — navigation handled by Next.js, component unmounts
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[400px] space-y-8">
        {activeTab === 'basic' && (
          <>
            <AvatarUpload userId={userId} avatarUrl={profile.avatar_url} fullName={profile.full_name} />
            <p className="text-xs text-zinc-400 dark:text-zinc-500"><span className="text-red-500">*</span> Required</p>

            {/* Persona switcher */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Persona
              </h2>
              <div>
                <label htmlFor="persona" className={labelClass}>
                  Card type
                </label>
                <select
                  id="persona"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value as Persona)}
                  className={`${selectClass} w-full`}
                >
                  {(['professional', 'student', 'recruiter'] as Persona[]).map((p) => (
                    <option key={p} value={p}>
                      {PERSONA_CONFIG[p].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {PERSONA_CONFIG[persona].description}
                </p>
              </div>
            </section>

            {/* Basic Information */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className={labelClass}>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))}
                    required
                    placeholder="your-username"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Your card will be at linkfol.com/{username || 'username'}
                  </p>
                </div>
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="bio" className={labelClass}>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="A short description about yourself..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* Persona-specific non-contact sections */}
            {PERSONA_CONFIG[persona].editorSections
              .filter((s) => s.id !== 'contact' && s.id !== 'address' && s.id !== 'scheduling')
              .map(renderSection)}
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <CardBackPicker
              email={email}
              phones={phones}
              linkedin={linkedin}
              twitter={twitter}
              instagram={instagram}
              github={github}
              tiktok={tiktok}
              website={website}
              location={location}
              value={cardBackFields}
              onChange={setCardBackFields}
            />
            {PERSONA_CONFIG[persona].editorSections
              .filter((s) => s.id === 'contact' || s.id === 'address' || s.id === 'scheduling')
              .map(renderSection)}
          </>
        )}

        {activeTab === 'social' && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Social Links
            </h2>
            <div className="space-y-4">
              {[
                { label: 'LinkedIn',    value: linkedin,  set: setLinkedin,  placeholder: 'linkedin.com/in/username' },
                { label: 'Twitter / X', value: twitter,   set: setTwitter,   placeholder: 'x.com/username' },
                { label: 'Instagram',   value: instagram, set: setInstagram, placeholder: 'instagram.com/username' },
                { label: 'GitHub',      value: github,    set: setGithub,    placeholder: 'github.com/username' },
                { label: 'TikTok',      value: tiktok,    set: setTiktok,    placeholder: 'tiktok.com/@username' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className={labelClass}>{label}</label>
                  <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputClass} />
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'appearance' && (
          <>
            {/* Card Theme */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Card Theme
              </h2>
              <div
                className="flex gap-3 overflow-x-auto pb-2"
                style={{ opacity: userIsPro && useCustomColors ? 0.45 : 1, pointerEvents: userIsPro && useCustomColors ? 'none' : 'auto' }}
              >
                {themes.map((theme) => (
                  <button
                    type="button"
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`flex-shrink-0 overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                      selectedTheme === theme.id
                        ? 'border-zinc-900 dark:border-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}
                    style={{
                      borderRadius: theme.style.borderRadius === '0' ? '0.375rem' : theme.style.borderRadius,
                      width: '80px',
                    }}
                    aria-label={`${theme.name} theme`}
                    aria-pressed={selectedTheme === theme.id}
                  >
                    <div className="flex flex-col items-center px-2 py-3" style={{ background: theme.colors.background }}>
                      <div className="rounded-full" style={{ width: '22px', height: '22px', backgroundColor: theme.colors.avatarInitialBg, boxShadow: `0 0 0 2px ${theme.colors.avatarRing}` }} />
                      <div style={{ height: '3px', backgroundColor: theme.colors.text, width: '80%', borderRadius: '2px', marginTop: '8px', opacity: 0.8 }} />
                      <div style={{ height: '2px', backgroundColor: theme.colors.textSecondary, width: '60%', borderRadius: '2px', marginTop: '4px', opacity: 0.7 }} />
                      <div style={{ height: '14px', backgroundColor: theme.colors.contactBg, width: '90%', borderRadius: theme.style.innerRadius, marginTop: '10px', border: `1px solid ${theme.colors.contactBorder}` }} />
                    </div>
                    <div className="border-t border-zinc-200 bg-white py-1.5 text-center dark:border-zinc-700 dark:bg-zinc-900">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              {userIsPro && useCustomColors && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Theme selection is overridden by your custom brand colors. Turn off &ldquo;Use custom brand colors&rdquo; in Branding to use a theme.
                </p>
              )}
            </section>

            {/* Card Layout */}
            <section className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Card Layout
                  {!userIsPro && <span className="ml-1.5 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pro</span>}
                </h2>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {userIsPro ? 'Choose how your card is structured.' : 'Letterhead is free. Upgrade to unlock all layouts.'}
                </p>
              </div>
              <LayoutSelector
                value={cardLayout}
                onChange={setCardLayout}
                userIsPro={userIsPro}
              />
            </section>

            {/* Branding (Pro-gated) */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {PRO_EDITOR_SECTION.heading}
                {!userIsPro && <ProBadge />}
              </h2>
              {PRO_EDITOR_SECTION.description && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{PRO_EDITOR_SECTION.description}</p>
              )}
              {userIsPro ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
                    <div>
                      <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Use custom brand colors</div>
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Override your theme with custom Primary and Accent colors
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useCustomColors}
                      onClick={() => setUseCustomColors(!useCustomColors)}
                      className="relative ml-4 shrink-0 cursor-pointer rounded-full border-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                      style={{
                        width: 44,
                        height: 24,
                        background: useCustomColors ? '#6366f1' : '#d1d5db',
                      }}
                    >
                      <span
                        className="absolute top-0.5 block rounded-full bg-white shadow transition-all"
                        style={{
                          width: 20,
                          height: 20,
                          left: useCustomColors ? 22 : 2,
                        }}
                      />
                    </button>
                  </div>
                  {renderField('logo_url')}
                  {useCustomColors && (
                    <>
                      {renderField('brand_color_primary')}
                      {renderField('brand_color_accent')}
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Logo and brand colors are available on Pro
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Logo and custom brand colors will be available with Pro.
                      </p>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Pro plans are coming soon — stay tuned!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Sticky save — always visible */}
      <div className="sticky bottom-20 z-30 flex items-center justify-end gap-3 py-3 md:bottom-4">
        {saveError && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{saveError}</p>
        )}
        <button
          type="submit"
          disabled={isSaving || (() => {
            if (!cardBackFields) return false
            const qrOn = cardBackFields.includes('qr')
            return cardBackFields.filter(id => id !== 'qr').length > (qrOn ? 4 : 6)
          })()}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSaving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}

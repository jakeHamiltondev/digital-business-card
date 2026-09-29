import type { Persona, Profile } from './types'

// ── Field keys ────────────────────────────────────────────────────────────────
// Every logical field that any part of the system (onboarding, editor, card,
// vCard) may reference. Components map these to actual profile values via
// getCardFrontValue() or their own lookup tables.

export type FieldKey =
  | 'full_name' | 'email' | 'bio' | 'avatar'
  | 'title' | 'company' | 'department'
  | 'phones' | 'website' | 'location'
  | 'work_address' | 'address_visibility'
  | 'university' | 'major' | 'expected_graduation' | 'campus_org'
  | 'hiring_focus' | 'scheduling_link' | 'careers_page_url'
  | 'logo_url' | 'brand_color_primary' | 'brand_color_accent'

// How a field is rendered — used by editor and onboarding components.
// 'phones' = multi-phone repeater (editor); rendered as a single tel input
// in onboarding context.
export type InputType =
  | 'text' | 'email' | 'tel' | 'url' | 'month' | 'textarea'
  | 'phones'       // multi-phone repeater
  | 'address'      // compound {street1,street2,city,state,zip,country} block
  | 'visibility'   // address_visibility radio (public / vcard_only / hidden)
  | 'color'        // hex color picker
  | 'logo'         // image upload (Pro-gated)
  | 'avatar'       // avatar upload (handled outside field system)

export type FieldDef = {
  label: string
  placeholder: string
  inputType: InputType
  required?: boolean
  hint?: string
}

// ── Field registry ────────────────────────────────────────────────────────────
// Single source of truth for labels, placeholders, and input types.
// Components look up a FieldKey here rather than hard-coding strings.

export const FIELD_DEFS: Record<FieldKey, FieldDef> = {
  full_name:           { label: 'Full Name',           placeholder: 'Jane Smith',                          inputType: 'text',       required: true },
  email:               { label: 'Email',               placeholder: 'jane@example.com',                    inputType: 'email',      required: true },
  bio:                 { label: 'Short bio',           placeholder: 'Tell people a bit about yourself',    inputType: 'textarea' },
  avatar:              { label: 'Photo',               placeholder: '',                                    inputType: 'avatar' },
  title:               { label: 'Job Title',           placeholder: 'Software Engineer',                   inputType: 'text' },
  company:             { label: 'Company',             placeholder: 'Acme Corp',                           inputType: 'text' },
  department:          { label: 'Department',          placeholder: 'Engineering',                         inputType: 'text' },
  phones:              { label: 'Phone(s)',            placeholder: '',                                    inputType: 'phones' },
  website:             { label: 'Website',             placeholder: 'yourwebsite.com',                     inputType: 'text' },
  location:            { label: 'Location',            placeholder: 'Wilmington, NC',                      inputType: 'text',    hint: 'City and state — always shown publicly' },
  work_address:        { label: 'Work Address',        placeholder: '',                                    inputType: 'address' },
  address_visibility:  { label: 'Address Visibility',  placeholder: '',                                    inputType: 'visibility' },
  university:          { label: 'University',          placeholder: 'State University',                    inputType: 'text' },
  major:               { label: 'Major / Program',     placeholder: 'Computer Science',                    inputType: 'text' },
  expected_graduation: { label: 'Expected Graduation', placeholder: '',                                    inputType: 'month',   hint: 'Month and year (e.g. May 2027)' },
  campus_org:          { label: 'Campus Organization', placeholder: 'Entrepreneurship Club',               inputType: 'text' },
  hiring_focus:        { label: 'Hiring Focus',        placeholder: 'Frontend Engineers, Product Managers', inputType: 'text' },
  scheduling_link:     { label: 'Scheduling Link',     placeholder: 'https://calendly.com/you',            inputType: 'url' },
  careers_page_url:    { label: 'Careers Page',        placeholder: 'https://company.com/careers',         inputType: 'url' },
  logo_url:            { label: 'Company Logo',        placeholder: '',                                    inputType: 'logo' },
  brand_color_primary: { label: 'Primary Color',       placeholder: '#000000',                             inputType: 'color' },
  brand_color_accent:  { label: 'Accent Color',        placeholder: '#ffffff',                             inputType: 'color' },
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export type OnboardingFieldConfig = {
  key: FieldKey
  /** Overrides FIELD_DEFS[key].required in onboarding context */
  required?: boolean
}

// ── Editor sections ───────────────────────────────────────────────────────────

export type EditorSectionDef = {
  id: string
  heading: string
  description?: string
  fields: FieldKey[]
}

// Shown for every persona — editor components render these first.
// Note: username, email, social links, and theme are handled separately by the
// editor and are NOT in this list.
export const UNIVERSAL_EDITOR_SECTIONS: EditorSectionDef[] = [
  {
    id: 'basic',
    heading: 'Basic Information',
    fields: ['full_name', 'bio'],
  },
]

// Shown when isPro(profile) is true, regardless of persona.
export const PRO_EDITOR_SECTION: EditorSectionDef = {
  id: 'branding',
  heading: 'Branding',
  description: 'Your logo and brand colors appear on your card.',
  fields: ['logo_url', 'brand_color_primary', 'brand_color_accent'],
}

// ── Card front ────────────────────────────────────────────────────────────────

export type CardFrontFieldKey =
  | 'name'            // profile.full_name
  | 'title'           // profile.title
  | 'company'         // profile.company
  | 'department'      // profile.department
  | 'university'      // profile.student_info?.university
  | 'major'           // profile.student_info?.major
  | 'graduation'      // profile.student_info?.expected_graduation (formatted)
  | 'campus_org'      // profile.student_info?.campus_org
  | 'recruiter_badge' // static "Recruiter" pill
  | 'scheduling_link' // profile.recruiter_info?.scheduling_link
  | 'logo'            // profile.logo_url (Pro-only)

export type CardFrontFieldDef = {
  key: CardFrontFieldKey
  proOnly?: boolean
}

// ── vCard ─────────────────────────────────────────────────────────────────────

export type VCardPersonaConfig = {
  orgSource: 'company' | 'university'
  titleSource: 'title' | 'major'
  includeDepartment: boolean
  includeSchedulingLinkAsUrl: boolean
  includeCareersPageAsUrl: boolean
}

// ── Persona config ────────────────────────────────────────────────────────────

export type PersonaConfig = {
  label: string
  description: string
  /** Persona-specific fields shown on onboarding Step 1 (after name/email/username) */
  onboardingFields: OnboardingFieldConfig[]
  /** Persona-specific editor sections (shown between universal sections and Pro section) */
  editorSections: EditorSectionDef[]
  /** Card front fields in render order */
  cardFront: CardFrontFieldDef[]
  vcard: VCardPersonaConfig
}

export const PERSONA_CONFIG: Record<Persona, PersonaConfig> = {
  professional: {
    label: 'Professional',
    description: 'For anyone who hands out cards at meetings, events, or networking.',
    onboardingFields: [
      { key: 'title', required: true },
      { key: 'company' },
      { key: 'phones' },
    ],
    editorSections: [
      {
        id: 'professional',
        heading: 'Professional Details',
        fields: ['title', 'company', 'department'],
      },
      {
        id: 'contact',
        heading: 'Contact',
        fields: ['phones', 'website', 'location'],
      },
      {
        id: 'address',
        heading: 'Work Address',
        description: 'Control whether your address appears on your card, in contact saves, or nowhere.',
        fields: ['work_address', 'address_visibility'],
      },
    ],
    cardFront: [
      { key: 'name' },
      { key: 'title' },
      { key: 'company' },
      { key: 'department' },
      { key: 'logo', proOnly: true },
    ],
    vcard: {
      orgSource: 'company',
      titleSource: 'title',
      includeDepartment: true,
      includeSchedulingLinkAsUrl: false,
      includeCareersPageAsUrl: false,
    },
  },

  student: {
    label: 'Student',
    description: 'For college students at career fairs and campus events.',
    onboardingFields: [
      { key: 'university', required: true },
      { key: 'major' },
      { key: 'expected_graduation' },
    ],
    editorSections: [
      {
        id: 'academic',
        heading: 'Academic Info',
        fields: ['university', 'major', 'expected_graduation', 'campus_org'],
      },
      {
        id: 'contact',
        heading: 'Contact',
        fields: ['phones', 'website', 'location'],
      },
    ],
    cardFront: [
      { key: 'name' },
      { key: 'university' },
      { key: 'major' },
      { key: 'graduation' },
      { key: 'campus_org' },
    ],
    vcard: {
      orgSource: 'university',
      titleSource: 'major',
      includeDepartment: false,
      includeSchedulingLinkAsUrl: false,
      includeCareersPageAsUrl: false,
    },
  },

  recruiter: {
    label: 'Recruiter',
    description: 'For HR and recruiting teams sourcing talent at in-person events.',
    onboardingFields: [
      { key: 'company', required: true },
      { key: 'department' },
      { key: 'hiring_focus' },
    ],
    editorSections: [
      {
        id: 'recruiting',
        heading: 'Recruiting Info',
        fields: ['company', 'department', 'hiring_focus'],
      },
      {
        id: 'scheduling',
        heading: 'Scheduling',
        fields: ['scheduling_link', 'careers_page_url'],
      },
      {
        id: 'contact',
        heading: 'Contact',
        fields: ['phones', 'website', 'location'],
      },
      {
        id: 'address',
        heading: 'Work Address',
        description: 'Control whether your address appears on your card, in contact saves, or nowhere.',
        fields: ['work_address', 'address_visibility'],
      },
    ],
    cardFront: [
      { key: 'name' },
      { key: 'company' },
      { key: 'department' },
      { key: 'recruiter_badge' },
      { key: 'scheduling_link' },
      { key: 'logo', proOnly: true },
    ],
    vcard: {
      orgSource: 'company',
      titleSource: 'title',
      includeDepartment: true,
      includeSchedulingLinkAsUrl: true,
      includeCareersPageAsUrl: true,
    },
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPersonaConfig(persona: Persona | null | undefined): PersonaConfig {
  return PERSONA_CONFIG[persona ?? 'professional'] ?? PERSONA_CONFIG.professional
}

/**
 * Resolves a CardFrontFieldKey to the display string for the given profile.
 * Returns null if the field has no value (callers should skip rendering it).
 */
export function getCardFrontValue(profile: Profile, key: CardFrontFieldKey): string | null {
  switch (key) {
    case 'name':            return profile.full_name
    case 'title':           return profile.title
    case 'company':         return profile.company
    case 'department':      return profile.department
    case 'university':      return profile.student_info?.university ?? null
    case 'major':           return profile.student_info?.major ?? null
    case 'graduation':      return formatGraduation(profile.student_info?.expected_graduation)
    case 'campus_org':      return profile.student_info?.campus_org ?? null
    case 'recruiter_badge': return 'Recruiter'
    case 'scheduling_link': return profile.recruiter_info?.scheduling_link ?? null
    case 'logo':            return profile.logo_url
  }
}

function formatGraduation(raw: string | null | undefined): string | null {
  if (!raw) return null
  const [year, month] = raw.split('-')
  if (!year || !month) return raw
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[parseInt(month, 10) - 1] ?? month} ${year}`
}

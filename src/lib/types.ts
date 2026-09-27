export type SocialLinks = {
  linkedin?: string
  twitter?: string
  instagram?: string
  github?: string
  tiktok?: string
}

export type Persona = 'professional' | 'student' | 'recruiter'

export type AddressVisibility = 'public' | 'vcard_only' | 'hidden'

export type PhoneType = 'mobile' | 'office' | 'fax'

export type PhoneEntry = {
  type: PhoneType
  number: string
}

export type WorkAddress = {
  street1?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type StudentInfo = {
  university?: string
  major?: string
  expected_graduation?: string  // "YYYY-MM"
  campus_org?: string
}

export type RecruiterInfo = {
  hiring_focus?: string
  scheduling_link?: string
  careers_page_url?: string
}

export type Profile = {
  id: string
  username: string
  full_name: string | null
  title: string | null
  company: string | null
  bio: string | null
  avatar_url: string | null
  // Legacy single-phone field — read-only after migration; use phones[] for writes
  phone: string | null
  email: string | null
  website: string | null
  social_links: SocialLinks
  theme: string | null
  plan: string | null
  stripe_customer_id: string | null
  subscription_id: string | null
  subscription_end_date: string | null
  referred_by: string | null
  created_at: string
  updated_at: string
  // Persona
  persona: Persona
  // Professional fields
  department: string | null
  phones: PhoneEntry[]
  work_address: WorkAddress | null
  address_visibility: AddressVisibility
  location: string | null
  // Pro-only
  logo_url: string | null
  brand_color_primary: string | null
  brand_color_accent: string | null
  // Persona-specific
  student_info: StudentInfo | null
  recruiter_info: RecruiterInfo | null
}

export type ResumeEntryType = 'experience' | 'education' | 'skill' | 'project' | 'certification'

export type ResumeEntry = {
  id: string
  user_id: string
  type: ResumeEntryType
  title: string
  organization: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  skills_list: string[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type SavedCard = {
  id: string
  user_id: string
  saved_profile_id: string
  is_favorite: boolean
  tags: string[]
  notes: string | null
  saved_at: string
}

export type SavedCardWithProfile = SavedCard & {
  profile: Profile
}

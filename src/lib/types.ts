export type SocialLinks = {
  linkedin?: string
  twitter?: string
  instagram?: string
  github?: string
}

export type Profile = {
  id: string
  username: string
  full_name: string | null
  title: string | null
  company: string | null
  bio: string | null
  avatar_url: string | null
  phone: string | null
  email: string | null
  website: string | null
  social_links: SocialLinks
  theme: string | null
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

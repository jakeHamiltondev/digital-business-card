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
  created_at: string
  updated_at: string
}

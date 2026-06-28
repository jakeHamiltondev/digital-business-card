import type { Profile } from './types'

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

export function generateVCard(profile: Profile): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  if (profile.full_name) {
    lines.push(`FN:${escapeValue(profile.full_name)}`)
    const parts = profile.full_name.trim().split(/\s+/)
    const given = parts[0] ?? ''
    const family = parts.slice(1).join(' ')
    lines.push(`N:${escapeValue(family)};${escapeValue(given)};;;`)
  }

  if (profile.title) lines.push(`TITLE:${escapeValue(profile.title)}`)
  if (profile.company) lines.push(`ORG:${escapeValue(profile.company)}`)
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`)
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`)
  if (profile.website) lines.push(`URL:${profile.website}`)
  if (profile.bio) lines.push(`NOTE:${escapeValue(profile.bio)}`)

  const social = profile.social_links ?? {}
  if (social.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${social.linkedin}`)
  if (social.twitter) lines.push(`X-SOCIALPROFILE;TYPE=twitter:${social.twitter}`)
  if (social.instagram) lines.push(`X-SOCIALPROFILE;TYPE=instagram:${social.instagram}`)
  if (social.github) lines.push(`X-SOCIALPROFILE;TYPE=github:${social.github}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

import type { Profile } from './types'

function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

// vCard spec: lines over 75 octets must be folded with CRLF + space
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = [line.slice(0, 75)]
  let i = 75
  while (i < line.length) {
    chunks.push(' ' + line.slice(i, i + 74))
    i += 74
  }
  return chunks.join('\r\n')
}

function toFullUrl(value: string, prefix: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${prefix}${value}`
}

export function generateVCard(profile: Profile, avatarBase64?: string): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  if (profile.full_name) {
    const trimmed = profile.full_name.trim()
    lines.push(`FN:${escapeValue(trimmed)}`)
    // split on last space so multi-word first names stay together
    const lastSpace = trimmed.lastIndexOf(' ')
    const given = lastSpace === -1 ? trimmed : trimmed.slice(0, lastSpace)
    const family = lastSpace === -1 ? '' : trimmed.slice(lastSpace + 1)
    lines.push(`N:${escapeValue(family)};${escapeValue(given)};;;`)
  }

  if (profile.title) lines.push(`TITLE:${escapeValue(profile.title)}`)
  if (profile.company) lines.push(`ORG:${escapeValue(profile.company)}`)
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`)
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`)
  if (profile.website) lines.push(`URL:${profile.website}`)
  if (profile.bio) lines.push(`NOTE:${escapeValue(profile.bio)}`)

  if (avatarBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${avatarBase64}`)
  }

  const social = profile.social_links ?? {}
  const socialDefs = [
    { key: 'linkedin' as const, label: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
    { key: 'twitter' as const, label: 'Twitter', prefix: 'https://x.com/' },
    { key: 'instagram' as const, label: 'Instagram', prefix: 'https://instagram.com/' },
    { key: 'github' as const, label: 'GitHub', prefix: 'https://github.com/' },
  ]
  let itemIndex = 1
  for (const { key, label, prefix } of socialDefs) {
    const val = social[key]
    if (!val) continue
    const url = toFullUrl(val, prefix)
    lines.push(`item${itemIndex}.URL:${url}`)
    lines.push(`item${itemIndex}.X-ABLabel:${label}`)
    itemIndex++
  }

  lines.push('END:VCARD')
  return lines.map(foldLine).join('\r\n')
}

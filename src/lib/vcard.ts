import type { Profile } from './types'
import { getPersonaConfig } from './persona-config'

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

const PHONE_TYPE_MAP: Record<string, string> = {
  mobile: 'CELL',
  office: 'WORK',
  fax:    'FAX',
}

export function generateVCard(profile: Profile, avatarBase64?: string): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  if (profile.full_name) {
    const trimmed = profile.full_name.trim()
    // FN and N use raw values — iOS rejects vCard escape sequences in name fields
    lines.push(`FN:${trimmed}`)
    const lastSpace = trimmed.lastIndexOf(' ')
    const given = lastSpace === -1 ? trimmed : trimmed.slice(0, lastSpace)
    const family = lastSpace === -1 ? '' : trimmed.slice(lastSpace + 1)
    lines.push(`N:${family};${given};;;`)
  }

  // ── Persona-driven ORG + TITLE ──────────────────────────────────────────────
  const vcardCfg = getPersonaConfig(profile.persona).vcard

  const orgValue =
    vcardCfg.orgSource === 'university'
      ? (profile.student_info?.university ?? null)
      : (profile.company ?? null)

  const titleValue =
    vcardCfg.titleSource === 'major'
      ? (profile.student_info?.major ?? null)
      : (profile.title ?? null)

  if (titleValue) lines.push(`TITLE:${escapeValue(titleValue)}`)

  if (orgValue) {
    const dept = vcardCfg.includeDepartment && profile.department ? profile.department : null
    lines.push(
      dept
        ? `ORG:${escapeValue(orgValue)};${escapeValue(dept)}`
        : `ORG:${escapeValue(orgValue)}`
    )
  }

  // ── Contact ─────────────────────────────────────────────────────────────────
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`)

  // Prefer phones[]; fall back to legacy phone column for pre-migration users
  const phones =
    (profile.phones?.length ?? 0) > 0
      ? (profile.phones ?? [])
      : profile.phone
        ? [{ type: 'mobile' as const, number: profile.phone }]
        : []

  for (const { type, number } of phones) {
    const telType = PHONE_TYPE_MAP[type] ?? 'CELL'
    lines.push(`TEL;TYPE=${telType}:${number}`)
  }

  if (profile.website) lines.push(`URL:${profile.website}`)
  if (profile.bio) lines.push(`NOTE:${escapeValue(profile.bio)}`)

  // ── Address ─────────────────────────────────────────────────────────────────
  // Omit entirely if visibility is 'hidden'; include for 'public' and 'vcard_only'
  if (profile.address_visibility !== 'hidden' && profile.work_address) {
    const a = profile.work_address
    const street = [a.street1, a.street2].filter(Boolean).join(' ')
    if (street || a.city || a.state || a.zip || a.country) {
      // ADR;TYPE=WORK:po-box;extended;street;locality;region;postal-code;country
      lines.push(
        `ADR;TYPE=WORK:;;${escapeValue(street)};${escapeValue(a.city ?? '')};${escapeValue(a.state ?? '')};${escapeValue(a.zip ?? '')};${escapeValue(a.country ?? '')}`
      )
    }
  }

  // ── Avatar ───────────────────────────────────────────────────────────────────
  if (avatarBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${avatarBase64}`)
  }

  // ── Social + persona URLs ────────────────────────────────────────────────────
  const social = profile.social_links ?? {}
  const socialDefs = [
    { key: 'linkedin'  as const, label: 'LinkedIn',  prefix: 'https://linkedin.com/in/' },
    { key: 'twitter'   as const, label: 'Twitter',   prefix: 'https://x.com/' },
    { key: 'instagram' as const, label: 'Instagram', prefix: 'https://instagram.com/' },
    { key: 'github'    as const, label: 'GitHub',    prefix: 'https://github.com/' },
    { key: 'tiktok'    as const, label: 'TikTok',    prefix: 'https://tiktok.com/@' },
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

  // Recruiter-specific URLs
  if (vcardCfg.includeSchedulingLinkAsUrl && profile.recruiter_info?.scheduling_link) {
    lines.push(`item${itemIndex}.URL:${profile.recruiter_info.scheduling_link}`)
    lines.push(`item${itemIndex}.X-ABLabel:Schedule a Call`)
    itemIndex++
  }

  if (vcardCfg.includeCareersPageAsUrl && profile.recruiter_info?.careers_page_url) {
    lines.push(`item${itemIndex}.URL:${profile.recruiter_info.careers_page_url}`)
    lines.push(`item${itemIndex}.X-ABLabel:Careers Page`)
    itemIndex++
  }

  lines.push('END:VCARD')
  // trailing CRLF required by vCard spec
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

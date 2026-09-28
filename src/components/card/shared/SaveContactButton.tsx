'use client'

import type { Profile } from '@/lib/types'
import { generateVCard } from '@/lib/vcard'

export default function SaveContactButton({
  profile,
  bg,
  textColor,
  label = 'Save Contact',
  icon,
}: {
  profile: Profile
  bg: string
  textColor: string
  label?: string
  icon?: React.ReactNode
}) {
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    const vcf = generateVCard(profile)
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(profile.full_name ?? profile.username).replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleSave}
      className="w-full rounded-xl py-3 text-sm font-extrabold transition hover:brightness-110 active:scale-[0.98]"
      style={{ background: bg, color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
    >
      {icon}
      {label}
    </button>
  )
}

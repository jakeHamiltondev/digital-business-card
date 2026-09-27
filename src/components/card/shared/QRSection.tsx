'use client'

import QRCodeMini from '@/components/QRCodeMini'
import type { Theme } from '@/lib/themes'

export default function QRSection({
  url,
  label,
  t,
}: {
  url: string
  label?: string
  t: Theme
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeMini url={url} />
      {label && (
        <p className="text-xs" style={{ color: t.colors.mutedText }}>
          {label}
        </p>
      )}
    </div>
  )
}

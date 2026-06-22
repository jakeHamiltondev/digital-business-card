'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeMini({ url }: { url: string }) {
  return (
    <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-zinc-200">
      <QRCodeSVG value={url} size={72} marginSize={1} />
    </div>
  )
}

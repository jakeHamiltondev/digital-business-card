'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QRDisplay({ url }: { url: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-2xl">
      <QRCodeSVG value={url} size={280} marginSize={2} />
    </div>
  )
}

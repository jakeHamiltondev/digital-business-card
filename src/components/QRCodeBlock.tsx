import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeBlock({ url, qrUrl }: { url: string; qrUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700">
        <QRCodeSVG value={qrUrl ?? url} size={160} marginSize={1} />
      </div>
      <p className="max-w-xs truncate text-xs text-zinc-500 dark:text-zinc-400">{url}</p>
    </div>
  )
}

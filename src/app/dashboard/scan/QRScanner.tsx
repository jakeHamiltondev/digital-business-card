'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Camera, ScanLine } from 'lucide-react'

type ScanResult =
  | { type: 'linkfol'; path: string }
  | { type: 'url'; url: string }
  | { type: 'text'; text: string }

function classifyResult(text: string): ScanResult {
  try {
    const url = new URL(text)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'linkfol.com') {
      return { type: 'linkfol', path: url.pathname }
    }
    return { type: 'url', url: text }
  } catch {
    return { type: 'text', text }
  }
}

export default function QRScanner() {
  const router = useRouter()
  const scannerRef = useRef<InstanceType<
    typeof import('html5-qrcode').Html5Qrcode
  > | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'denied' | 'no-camera' | 'error'>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const stoppedRef = useRef(false)

  async function startScanner() {
    setStatus('starting')
    setResult(null)
    stoppedRef.current = false

    const { Html5Qrcode } = await import('html5-qrcode')

    let devices: { id: string; label: string }[] = []
    try {
      devices = await Html5Qrcode.getCameras()
    } catch {
      setStatus('denied')
      return
    }

    if (!devices.length) {
      setStatus('no-camera')
      return
    }

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    const backCamera = devices.find((d) =>
      /back|rear|environment/i.test(d.label)
    )
    const cameraId = backCamera?.id ?? devices[devices.length - 1].id

    try {
      await scanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (stoppedRef.current) return
          stoppedRef.current = true
          scanner.stop().catch(() => {})
          setResult(classifyResult(decodedText))
          setStatus('idle')
        },
        () => {},
      )
      setStatus('scanning')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (/permission|denied|NotAllowed/i.test(msg)) {
        setStatus('denied')
      } else {
        setStatus('error')
      }
    }
  }

  async function stopScanner() {
    stoppedRef.current = true
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        // State 2 = SCANNING, state 3 = PAUSED
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
      } catch {
        // ignore
      }
      scannerRef.current = null
    }
  }

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScanAgain() {
    setResult(null)
    startScanner()
  }

  function handleLinkfolNavigate(path: string) {
    stopScanner()
    router.push(path)
  }

  return (
    <>
      <Link
        href="/dashboard"
        onClick={() => stopScanner()}
        className="absolute left-4 top-4 flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Camera viewfinder */}
      <div className="flex flex-col items-center gap-6">
        {!result && (
          <div className="relative">
            <div
              ref={containerRef}
              id="qr-reader"
              className="h-72 w-72 overflow-hidden rounded-2xl bg-zinc-900"
            />
            {/* Scan region overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                {/* Corner brackets */}
                <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-white/80 rounded-tl-sm" />
                <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-white/80 rounded-tr-sm" />
                <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-white/80 rounded-bl-sm" />
                <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-white/80 rounded-br-sm" />
                {status === 'scanning' && (
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-white/60" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status messages */}
        {status === 'starting' && !result && (
          <p className="text-sm text-zinc-400">Starting camera…</p>
        )}

        {status === 'scanning' && !result && (
          <p className="flex items-center gap-2 text-sm text-zinc-300">
            <ScanLine className="h-4 w-4" />
            Point your camera at a QR code
          </p>
        )}

        {status === 'denied' && (
          <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Camera className="h-10 w-10 text-zinc-500" />
            <p className="text-sm text-zinc-300">
              Camera access was denied. Please enable camera permissions in
              your browser settings, then reload the page.
            </p>
          </div>
        )}

        {status === 'no-camera' && (
          <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <Camera className="h-10 w-10 text-zinc-500" />
            <p className="text-sm text-zinc-300">No camera detected on this device.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mx-auto flex max-w-xs flex-col items-center gap-4 text-center">
            <p className="text-sm text-zinc-300">
              Could not start the camera. Please try again.
            </p>
            <button
              onClick={handleScanAgain}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result card */}
        {result && (
          <div className="mx-auto w-full max-w-xs rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
            {result.type === 'linkfol' && (
              <>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Linkfol card detected
                </p>
                <p className="mb-4 truncate text-sm text-zinc-200">
                  linkfol.com{result.path}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLinkfolNavigate(result.path)}
                    className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                  >
                    View card
                  </button>
                  <button
                    onClick={handleScanAgain}
                    className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                  >
                    Scan again
                  </button>
                </div>
              </>
            )}

            {result.type === 'url' && (
              <>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  URL detected
                </p>
                <p className="mb-4 break-all text-sm text-zinc-200">{result.url}</p>
                <div className="flex gap-2">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open link
                  </a>
                  <button
                    onClick={handleScanAgain}
                    className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                  >
                    Scan again
                  </button>
                </div>
              </>
            )}

            {result.type === 'text' && (
              <>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Text detected
                </p>
                <p className="mb-4 break-all text-sm text-zinc-200">{result.text}</p>
                <button
                  onClick={handleScanAgain}
                  className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                >
                  Scan again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

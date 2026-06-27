'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'
import { updateAvatarUrl } from '@/app/dashboard/actions'

const OUTPUT_SIZE = 400

async function cropToBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const img = new Image()
  img.src = imageSrc
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.9,
    )
  })
}

export default function AvatarCropper({
  imageSrc,
  userId,
  onClose,
  onSuccess,
}: {
  imageSrc: string
  userId: string
  onClose: () => void
  onSuccess: (publicUrl: string) => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleSave() {
    if (!croppedAreaPixels) return
    setIsSaving(true)
    setError(null)

    try {
      const blob = await cropToBlob(imageSrc, croppedAreaPixels)
      const supabase = createClient()
      const path = `${userId}/avatar.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      const result = await updateAvatarUrl(publicUrl)
      if (result.error) throw new Error(result.error)

      onSuccess(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Crop photo</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Drag to reposition · scroll to zoom
          </p>
        </div>

        <div className="relative mx-6 mt-4 h-72 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{}}
            classes={{}}
          />
        </div>

        <div className="px-6 pt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-zinc-900 dark:accent-zinc-50"
          />
        </div>

        {error && (
          <p className="px-6 pt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

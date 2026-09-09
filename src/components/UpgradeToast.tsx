'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function UpgradeToast({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(show)
  const router = useRouter()

  useEffect(() => {
    if (show) {
      router.replace('/dashboard', { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-800 dark:bg-green-950">
      <p className="text-sm font-medium text-green-800 dark:text-green-200">
        Welcome to Linkfol Pro! Your upgrade is now active.
      </p>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="ml-4 shrink-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

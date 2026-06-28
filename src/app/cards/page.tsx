import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSavedCards } from '@/app/actions/saved-cards'
import CardsClient from './CardsClient'

export const metadata: Metadata = {
  title: 'My Cards | Linkfol',
}

export default async function CardsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const savedCards = await getSavedCards()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Cards
        </h2>
        <CardsClient initialCards={savedCards} />
      </main>
    </div>
  )
}

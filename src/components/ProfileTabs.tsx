'use client'

import { User, Phone, Share2, Palette, CreditCard } from 'lucide-react'

const tabs = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'social', label: 'Social Links', icon: Share2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'cardback', label: 'Card Back', icon: CreditCard },
] as const

export type TabId = (typeof tabs)[number]['id']

interface ProfileTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export type Theme = {
  id: string
  name: string
  colors: {
    background: string
    cardBg: string
    text: string
    textSecondary: string
    accent: string
    border: string
    contactBg: string
    contactBorder: string
    contactText: string
    iconColor: string
    mutedText: string
    bioText: string
    avatarRing: string
    avatarInitialBg: string
    avatarInitialText: string
  }
  style: {
    borderRadius: string
    innerRadius: string
    shadow: string
    fontWeight: string
  }
}

export const themes: Theme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      background: '#18181b',
      cardBg: '#18181b',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      accent: '#fafafa',
      border: '#27272a',
      contactBg: 'rgba(39,39,42,0.5)',
      contactBorder: '#27272a',
      contactText: '#d4d4d8',
      iconColor: '#a1a1aa',
      mutedText: '#71717a',
      bioText: '#d4d4d8',
      avatarRing: '#18181b',
      avatarInitialBg: '#fafafa',
      avatarInitialText: '#18181b',
    },
    style: {
      borderRadius: '1rem',
      innerRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgba(0,0,0,0.4)',
      fontWeight: '700',
    },
  },
  {
    id: 'clean',
    name: 'Clean',
    colors: {
      background: '#ffffff',
      cardBg: '#ffffff',
      text: '#18181b',
      textSecondary: '#71717a',
      accent: '#18181b',
      border: '#e4e4e7',
      contactBg: '#f4f4f5',
      contactBorder: '#e4e4e7',
      contactText: '#3f3f46',
      iconColor: '#71717a',
      mutedText: '#a1a1aa',
      bioText: '#52525b',
      avatarRing: '#e4e4e7',
      avatarInitialBg: '#18181b',
      avatarInitialText: '#ffffff',
    },
    style: {
      borderRadius: '0',
      innerRadius: '0',
      shadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      fontWeight: '700',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0e4c6e 100%)',
      cardBg: 'linear-gradient(135deg, #1e3a5f 0%, #0e4c6e 100%)',
      text: '#f0f9ff',
      textSecondary: '#7dd3fc',
      accent: '#38bdf8',
      border: '#0369a1',
      contactBg: 'rgba(3,105,161,0.25)',
      contactBorder: '#0284c7',
      contactText: '#e0f2fe',
      iconColor: '#7dd3fc',
      mutedText: '#38bdf8',
      bioText: '#bae6fd',
      avatarRing: '#1e3a5f',
      avatarInitialBg: '#f0f9ff',
      avatarInitialText: '#1e3a5f',
    },
    style: {
      borderRadius: '0.75rem',
      innerRadius: '0.375rem',
      shadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
      fontWeight: '700',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#1c2b1c',
      cardBg: '#1c2b1c',
      text: '#f0ede0',
      textSecondary: '#9db896',
      accent: '#5a9e3c',
      border: '#2d4a2d',
      contactBg: 'rgba(45,74,45,0.45)',
      contactBorder: '#3d5f3d',
      contactText: '#d5e8c8',
      iconColor: '#9db896',
      mutedText: '#6e9670',
      bioText: '#b8d4a8',
      avatarRing: '#1c2b1c',
      avatarInitialBg: '#f0ede0',
      avatarInitialText: '#1c2b1c',
    },
    style: {
      borderRadius: '0.75rem',
      innerRadius: '0.375rem',
      shadow: '0 4px 20px rgba(0,0,0,0.4)',
      fontWeight: '700',
    },
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      background: '#334155',
      cardBg: '#334155',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#e2e8f0',
      border: '#475569',
      contactBg: '#1e293b',
      contactBorder: '#475569',
      contactText: '#cbd5e1',
      iconColor: '#94a3b8',
      mutedText: '#64748b',
      bioText: '#cbd5e1',
      avatarRing: '#334155',
      avatarInitialBg: '#f8fafc',
      avatarInitialText: '#334155',
    },
    style: {
      borderRadius: '0',
      innerRadius: '0',
      shadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.4)',
      fontWeight: '700',
    },
  },
]

export const themeMap = Object.fromEntries(themes.map((t) => [t.id, t])) as Record<string, Theme>

export function getTheme(id: string | null | undefined): Theme {
  return themeMap[id ?? 'midnight'] ?? themeMap['midnight']
}

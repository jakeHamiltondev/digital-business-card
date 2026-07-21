const sizes = {
  sm: { icon: 22, text: 'text-lg' },
  lg: { icon: 36, text: 'text-3xl' },
}

export default function LinkfolLogo({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const { icon: iconSz, text: textClass } = sizes[size]

  return (
    <span className="flex items-center gap-2">
      <svg
        width={iconSz}
        height={iconSz}
        viewBox="3 2 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 4L8 8C5.8 10.2 5.8 13.8 8 16L10 18"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M18 24L22 20C24.2 17.8 24.2 14.2 22 12L20 10"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="13"
          y1="15"
          x2="17"
          y2="11"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${textClass}`}>
        Linkfol
      </span>
    </span>
  )
}

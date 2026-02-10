'use client'

export default function EmptyState({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
}: {
  icon: string
  title: string
  description?: string
  buttonText: string
  onButtonClick: () => void
}) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-white/60 mb-6 max-w-md mx-auto">{description}</p>}
      <button onClick={onButtonClick} className="glass-button px-6 py-3">
        {buttonText}
      </button>
    </div>
  )
}

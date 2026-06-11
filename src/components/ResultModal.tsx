import { useEffect, useState } from 'react'
import type { Challenge, WinStats } from '../types'

interface Props {
  challenge: Challenge
  stats: WinStats
  stars: number
  xpGained: number
  hasNext: boolean
  share?: string
  onRetry: () => void
  onNext: () => void
}

export default function ResultModal({ challenge, stats, stars, xpGained, hasNext, share, onRetry, onNext }: Props) {
  const [copied, setCopied] = useState(false)

  const copyShare = () => {
    if (!share) return
    navigator.clipboard.writeText(share).then(() => setCopied(true))
  }

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        e.preventDefault()
        e.stopPropagation()
        onRetry()
      } else if ((e.key === 'n' || e.key === 'Enter') && hasNext) {
        e.preventDefault()
        e.stopPropagation()
        onNext()
      } else if (e.key === 'c' && share) {
        e.preventDefault()
        e.stopPropagation()
        copyShare()
      }
    }
    window.addEventListener('keydown', onKeydown, true)
    return () => window.removeEventListener('keydown', onKeydown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNext, onRetry, onNext, share])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl tracking-widest">
            <span className="text-amber-400">{'★'.repeat(stars)}</span>
            <span className="text-zinc-700">{'★'.repeat(3 - stars)}</span>
          </div>
          <h2 className="text-xl font-bold mt-1">Cleared!</h2>
          {xpGained > 0 && <p className="text-emerald-400 text-sm mt-0.5">+{xpGained} XP</p>}
        </div>

        <div className="grid grid-cols-3 text-center text-sm rounded-lg bg-zinc-950 py-3">
          <div>
            <p className="text-zinc-500 text-xs uppercase">Keys</p>
            <p className="font-mono text-lg">{stats.keys}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase">Par</p>
            <p className="font-mono text-lg">{challenge.par}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase">Time</p>
            <p className="font-mono text-lg">{stats.seconds.toFixed(1)}s</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Your keys</p>
          <p className="font-mono text-sm break-all bg-zinc-950 rounded p-2">{stats.keystrokes.join(' ')}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
            Pro solution ({challenge.solution.length} keys)
          </p>
          {challenge.solutionSteps ? (
            <div className="bg-zinc-950 rounded p-2 space-y-1.5">
              {challenge.solutionSteps.map((step, i) => (
                <div key={i} className="flex items-baseline gap-3">
                  <code className="font-mono text-sm text-emerald-300 whitespace-nowrap min-w-16">
                    {step.keys}
                  </code>
                  <span className="text-xs text-zinc-400">{step.explain}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-sm break-all bg-zinc-950 rounded p-2 text-emerald-300">
              {challenge.solution.join(' ')}
            </p>
          )}
        </div>

        {share && (
          <div className="rounded-lg border border-sky-900/60 bg-sky-950/20 p-2 space-y-1.5">
            <pre className="text-xs font-mono text-sky-200 whitespace-pre-wrap">{share}</pre>
            <button
              onClick={copyShare}
              className="text-xs px-2.5 py-1 rounded border border-sky-700 text-sky-300 hover:bg-sky-900/40"
            >
              {copied ? '✓ copied!' : 'Copy result'} <kbd className="text-sky-600">c</kbd>
            </button>
          </div>
        )}

        <div className="flex gap-2 justify-end items-center pt-1">
          <span className="mr-auto text-xs font-mono text-zinc-600">r retry{hasNext ? ' · n next' : ''}{share ? ' · c copy' : ''}</span>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-sm hover:bg-zinc-800"
          >
            Retry <kbd className="text-zinc-500">r</kbd>
          </button>
          {hasNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold hover:bg-emerald-500"
            >
              Next <kbd className="opacity-60">n</kbd>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

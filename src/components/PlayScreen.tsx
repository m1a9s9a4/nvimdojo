import { useEffect, useState } from 'react'
import type { Challenge, WinStats } from '../types'
import VimEditor from '../editor/VimEditor'
import { exActions } from '../engine/exBus'
import HintPanel from './HintPanel'
import ResultModal from './ResultModal'

interface Result {
  stats: WinStats
  stars: number
  xpGained: number
  share?: string
}

interface Props {
  challenge: Challenge
  hasNext: boolean
  hintsOn: boolean
  onToggleHints: () => void
  onBack: () => void
  onNext: () => void
  onCleared: (challenge: Challenge, stats: WinStats) => { stars: number; xpGained: number; share?: string }
}

const MODE_STYLE: Record<string, string> = {
  normal: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  insert: 'bg-sky-900/60 text-sky-300 border-sky-700',
  visual: 'bg-purple-900/60 text-purple-300 border-purple-700',
}

export default function PlayScreen({
  challenge,
  hasNext,
  hintsOn,
  onToggleHints,
  onBack,
  onNext,
  onCleared,
}: Props) {
  const [keys, setKeys] = useState<string[]>([])
  const [mode, setMode] = useState('normal')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)

  const reset = () => {
    setKeys([])
    setMode('normal')
    setResult(null)
    setAttempt((a) => a + 1)
  }

  const handleWin = (stats: WinStats) => {
    const { stars, xpGained, share } = onCleared(challenge, stats)
    setResult({ stats, stars, xpGained, share })
  }

  // wire vim ex commands (:h :r :n :q) to UI actions; refresh every render to avoid stale closures
  useEffect(() => {
    exActions.current = {
      toggleHints: onToggleHints,
      reset,
      next: () => {
        if (hasNext) onNext()
      },
      quit: onBack,
    }
  })
  useEffect(() => {
    return () => {
      exActions.current = null
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Levels
        </button>
        <h2 className="text-base font-bold">
          {challenge.type === 'world' ? '🌍' : '⛳'} {challenge.title}
        </h2>
        <span className="text-xs text-zinc-500">stage {challenge.stage}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onToggleHints}
            className={`text-xs px-2.5 py-1 rounded-full border ${
              hintsOn ? 'border-amber-500 text-amber-300' : 'border-zinc-700 text-zinc-500'
            }`}
          >
            💡 hints {hintsOn ? 'on' : 'off'}
          </button>
          <button
            onClick={reset}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            ↺ reset
          </button>
        </div>
      </div>

      {challenge.scene && (
        <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 px-3 py-2">
          <p className="text-xs uppercase tracking-widest font-semibold text-amber-500">
            🗺 {challenge.scene.place}
          </p>
          <p className="text-xs text-zinc-500 italic mt-0.5">{challenge.scene.flavor}</p>
        </div>
      )}

      <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200">
        {challenge.type === 'world' ? '📜 ' : ''}
        {challenge.mission}
      </p>

      <div className="flex items-center gap-4 text-xs font-mono">
        <span className={`px-2 py-0.5 rounded border uppercase ${MODE_STYLE[mode] ?? MODE_STYLE.normal}`}>
          {mode}
        </span>
        <span className="text-zinc-400">
          keys <span className={keys.length > challenge.par ? 'text-rose-400' : 'text-zinc-100'}>{keys.length}</span>
          <span className="text-zinc-600"> / par {challenge.par}</span>
        </span>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 rounded-lg overflow-hidden border border-zinc-800">
          {challenge.filename && (
            <div className="flex items-center gap-2 bg-zinc-900 border-b border-zinc-800 px-3 py-1.5">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </span>
              <span className="font-mono text-xs text-zinc-400 ml-2">{challenge.filename}</span>
            </div>
          )}
          <VimEditor
            challenge={challenge}
            attempt={attempt}
            onKey={(t) => setKeys((k) => [...k, t])}
            onWin={handleWin}
            onMode={setMode}
          />
        </div>
        {hintsOn && <HintPanel challenge={challenge} />}
      </div>

      <div className="min-h-8 rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 font-mono text-sm text-zinc-300 break-all">
        {keys.length > 0 ? keys.join(' ') : <span className="text-zinc-600">your keystrokes appear here…</span>}
      </div>

      <p className="text-xs font-mono text-zinc-600">
        :h hints · :r reset · :n skip · :q levels <span className="text-zinc-700">(command-line keys don't count)</span>
      </p>

      {result && (
        <ResultModal
          challenge={challenge}
          stats={result.stats}
          stars={result.stars}
          xpGained={result.xpGained}
          hasNext={hasNext}
          share={result.share}
          onRetry={reset}
          onNext={onNext}
          onLevels={onBack}
        />
      )}
    </div>
  )
}

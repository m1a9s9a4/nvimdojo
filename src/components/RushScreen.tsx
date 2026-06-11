import { useEffect, useMemo, useRef, useState } from 'react'
import { rushTaskToChallenge, type Rush } from '../data/rushes'
import VimEditor from '../editor/VimEditor'
import { exActions } from '../engine/exBus'
import type { RushProgress } from '../engine/storage'

interface RushResult {
  seconds: number
  keys: number
  stars: number
  xpGained: number
}

interface Props {
  rush: Rush
  best?: RushProgress
  onFinish: (seconds: number, keys: number) => { stars: number; xpGained: number }
  onBack: () => void
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds - m * 60
  return m > 0 ? `${m}:${s.toFixed(1).padStart(4, '0')}` : `${s.toFixed(1)}s`
}

export default function RushScreen({ rush, best, onFinish, onBack }: Props) {
  const [idx, setIdx] = useState(0)
  const [run, setRun] = useState(0)
  const [keys, setKeys] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<RushResult | null>(null)
  const startRef = useRef<number | null>(null)
  const keysRef = useRef(0)

  const challenge = useMemo(() => rushTaskToChallenge(rush, idx), [rush, idx])
  const nextTask = rush.tasks[idx + 1]

  const restart = () => {
    startRef.current = null
    keysRef.current = 0
    setIdx(0)
    setKeys(0)
    setElapsed(0)
    setResult(null)
    setRun((r) => r + 1)
  }

  useEffect(() => {
    exActions.current = {
      toggleHints: () => {},
      reset: restart,
      next: () => {},
      quit: onBack,
    }
  })
  useEffect(() => {
    return () => {
      exActions.current = null
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      if (startRef.current !== null && !result) {
        setElapsed((performance.now() - startRef.current) / 1000)
      }
    }, 100)
    return () => clearInterval(t)
  }, [result])

  useEffect(() => {
    if (!result) return
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        e.preventDefault()
        e.stopPropagation()
        restart()
      } else if (e.key === 'q' || e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        onBack()
      }
    }
    window.addEventListener('keydown', onKeydown, true)
    return () => window.removeEventListener('keydown', onKeydown, true)
  }, [result, onBack])

  const handleKey = () => {
    if (startRef.current === null) startRef.current = performance.now()
    keysRef.current += 1
    setKeys(keysRef.current)
  }

  const handleWin = () => {
    if (idx + 1 < rush.tasks.length) {
      setIdx((i) => i + 1)
    } else {
      const seconds = startRef.current ? (performance.now() - startRef.current) / 1000 : 0
      setElapsed(seconds)
      const { stars, xpGained } = onFinish(seconds, keysRef.current)
      setResult({ seconds, keys: keysRef.current, stars, xpGained })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-100">
          ← Levels
        </button>
        <h2 className="text-base font-bold">⚡ {rush.title}</h2>
        <span className="text-xs text-zinc-500">
          🥇 {fmt(rush.gold)} · 🥈 {fmt(rush.silver)}
          {best ? ` · best ${fmt(best.bestSeconds)}` : ''}
        </span>
      </div>

      <div className="flex items-stretch gap-3">
        <div className="flex-1 rounded-lg border border-rose-900/60 bg-rose-950/20 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold">
            Task {idx + 1} / {rush.tasks.length}
          </p>
          <p className="text-base font-semibold mt-0.5">{challenge.mission}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <code className="text-xs font-mono px-1.5 py-0.5 rounded border border-rose-700 text-rose-300 whitespace-nowrap">
              {rush.tasks[idx].keyHint}
            </code>
            {challenge.win.type === 'match' && (
              <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre overflow-x-auto">
                <span className="text-zinc-500">goal: </span>
                {challenge.target}
              </pre>
            )}
          </div>
        </div>
        <div className="w-56 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Next</p>
          <p className="text-xs text-zinc-400 mt-0.5">{nextTask ? nextTask.instruction : '🏁 finish line'}</p>
        </div>
        <div className="w-28 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Time</p>
          <p className="font-mono text-xl tabular-nums">{fmt(elapsed)}</p>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-zinc-800">
        <VimEditor
          key={`${run}-${idx}`}
          challenge={challenge}
          attempt={run}
          onKey={handleKey}
          onWin={handleWin}
          winDelayMs={80}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
        <span>keys {keys}</span>
        <span>:r restart · :q levels</span>
      </div>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4 shadow-2xl text-center">
            <div className="text-4xl tracking-widest">
              <span className="text-amber-400">{'★'.repeat(result.stars)}</span>
              <span className="text-zinc-700">{'★'.repeat(3 - result.stars)}</span>
            </div>
            <h2 className="text-xl font-bold">Rush complete!</h2>
            {result.xpGained > 0 && <p className="text-emerald-400 text-sm">+{result.xpGained} XP</p>}
            <div className="grid grid-cols-3 text-center text-sm rounded-lg bg-zinc-950 py-3">
              <div>
                <p className="text-zinc-500 text-xs uppercase">Time</p>
                <p className="font-mono text-lg">{fmt(result.seconds)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase">Keys</p>
                <p className="font-mono text-lg">{result.keys}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase">Best</p>
                <p className="font-mono text-lg">{fmt(Math.min(best?.bestSeconds ?? Infinity, result.seconds))}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              🥇 under {fmt(rush.gold)} · 🥈 under {fmt(rush.silver)}
            </p>
            <div className="flex gap-2 justify-end items-center">
              <span className="mr-auto text-xs font-mono text-zinc-600">r retry · q levels</span>
              <button onClick={restart} className="px-4 py-2 rounded-lg border border-zinc-700 text-sm hover:bg-zinc-800">
                Retry <kbd className="text-zinc-500">r</kbd>
              </button>
              <button onClick={onBack} className="px-4 py-2 rounded-lg bg-emerald-600 text-sm font-semibold hover:bg-emerald-500">
                Levels <kbd className="opacity-60">q</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

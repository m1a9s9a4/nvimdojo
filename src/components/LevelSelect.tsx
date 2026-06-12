import { useEffect, useMemo, useState } from 'react'
import { CHALLENGES } from '../data/challenges'
import { CODE_DOJO } from '../data/codeDojo'
import { STAGES } from '../data/curriculum'
import { RUSHES, type Rush } from '../data/rushes'
import type { SaveData } from '../engine/storage'
import type { Challenge } from '../types'

interface Props {
  save: SaveData
  daily: { day: number; challenge: Challenge }
  dailyDone?: { stars: number; keys: number }
  onPlay: (challenge: Challenge) => void
  onPlayRush: (rush: Rush) => void
  onPlayDaily: () => void
}

type Item =
  | { kind: 'daily' }
  | { kind: 'rush'; rush: Rush }
  | { kind: 'challenge'; challenge: Challenge }

function itemId(item: Item) {
  if (item.kind === 'daily') return 'daily'
  return item.kind === 'rush' ? item.rush.id : item.challenge.id
}

function fmtSec(s: number) {
  return `${s.toFixed(1)}s`
}

export default function LevelSelect({ save, daily, dailyDone, onPlay, onPlayRush, onPlayDaily }: Props) {
  const flat = useMemo<Item[]>(
    () => [
      { kind: 'daily' } as Item,
      ...RUSHES.map((rush) => ({ kind: 'rush', rush }) as Item),
      ...CODE_DOJO.map((challenge) => ({ kind: 'challenge', challenge }) as Item),
      ...STAGES.flatMap((s) =>
        CHALLENGES.filter((c) => c.stage === s.id).map((challenge) => ({ kind: 'challenge', challenge }) as Item),
      ),
    ],
    [],
  )
  const [sel, setSel] = useState(0)

  const activate = (item: Item) => {
    if (item.kind === 'daily') onPlayDaily()
    else if (item.kind === 'rush') onPlayRush(item.rush)
    else onPlay(item.challenge)
  }

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        setSel((s) => Math.min(s + 1, flat.length - 1))
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        setSel((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        activate(flat[sel])
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [flat, sel]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.getElementById(`level-${itemId(flat[sel])}`)?.scrollIntoView({ block: 'nearest' })
  }, [sel, flat])

  const selectedId = itemId(flat[sel])

  return (
    <div className="space-y-6">
      <section>
        <button
          id="level-daily"
          onClick={onPlayDaily}
          onMouseEnter={() => setSel(0)}
          className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
            selectedId === 'daily'
              ? 'border-sky-500 bg-zinc-900 ring-1 ring-sky-500/50'
              : 'border-sky-900/60 bg-sky-950/20 hover:border-sky-600 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-sky-300">
              📅 Daily #{daily.day} — {daily.challenge.title}
            </span>
            {dailyDone ? (
              <span className="text-amber-400 text-sm">
                {'★'.repeat(dailyDone.stars)}
                <span className="text-zinc-700">{'★'.repeat(3 - dailyDone.stars)}</span>
                <span className="text-xs text-zinc-500 ml-2">done · {dailyDone.keys} keys</span>
              </span>
            ) : (
              <span className="text-xs text-sky-500">not played yet</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">one challenge a day · share your result</p>
        </button>
      </section>

      <section>
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-sm font-bold text-rose-300">⚡ Rush Mode</h2>
          <span className="text-xs text-zinc-600">beat the clock — current task + next, nothing more</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RUSHES.map((rush) => {
            const prog = save.rush[rush.id]
            const selected = selectedId === rush.id
            return (
              <button
                key={rush.id}
                id={`level-${rush.id}`}
                onClick={() => onPlayRush(rush)}
                onMouseEnter={() => setSel(flat.findIndex((i) => itemId(i) === rush.id))}
                className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                  selected
                    ? 'border-rose-500 bg-zinc-900 ring-1 ring-rose-500/50'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-rose-600 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">⚡ {rush.title}</span>
                  <span className="text-amber-400 text-sm">
                    {'★'.repeat(prog?.stars ?? 0)}
                    <span className="text-zinc-700">{'★'.repeat(3 - (prog?.stars ?? 0))}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {rush.tasks.length} tasks · 🥇 {fmtSec(rush.gold)}
                  {prog ? ` · best ${fmtSec(prog.bestSeconds)}` : ''}
                </p>
              </button>
            )
          })}
        </div>
      </section>
      <section>
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-sm font-bold text-violet-300">💼 Code Dojo</h2>
          <span className="text-xs text-zinc-600">real-world edits on real code — Go & TypeScript</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CODE_DOJO.map((c) => {
            const prog = save.progress[c.id]
            const selected = selectedId === c.id
            return (
              <button
                key={c.id}
                id={`level-${c.id}`}
                onClick={() => onPlay(c)}
                onMouseEnter={() => setSel(flat.findIndex((i) => itemId(i) === c.id))}
                className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                  selected
                    ? 'border-violet-500 bg-zinc-900 ring-1 ring-violet-500/50'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-violet-600 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {c.lang === 'go' ? '🐹' : '⚛️'} {c.title}
                  </span>
                  <span className="text-amber-400 text-sm">
                    {'★'.repeat(prog?.stars ?? 0)}
                    <span className="text-zinc-700">{'★'.repeat(3 - (prog?.stars ?? 0))}</span>
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  {c.filename} · par {c.par}
                  {prog ? ` · best ${prog.bestKeys}` : ''}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {STAGES.map((stage) => {
        const list = CHALLENGES.filter((c) => c.stage === stage.id)
        return (
          <section key={stage.id} className={list.length === 0 ? 'opacity-40' : ''}>
            <div className="flex items-baseline gap-3 mb-2">
              <h2 className="text-sm font-bold">
                <span className="text-zinc-500 font-mono mr-2">{String(stage.id).padStart(2, '0')}</span>
                {stage.title}
              </h2>
              <div className="flex gap-1">
                {stage.newCommands.map((c) => (
                  <code key={c} className="text-[11px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {c}
                  </code>
                ))}
              </div>
              {list.length === 0 && <span className="text-xs text-zinc-600">coming soon</span>}
            </div>
            {list.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {list.map((c) => {
                  const prog = save.progress[c.id]
                  const selected = selectedId === c.id
                  return (
                    <button
                      key={c.id}
                      id={`level-${c.id}`}
                      onClick={() => onPlay(c)}
                      onMouseEnter={() => setSel(flat.findIndex((i) => itemId(i) === c.id))}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        selected
                          ? 'border-emerald-500 bg-zinc-900 ring-1 ring-emerald-500/50'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-emerald-600 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {c.type === 'world' ? '🌍' : '⛳'} {c.title}
                        </span>
                        <span className="text-amber-400 text-sm">
                          {'★'.repeat(prog?.stars ?? 0)}
                          <span className="text-zinc-700">{'★'.repeat(3 - (prog?.stars ?? 0))}</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        par {c.par}
                        {prog ? ` · best ${prog.bestKeys}` : ''}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
      <p className="text-xs font-mono text-zinc-600 pb-4">j/k navigate · ⏎ play</p>
    </div>
  )
}

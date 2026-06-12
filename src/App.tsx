import { useEffect, useMemo, useRef, useState } from 'react'
import { CHALLENGES } from './data/challenges'
import { CODE_DOJO } from './data/codeDojo'
import { RUSHES, type Rush } from './data/rushes'
import { dailyShareText, getDaily, todayISO } from './engine/daily'
import { loadSave, persist, recordRushWin, recordWin, type SaveData } from './engine/storage'
import { starsFor } from './engine/scoring'
import type { Challenge, WinStats } from './types'
import LevelSelect from './components/LevelSelect'
import PlayScreen from './components/PlayScreen'
import RushScreen from './components/RushScreen'

type Route =
  | { kind: 'home' }
  | { kind: 'level'; id: string }
  | { kind: 'daily' }
  | { kind: 'rush'; id: string }

function parseHash(): Route {
  const h = window.location.hash
  if (h.startsWith('#/l/')) return { kind: 'level', id: decodeURIComponent(h.slice(4)) }
  if (h === '#/daily') return { kind: 'daily' }
  if (h.startsWith('#/rush/')) return { kind: 'rush', id: h.slice(7) }
  return { kind: 'home' }
}

function navigate(hash: string) {
  window.location.hash = hash
}

const ALL_CHALLENGES = [...CODE_DOJO, ...CHALLENGES]

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave())
  const saveRef = useRef(save)
  saveRef.current = save
  const [route, setRoute] = useState<Route>(parseHash)
  const daily = useMemo(() => getDaily(), [])

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const isDaily = route.kind === 'daily'
  const current: Challenge | null = isDaily
    ? daily.challenge
    : route.kind === 'level'
      ? (ALL_CHALLENGES.find((c) => c.id === route.id) ?? null)
      : null
  const currentRush: Rush | null =
    route.kind === 'rush' ? (RUSHES.find((r) => r.id === route.id) ?? null) : null

  const handleCleared = (challenge: Challenge, stats: WinStats) => {
    const stars = starsFor(stats.keys, challenge.par)
    const { save: next, xpGained } = recordWin(saveRef.current, challenge.id, stats.keys, stars)
    let final = next
    let share: string | undefined
    if (isDaily) {
      final = { ...next, daily: { ...next.daily, [todayISO()]: { stars, keys: stats.keys } } }
      persist(final)
      share = dailyShareText(daily.day, stars, stats.keys, challenge.par)
    }
    setSave(final)
    return { stars, xpGained, share }
  }

  const handleRushFinish = (rush: Rush, seconds: number, keys: number) => {
    const stars = seconds <= rush.gold ? 3 : seconds <= rush.silver ? 2 : 1
    const { save: next, xpGained } = recordRushWin(saveRef.current, rush.id, seconds, keys, stars)
    setSave(next)
    return { stars, xpGained }
  }

  const toggleHints = () => {
    const next = { ...saveRef.current, hintsOn: !saveRef.current.hintsOn }
    persist(next)
    setSave(next)
  }

  const idx = current && !isDaily ? ALL_CHALLENGES.findIndex((c) => c.id === current.id) : -1
  const nextChallenge = idx >= 0 && idx < ALL_CHALLENGES.length - 1 ? ALL_CHALLENGES[idx + 1] : null

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold tracking-tight">
          ⌨️ nvim trainer <span className="text-zinc-500 text-xs font-normal">alpha</span>
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-300">
          <span title="experience points">⚡ {save.xp} XP</span>
          <span title="daily streak">🔥 {save.streak.count}</span>
        </div>
      </header>

      {currentRush ? (
        <RushScreen
          key={currentRush.id}
          rush={currentRush}
          best={save.rush[currentRush.id]}
          onFinish={(seconds, keys) => handleRushFinish(currentRush, seconds, keys)}
          onBack={() => navigate('')}
        />
      ) : current ? (
        <PlayScreen
          key={`${isDaily ? 'daily-' : ''}${current.id}`}
          challenge={current}
          hasNext={!isDaily && nextChallenge !== null}
          hintsOn={save.hintsOn}
          onToggleHints={toggleHints}
          onBack={() => navigate('')}
          onNext={() => nextChallenge && navigate(`#/l/${nextChallenge.id}`)}
          onCleared={handleCleared}
        />
      ) : (
        <LevelSelect
          save={save}
          daily={daily}
          dailyDone={save.daily[todayISO()]}
          onPlay={(c) => navigate(`#/l/${c.id}`)}
          onPlayRush={(r) => navigate(`#/rush/${r.id}`)}
          onPlayDaily={() => navigate('#/daily')}
        />
      )}
    </div>
  )
}

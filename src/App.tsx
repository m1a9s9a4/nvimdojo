import { useRef, useState } from 'react'
import { CHALLENGES } from './data/challenges'
import type { Rush } from './data/rushes'
import { loadSave, persist, recordRushWin, recordWin, type SaveData } from './engine/storage'
import { starsFor } from './engine/scoring'
import type { Challenge, WinStats } from './types'
import LevelSelect from './components/LevelSelect'
import PlayScreen from './components/PlayScreen'
import RushScreen from './components/RushScreen'

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave())
  const saveRef = useRef(save)
  saveRef.current = save
  const [current, setCurrent] = useState<Challenge | null>(null)
  const [currentRush, setCurrentRush] = useState<Rush | null>(null)

  const handleCleared = (challenge: Challenge, stats: WinStats) => {
    const stars = starsFor(stats.keys, challenge.par)
    const { save: next, xpGained } = recordWin(saveRef.current, challenge.id, stats.keys, stars)
    setSave(next)
    return { stars, xpGained }
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

  const idx = current ? CHALLENGES.findIndex((c) => c.id === current.id) : -1
  const nextChallenge = idx >= 0 && idx < CHALLENGES.length - 1 ? CHALLENGES[idx + 1] : null

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
          onBack={() => setCurrentRush(null)}
        />
      ) : current ? (
        <PlayScreen
          key={current.id}
          challenge={current}
          hasNext={nextChallenge !== null}
          hintsOn={save.hintsOn}
          onToggleHints={toggleHints}
          onBack={() => setCurrent(null)}
          onNext={() => nextChallenge && setCurrent(nextChallenge)}
          onCleared={handleCleared}
        />
      ) : (
        <LevelSelect save={save} onPlay={setCurrent} onPlayRush={setCurrentRush} />
      )}
    </div>
  )
}

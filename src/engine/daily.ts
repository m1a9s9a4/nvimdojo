import { CHALLENGES } from '../data/challenges'
import type { Challenge } from '../types'

const EPOCH = Date.UTC(2026, 5, 1) // 2026-06-01
const SITE_URL = 'https://m1a9s9a4.github.io/nvim-trainer/'

export function getDaily(now = new Date()): { day: number; challenge: Challenge } {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const day = Math.max(1, Math.floor((today - EPOCH) / 86_400_000) + 1)
  const challenge = CHALLENGES[(day * 7919) % CHALLENGES.length]
  return { day, challenge }
}

export function dailyShareText(day: number, stars: number, keys: number, par: number): string {
  return `nvim trainer Daily #${day} ${'⭐'.repeat(stars)} — ${keys} keys (par ${par})\n${SITE_URL}`
}

export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

import { useEffect, useRef } from 'react'
import { EditorView, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { minimalSetup } from 'codemirror'
import { vim, getCM } from '@replit/codemirror-vim'
import { oneDark } from '@codemirror/theme-one-dark'
import type { Challenge, WinStats } from '../types'
import { normalizeKey } from '../engine/keys'
import { registerExCommands } from '../engine/exBus'
import { goalHighlight, worldDecorations } from './worldDeco'
import { worldFx } from './worldFx'

interface Props {
  challenge: Challenge
  attempt: number
  onKey: (token: string) => void
  onWin: (stats: WinStats) => void
  onMode?: (mode: string) => void
  winDelayMs?: number
}

export default function VimEditor({ challenge, attempt, onKey, onWin, onMode, winDelayMs = 650 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onKeyRef = useRef(onKey)
  const onWinRef = useRef(onWin)
  const onModeRef = useRef(onMode)
  onKeyRef.current = onKey
  onWinRef.current = onWin
  onModeRef.current = onMode

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    registerExCommands()
    container.classList.remove('cleared')

    let won = false
    let currentMode = 'normal'
    const keystrokes: string[] = []
    let startedAt = 0

    const checkWin = (state: EditorState) => {
      if (won) return
      let cleared = false
      const win = challenge.win
      if (win.type === 'match') {
        cleared = state.doc.toString() === challenge.target
      } else {
        const head = state.selection.main.head
        const line = state.doc.lineAt(head)
        cleared = line.number - 1 === win.line && head - line.from === win.col
      }
      if (cleared) {
        won = true
        const seconds = startedAt ? (performance.now() - startedAt) / 1000 : 0
        container.classList.add('cleared')
        // let the glow play before the result modal appears
        setTimeout(() => onWinRef.current({ keys: keystrokes.length, seconds, keystrokes }), winDelayMs)
      }
    }

    const updateListener = EditorView.updateListener.of((u) => {
      if (u.docChanged || u.selectionSet) checkWin(u.state)
    })

    const startSelection = (() => {
      if (!challenge.cursor) return undefined
      const lines = challenge.start.split('\n')
      let pos = 0
      for (let i = 0; i < challenge.cursor.line && i < lines.length; i++) pos += lines[i].length + 1
      return { anchor: Math.min(pos + challenge.cursor.col, challenge.start.length) }
    })()

    const view = new EditorView({
      state: EditorState.create({
        ...(startSelection ? { selection: startSelection } : {}),
        doc: challenge.start,
        extensions: [
          vim(),
          minimalSetup,
          ...(challenge.type === 'golf' ? [lineNumbers()] : []),
          ...(challenge.type === 'golf' && challenge.win.type === 'reach'
            ? [goalHighlight({ line: challenge.win.line, col: challenge.win.col })]
            : []),
          oneDark,
          updateListener,
          ...(challenge.type === 'world'
            ? [
                worldDecorations(
                  challenge.win.type === 'reach'
                    ? { line: challenge.win.line, col: challenge.win.col }
                    : undefined,
                ),
                ...(challenge.avatar !== false ? [worldFx()] : []),
              ]
            : []),
        ],
      }),
      parent: container,
    })

    const onKeydown = (e: KeyboardEvent) => {
      if (won) return
      // keys typed into the vim command line (after : or /) are meta, not golf strokes —
      // unless the challenge is explicitly about ex commands / search
      const target = e.target as HTMLElement | null
      if (!challenge.countCmdline && target?.closest('.cm-panels, .cm-vim-panel, .cm-dialog')) return
      const token = normalizeKey(e)
      if (!token) return
      if (!challenge.countCmdline && (token === ':' || token === '/' || token === '?') && currentMode === 'normal')
        return
      if (keystrokes.length === 0) startedAt = performance.now()
      keystrokes.push(token)
      onKeyRef.current(token)
    }
    view.dom.addEventListener('keydown', onKeydown, true)

    const cm = getCM(view)
    cm?.on('vim-mode-change', (ev: { mode: string }) => {
      currentMode = ev.mode
      onModeRef.current?.(ev.mode)
    })

    view.focus()

    return () => {
      view.dom.removeEventListener('keydown', onKeydown, true)
      view.destroy()
    }
  }, [challenge, attempt, winDelayMs])

  return (
    <div
      ref={containerRef}
      className={challenge.type === 'world' ? 'world' : 'golf'}
      onClick={() => containerRef.current?.querySelector<HTMLElement>('.cm-content')?.focus()}
    />
  )
}

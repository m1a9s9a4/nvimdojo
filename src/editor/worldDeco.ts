import { Decoration, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'
import type { DecorationSet } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

const TILE_CLASS: Record<string, string> = {
  T: 'tile tile-tree',
  '#': 'tile tile-rock',
  '*': 'tile tile-gem',
  A: 'tile tile-altar',
  F: 'tile tile-flag',
  C: 'tile tile-camp',
  S: 'tile tile-slime',
  M: 'tile tile-goblin',
}

/** highlight a single reach-goal position in plain text (golf) levels */
export function goalHighlight(goal: { line: number; col: number }) {
  function build(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const doc = view.state.doc
    if (goal.line < doc.lines) {
      const line = doc.line(goal.line + 1)
      if (goal.col < line.length) {
        const pos = line.from + goal.col
        builder.add(pos, pos + 1, Decoration.mark({ class: 'tile-goal' }))
      }
    }
    return builder.finish()
  }
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet
      constructor(view: EditorView) {
        this.decorations = build(view)
      }
      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) this.decorations = build(u.view)
      }
    },
    { decorations: (v) => v.decorations },
  )
}

export function worldDecorations(goal?: { line: number; col: number }) {
  function build(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>()
    const doc = view.state.doc
    let goalPos = -1
    if (goal && goal.line < doc.lines) {
      const line = doc.line(goal.line + 1)
      if (goal.col < line.length) goalPos = line.from + goal.col
    }
    for (let lineNo = 1; lineNo <= doc.lines; lineNo++) {
      const line = doc.line(lineNo)
      const text = line.text
      for (let i = 0; i < text.length; i++) {
        const pos = line.from + i
        const tileClass = TILE_CLASS[text[i]]
        const isGoal = pos === goalPos
        if (tileClass || isGoal) {
          const cls = `${tileClass ?? ''}${isGoal ? ' tile-goal' : ''}`.trim()
          builder.add(pos, pos + 1, Decoration.mark({ class: cls }))
        }
      }
    }
    return builder.finish()
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet
      constructor(view: EditorView) {
        this.decorations = build(view)
      }
      update(u: ViewUpdate) {
        if (u.docChanged || u.viewportChanged) this.decorations = build(u.view)
      }
    },
    { decorations: (v) => v.decorations },
  )
}

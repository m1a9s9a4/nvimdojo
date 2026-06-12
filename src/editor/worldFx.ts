import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'

export function worldFx() {
  return ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {}

      update(u: ViewUpdate) {
        if (u.docChanged) {
          const hitSpots: number[] = []
          u.changes.iterChanges((fromA, toA, fromB) => {
            if (toA > fromA) hitSpots.push(fromB)
          })
          if (hitSpots.length > 0) {
            u.view.requestMeasure({ read: () => hitSpots.forEach((p) => this.pop(p)) })
          }
        }
      }

      coords(pos: number) {
        const clamped = Math.max(0, Math.min(pos, this.view.state.doc.length))
        const c = this.view.coordsAtPos(clamped)
        if (!c) return null
        const box = this.view.scrollDOM.getBoundingClientRect()
        return {
          left: c.left - box.left + this.view.scrollDOM.scrollLeft,
          top: c.top - box.top + this.view.scrollDOM.scrollTop,
        }
      }

      pop(pos: number) {
        const c = this.coords(pos)
        if (!c) return
        const el = document.createElement('div')
        el.className = 'world-pop'
        el.textContent = '💥'
        el.style.left = `${c.left}px`
        el.style.top = `${c.top}px`
        this.view.scrollDOM.appendChild(el)
        setTimeout(() => el.remove(), 500)
      }
    },
  )
}

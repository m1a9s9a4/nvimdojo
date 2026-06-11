import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'

const AVATAR = '🦊'

export function worldFx() {
  return ViewPlugin.fromClass(
    class {
      avatar: HTMLElement

      constructor(private view: EditorView) {
        this.avatar = document.createElement('div')
        this.avatar.className = 'world-avatar'
        this.avatar.textContent = AVATAR
        view.scrollDOM.appendChild(this.avatar)
        view.requestMeasure({ read: () => this.place() })
      }

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
        if (u.selectionSet || u.docChanged || u.geometryChanged) {
          u.view.requestMeasure({ read: () => this.place() })
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
          height: c.bottom - c.top,
        }
      }

      place() {
        const c = this.coords(this.view.state.selection.main.head)
        if (!c) return
        this.avatar.style.left = `${c.left}px`
        this.avatar.style.top = `${c.top}px`
        this.avatar.style.height = `${c.height}px`
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

      destroy() {
        this.avatar.remove()
      }
    },
  )
}

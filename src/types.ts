export type LevelType = 'golf' | 'world'

export type WinCondition =
  | { type: 'match' }
  | { type: 'reach'; line: number; col: number }

export interface Challenge {
  id: string
  stage: number
  type: LevelType
  title: string
  mission: string
  scene?: { place: string; flavor: string }
  start: string
  target: string
  win: WinCondition
  cursor?: { line: number; col: number }
  /** show the avatar on world levels; disable where reading the character under the cursor matters */
  avatar?: boolean
  /** count command-line (: and /) keystrokes toward the score — for search/substitute stages */
  countCmdline?: boolean
  par: number
  commands: { new: string[]; allowed: string[] }
  solution: string[]
  solutionSteps?: { keys: string; explain: string }[]
  hint?: string
}

export interface WinStats {
  keys: number
  seconds: number
  keystrokes: string[]
}

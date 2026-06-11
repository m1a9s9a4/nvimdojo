import type { Challenge, WinCondition } from '../types'

export interface RushTask {
  instruction: string
  keyHint: string
  start: string
  target: string
  win: WinCondition
  cursor?: { line: number; col: number }
}

export interface Rush {
  id: string
  title: string
  description: string
  gold: number
  silver: number
  tasks: RushTask[]
}

export const RUSHES: Rush[] = [
  {
    id: 'rush-motion-1',
    title: 'Motion Rush',
    description: 'Ten targets, zero mercy. Move the cursor onto each highlighted spot.',
    gold: 20,
    silver: 35,
    tasks: [
      {
        instruction: 'Move the cursor onto the highlighted x',
        keyHint: 'fx',
        start: 'the quick brown fox jumps',
        target: 'the quick brown fox jumps',
        win: { type: 'reach', line: 0, col: 18 },
      },
      {
        instruction: 'Jump to the last character of the line',
        keyHint: '$',
        start: 'follow the white rabbit',
        target: 'follow the white rabbit',
        win: { type: 'reach', line: 0, col: 22 },
      },
      {
        instruction: 'Go down to the last line',
        keyHint: 'G',
        start: 'alpha\nbravo\ncharlie',
        target: 'alpha\nbravo\ncharlie',
        win: { type: 'reach', line: 2, col: 0 },
      },
      {
        instruction: 'Jump to the first non-blank character of the line',
        keyHint: '^',
        start: '    indented text here',
        target: '    indented text here',
        win: { type: 'reach', line: 0, col: 4 },
        cursor: { line: 0, col: 12 },
      },
      {
        instruction: 'Move onto the highlighted e (the first e in the line)',
        keyHint: 'fe',
        start: 'vim never sleeps',
        target: 'vim never sleeps',
        win: { type: 'reach', line: 0, col: 5 },
      },
      {
        instruction: 'Hop to the word "four" (the highlighted f)',
        keyHint: 'www or 3w',
        start: 'one two three four five',
        target: 'one two three four five',
        win: { type: 'reach', line: 0, col: 14 },
      },
      {
        instruction: 'Move to the last letter of the first word',
        keyHint: 'e',
        start: 'extraordinary plans',
        target: 'extraordinary plans',
        win: { type: 'reach', line: 0, col: 12 },
      },
      {
        instruction: 'You start at the bottom — go back to the very first character',
        keyHint: 'gg',
        start: 'delta\necho\nfoxtrot\ngolf',
        target: 'delta\necho\nfoxtrot\ngolf',
        win: { type: 'reach', line: 0, col: 0 },
        cursor: { line: 3, col: 2 },
      },
      {
        instruction: 'Move onto the highlighted opening parenthesis (',
        keyHint: 'f(',
        start: 'const result = add(a, b)',
        target: 'const result = add(a, b)',
        win: { type: 'reach', line: 0, col: 18 },
      },
      {
        instruction: 'Jump to the very last character of the file (bottom-right)',
        keyHint: 'G then $',
        start: 'red\ngreen\nblue and gold',
        target: 'red\ngreen\nblue and gold',
        win: { type: 'reach', line: 2, col: 12 },
      },
    ],
  },
  {
    id: 'rush-edit-1',
    title: 'Edit Rush',
    description: 'Eight lightning edits. Make the buffer match the goal text.',
    gold: 25,
    silver: 45,
    tasks: [
      {
        instruction: 'Delete the word THIS (your cursor is already on it)',
        keyHint: 'dw',
        start: 'delete THIS word',
        target: 'delete word',
        win: { type: 'match' },
        cursor: { line: 0, col: 7 },
      },
      {
        instruction: 'Add a ! at the end of the line',
        keyHint: 'A then !',
        start: 'ship it',
        target: 'ship it!',
        win: { type: 'match' },
      },
      {
        instruction: 'Replace the 0 with the letter o',
        keyHint: 'f0 then ro',
        start: 'c0de',
        target: 'code',
        win: { type: 'match' },
      },
      {
        instruction: 'Make a second copy of this line below',
        keyHint: 'yy then p',
        start: 'echo hi',
        target: 'echo hi\necho hi',
        win: { type: 'match' },
      },
      {
        instruction: 'Delete the middle line (the one that says trash)',
        keyHint: 'j then dd',
        start: 'keep\ntrash\nkeep',
        target: 'keep\nkeep',
        win: { type: 'match' },
      },
      {
        instruction: 'Replace the text inside the quotes with: new',
        keyHint: 'ci" then type new',
        start: 'name = "old"',
        target: 'name = "new"',
        win: { type: 'match' },
      },
      {
        instruction: 'Fix the swapped letters: teh → the',
        keyHint: 'l then xp',
        start: 'teh tower',
        target: 'the tower',
        win: { type: 'match' },
      },
      {
        instruction: 'Capitalize the first letter: vim → Vim',
        keyHint: '~',
        start: 'vim forever',
        target: 'Vim forever',
        win: { type: 'match' },
      },
    ],
  },
]

export function rushTaskToChallenge(rush: Rush, index: number): Challenge {
  const task = rush.tasks[index]
  return {
    id: `${rush.id}-task-${index}`,
    stage: 0,
    type: 'golf',
    title: rush.title,
    mission: task.instruction,
    start: task.start,
    target: task.target,
    win: task.win,
    cursor: task.cursor,
    par: 99,
    commands: { new: [], allowed: [] },
    solution: [],
  }
}

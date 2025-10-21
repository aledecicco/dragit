import type { ReactNode } from 'react'
import type { RootContent } from 'hast'
import { match } from 'ts-pattern'

import type { FileConflicts } from '@/api/models'

import {
  getTree,
  type LineNode,
  renderTree,
  splitIntoLines,
  wrapLineInType,
} from '../utils'

/**
 * Recovers the full content of a file from a diff, from our changes.
 *
 * @param fileConflicts - The diff to recover the content from.
 */
const getContentOurs = (fileConflicts: FileConflicts): string => {
  return fileConflicts
    .filter((line) => line.type !== 'theirs')
    .map((line) => line.content)
    .join('')
}

/**
 * Recovers the full content of a file from a diff, from their changes.
 *
 * @param fileConflicts - The diff to recover the content from.
 */
const getContentTheirs = (fileConflicts: FileConflicts): string => {
  console.log(fileConflicts)
  return fileConflicts
    .filter((line) => line.type !== 'ours')
    .map((line) => line.content)
    .join('')
}

/**
 * Adds syntax and conflict highlighting to a file conflict.
 *
 * @param fileConflicts - The conflicts to highlight.
 * @param path - The path of the file with conflicts (used to determine the language).
 */
export const highlightConflicts = (
  fileConflicts: FileConflicts,
  path: string,
): ReactNode => {
  // Recover the contents of the file from the conflict, ours and theirs.
  // Then syntax-highlight both versions completely.
  const treeOurs = getTree(getContentOurs(fileConflicts), path)
  const treeTheirs = getTree(getContentTheirs(fileConflicts), path)
  console.log(treeOurs, treeTheirs)

  // Split the syntax-highlighted trees into lines, so we can interleave them
  // according to the conflicts, without losing the syntax highlighting.
  const linesOurs = treeOurs ? splitIntoLines(treeOurs) : []
  const linesTheirs = treeTheirs ? splitIntoLines(treeTheirs) : []

  // We use pointers to track which lines we're going to provide when the conflict
  // asks for a line from before or after.
  let pointerOurs = 0
  let pointerTheirs = 0

  const res: RootContent[] = []

  for (const conflictLine of fileConflicts) {
    const lineOurs = linesOurs.at(pointerOurs) ?? []
    const lineTheirs = linesTheirs.at(pointerTheirs) ?? []

    match(conflictLine.type)
      .with('ours', () => {
        // If this is our line, we take it from the "ours" content.
        res.push(wrapLineInType(lineOurs, conflictLine.type))
        pointerOurs++
      })
      .with('theirs', () => {
        res.push(wrapLineInType(lineTheirs, conflictLine.type))
        pointerTheirs++
      })
      .with('unchanged', () => {
        // If this is an unchanged line, either one should be the same,
        // and so we move both pointers.
        res.push(wrapLineInType(lineOurs, conflictLine.type))
        pointerOurs++
        pointerTheirs++
      })
      .exhaustive()
  }

  // We add an empty line at the end for continuity.
  const finalLine: LineNode[] =
    res.length === 0
      ? [
          {
            type: 'element',
            tagName: 'p',
            properties: { className: 'text-light-950/50 italic select-none' },
            children: [{ type: 'text', value: 'Empty' }],
          },
        ]
      : [{ type: 'text', value: '\n' }]

  res.push(wrapLineInType(finalLine, 'unchanged'))

  return renderTree({ type: 'root', children: res })
}

import type { ReactNode } from 'react'
import type { RootContent, Text } from 'hast'
import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType, FileDiff } from '@/api/models'
import { getSettings } from '@/state/storage'

import {
  getNodeChildren,
  getTree,
  type LineNode,
  NEWLINE_REGEX,
  renderTree,
  splitIntoLines,
  wrapLineInType,
  wrapNodeInType,
} from '../utils'

export const DIFF_FILTERS = ['ours', 'theirs', 'both'] as const
export type DiffFilter = (typeof DIFF_FILTERS)[number]

/**
 * Gets the type of a diff segment based on its first character.
 *
 * @param segment - The diff segment to check.
 */
const getDiffSegmentType = (segment: DiffLineSegment): DiffType => {
  return match(segment.at(0))
    .returnType<DiffType>()
    .with('+', () => 'added')
    .with('-', () => 'removed')
    .otherwise(() => 'unchanged')
}

/**
 * Recovers the full content of a file from a diff, before the changes.
 *
 * @param fileDiff - The diff to recover the content from.
 */
const getContentBefore = (fileDiff: FileDiff): string => {
  return fileDiff
    .filter((line) => line.type !== 'added')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

/**
 * Recovers the full content of a file from a diff, after the changes.
 *
 * @param fileDiff - The diff to recover the content from.
 */
const getContentAfter = (fileDiff: FileDiff): string => {
  return fileDiff
    .filter((line) => line.type !== 'removed')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

/**
 * Applies a diff segment to a text node, returning a new node
 * and the number of characters covered.
 *
 * @param diffSegment - The diff segment to apply.
 * @param node - The text node to apply it to.
 */
const applyDiffSegment = (
  diffSegment: DiffLineSegment,
  node: Text,
): [LineNode, number] => {
  const nodeLength = node.value.length
  const segmentType = getDiffSegmentType(diffSegment)
  const segmentLength = diffSegment.length - 1

  if (segmentLength >= nodeLength) {
    // The diff segment covers the whole text node, so we wrap it completely,
    const newNode = wrapNodeInType(node, segmentType)
    return [newNode, nodeLength]
  }

  // The diff segment only covers part of the text node, so we wrap only that.
  const coveredPart = node.value.slice(0, segmentLength)
  const newNode = wrapNodeInType(
    { type: 'text', value: coveredPart },
    segmentType,
  )
  return [newNode, segmentLength]
}

/**
 * Inner function to apply a series of diff segments to a line.
 * This modifies the diff segments and line in-place.
 *
 * @param diffSegments - The diff segments to apply.
 * @param line - The line to apply them to.
 */
const applyDiffLineInner = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
): LineNode[] => {
  const newLine: LineNode[] = []

  // We process both the diff segments and the line nodes at the same time,
  // until we run out of either.
  // This way we go over them at most once.
  while (diffSegments.length > 0 && line.length > 0) {
    const segment = diffSegments[0]
    const node = line[0]

    if (node.type === 'text') {
      // If the current node is a text node, we can apply the diff segment to it.
      const [newNode, lengthCovered] = applyDiffSegment(segment, node)
      newLine.push(newNode)

      if (lengthCovered < node.value.length) {
        // The diff segment didn't cover the whole text node,
        // so we need to leave the remaining part in the line for further processing.
        line[0] = {
          ...node,
          value: node.value.slice(lengthCovered),
        }

        // We did use up the whole diff segment, so we remove it.
        diffSegments.shift()
      } else {
        // The diff segment covered the whole text node, so we remove it.
        line.shift()

        if (lengthCovered < segment.length - 1) {
          // We didn't use up the whole diff segment,
          // so we need to leave the remaining part in the diff segments for further processing.
          diffSegments[0] = `${segment[0]}${segment.slice(1 + lengthCovered)}`
        } else {
          // We did use up the whole diff segment, so we remove it.
          diffSegments.shift()
        }
      }
    } else if ('children' in node && node.children.length > 0) {
      // If the current node has children, we apply the diff line to them.
      // This modifies the diff segments as a side effect, so we don't need to do it again.
      const childLine = applyDiffLineInner(diffSegments, getNodeChildren(node))
      newLine.push({ ...node, children: childLine })
      line.shift()
    } else {
      // Otherwise we can't apply the diff segment to this node, so we discard it.
      line.shift()
    }
  }

  if (line.length > 0) {
    // If we have remaining nodes in the line, we add them to the result.
    newLine.push(...line)
  }
  return newLine
}

/**
 * Adds a visual representation of newlines at the end of a line,
 * only in cases where it's needed for clarity.
 * This modifies the line in-place.
 *
 * @param diffSegments - The diff segments for the line.
 * @param line - The line to modify.
 */
const addVisibleNewlines = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
) => {
  const lastSegment = diffSegments.at(-1)

  if (line.length > 0 && lastSegment) {
    const segmentType = getDiffSegmentType(lastSegment)

    if (
      segmentType !== 'unchanged' &&
      NEWLINE_REGEX.test(lastSegment.slice(1)) &&
      diffSegments.length > 1 &&
      diffSegments.every(
        (seg, i) =>
          i === diffSegments.length - 1 ||
          getDiffSegmentType(seg) === 'unchanged',
      )
    ) {
      line[line.length - 1] = {
        type: 'element',
        tagName: 'span',
        properties: {
          className: match(segmentType)
            .with('added', () => 'text-success-300/90 py-0.5 select-none')
            .with('removed', () => 'text-danger-300/90 py-0.5 select-none')
            .exhaustive(),
        },
        children: [{ type: 'text', value: '⤶\n' }],
      }
    }
  }
}

/**
 * Applies a series of diff segments to a line.
 *
 * @param diffSegments - The diff segments to apply.
 * @param line - The line to apply them to.
 */
const applyDiffLine = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
): LineNode[] => {
  const newLine = [...line]
  const newSegments = [...diffSegments]

  addVisibleNewlines(newSegments, newLine)

  return applyDiffLineInner(newSegments, newLine)
}

/**
 * Adds word-diff highlighting segments to the given lines according to a diff.
 *
 * @param fileDiff - The diff to apply.
 * @param linesBefore - The lines before the changes, to modify in-place.
 * @param linesAfter - The lines after the changes, to modify in-place.
 */
const addWordDiff = (
  fileDiff: FileDiff,
  linesBefore: LineNode[][],
  linesAfter: LineNode[][],
) => {
  let pointerBefore = 0
  let pointerAfter = 0

  for (const diffLine of fileDiff) {
    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    match(diffLine.type)
      .with('added', () => {
        linesAfter[pointerAfter] = applyDiffLine(diffLine.content, lineAfter)
        pointerAfter++
      })
      .with('removed', () => {
        linesBefore[pointerBefore] = applyDiffLine(diffLine.content, lineBefore)
        pointerBefore++
      })
      .with('unchanged', () => {
        pointerBefore++
        pointerAfter++
      })
      .exhaustive()
  }
}

/**
 * Adds syntax and diff highlighting to a file diff.
 *
 * @param fileDiff - The diff to highlight.
 * @param path - The path of the file being diffed (used to determine the language).
 * @param filter - A filter indicating which parts of the diff to show.
 */
export const highlightDiff = (
  fileDiff: FileDiff,
  path: string,
  filter: DiffFilter,
): ReactNode => {
  // Recover the contents of the file from the diff, before and after.
  // Then syntax-highlight both versions completely.
  const treeBefore = getTree(getContentBefore(fileDiff), path)
  const treeAfter = getTree(getContentAfter(fileDiff), path)

  // Split the syntax-highlighted trees into lines, so we can interleave them
  // according to the diff, without losing the syntax highlighting.
  const linesBefore = treeBefore ? splitIntoLines(treeBefore) : []
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []

  const { showWordDiffs } = getSettings()
  if (showWordDiffs) {
    // Modify the lines in-place to add word-diff highlighting segments.
    addWordDiff(fileDiff, linesBefore, linesAfter)
  }

  // We use pointers to track which lines we're going to provide when the diff
  // asks for a line from before or after.
  let pointerBefore = 0
  let pointerAfter = 0

  const res: RootContent[] = []

  for (const diffLine of fileDiff) {
    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    match(diffLine.type)
      .with('added', () => {
        // If this is an added line, we take it from the "after" content.
        if (filter !== 'theirs') {
          res.push(wrapLineInType(lineAfter, diffLine.type))
        }
        pointerAfter++
      })
      .with('removed', () => {
        // If this is a removed line, we take it from the "before" content.
        if (filter !== 'ours') {
          res.push(wrapLineInType(lineBefore, diffLine.type))
        }
        pointerBefore++
      })
      .with('unchanged', () => {
        // If this is an unchanged line, either one should be the same,
        // and so we move both pointers.
        res.push(wrapLineInType(lineBefore, diffLine.type))
        pointerBefore++
        pointerAfter++
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

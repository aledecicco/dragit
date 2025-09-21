import type { ReactNode } from 'react'
import { all, createStarryNight } from '@wooorm/starry-night'
import type { Element, ElementContent, Root, RootContent, Text } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType, FileDiff } from '@/api/models'

const starryNight = await createStarryNight(all)
const SPLIT_REGEX = /\r\n|\r|\n/

/**
 * Builds a syntax-highlighted tree for the given content and language identifier.
 *
 * @param content - The full content to highlight.
 * @param identifier - The language identifier (can be a filepath).
 */
const getTree = (content: string, identifier: string): Root | undefined => {
  const scope = starryNight.flagToScope(identifier)
  if (!scope) {
    return undefined
  }
  return starryNight.highlight(content, scope)
}

/**
 * Renders a syntax-highlighted tree into a React node.
 *
 * @param tree - The hast tree to render.
 */
const renderTree = (tree: Root): ReactNode => {
  const node = toJsxRuntime(tree, { Fragment, jsx, jsxs })
  return node
}

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
 * Splits a syntax-highlighted tree into lines.
 *
 * @param tree - The hast tree to split.
 */
const splitIntoLines = (tree: Root): RootContent[][] => {
  const lines: RootContent[][] = []
  let line: RootContent[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text') {
      const parts = node.value.split(SPLIT_REGEX)
      parts.forEach((part, index) => {
        if (index > 0) {
          lines.push(line)
          line = []
        }

        if (part.length > 0) {
          line.push({ ...node, value: part })
        }
      })
    } else {
      line.push(node)
    }
  })

  if (line.length > 0) {
    lines.push(line)
  }

  return lines
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
): [Element | Text, number] => {
  const nodeLength = node.value.length
  const segmentType = getDiffSegmentType(diffSegment)
  const segmentLength = diffSegment.length - 1

  if (segmentLength >= nodeLength) {
    // The diff segment covers the whole text node, so we wrap it completely,

    const newNode = match(segmentType)
      .returnType<Element | Text>()
      .with('added', () => ({
        type: 'element',
        tagName: 'span',
        properties: { className: 'bg-success-500/20' },
        children: [node],
      }))
      .with('removed', () => ({
        type: 'element',
        tagName: 'span',
        properties: { className: 'bg-danger-500/20' },
        children: [node],
      }))
      .with('unchanged', () => node)
      .exhaustive()

    return [newNode, nodeLength]
  }

  // The diff segment only covers part of the text node, so we wrap only that.
  const coveredPart = node.value.slice(0, segmentLength)

  const newNode = match(segmentType)
    .returnType<Element | Text>()
    .with('added', () => ({
      type: 'element',
      tagName: 'span',
      properties: { className: 'bg-success-500/20' },
      children: [{ type: 'text', value: coveredPart }],
    }))
    .with('removed', () => ({
      type: 'element',
      tagName: 'span',
      properties: { className: 'bg-danger-500/20' },
      children: [{ type: 'text', value: coveredPart }],
    }))
    .with('unchanged', () => ({ type: 'text', value: coveredPart }))
    .exhaustive()

  return [newNode, segmentLength]
}

/**
 * Applies a series of diff segments to a line, returning a new line.
 *
 * Consumes both the diff segments and the line nodes in place.
 *
 * @param diffSegments - The diff segments to apply.
 * @param line - The line to apply them to.
 */
function applyDiffLine(
  diffSegments: DiffLineSegment[],
  line: RootContent[],
): RootContent[]
function applyDiffLine(
  diffSegments: DiffLineSegment[],
  line: ElementContent[],
): ElementContent[]
function applyDiffLine<T extends ElementContent>(
  diffSegments: DiffLineSegment[],
  line: T[],
): T[] {
  const newLine: T[] = []

  // We process both the diff segments and the line nodes at the same time,
  // until we run out of either.
  // This way we go over them at most once.
  while (diffSegments.length > 0 && line.length > 0) {
    const segment = diffSegments[0]
    const node = line[0]

    if (node.type === 'text') {
      // If the current node is a text node, we can apply the diff segment to it.
      const [newNode, lengthCovered] = applyDiffSegment(segment, node)
      newLine.push(newNode as T)

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
      const childLine = applyDiffLine(diffSegments, [...node.children])
      newLine.push({ ...node, children: childLine })
      line.shift()
    } else {
      // Otherwise we can't apply the diff segment to this node, so we leave it as is.
      newLine.push(node)
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
 * Adds word-diff highlighting segments to the given lines according to a diff.
 *
 * @param fileDiff - The diff to apply.
 * @param linesBefore - The lines before the changes, to modify in-place.
 * @param linesAfter - The lines after the changes, to modify in-place.
 */
const addWordDiff = (
  fileDiff: FileDiff,
  linesBefore: RootContent[][],
  linesAfter: RootContent[][],
) => {
  let pointerBefore = 0
  let pointerAfter = 0

  for (const diffLine of fileDiff) {
    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    match(diffLine.type)
      .with('added', () => {
        linesAfter[pointerAfter] = applyDiffLine(
          [...diffLine.content],
          [...lineAfter],
        )
        pointerAfter++
      })
      .with('removed', () => {
        linesBefore[pointerBefore] = applyDiffLine(
          [...diffLine.content],
          [...lineBefore],
        )
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
 */
export const highlightDiff = (fileDiff: FileDiff, path: string): ReactNode => {
  // Recover the contents of the file from the diff, before and after.
  // Then syntax-highlight both versions completely.
  const treeBefore = getTree(getContentBefore(fileDiff), path)
  const treeAfter = getTree(getContentAfter(fileDiff), path)

  // Split the syntax-highlighted trees into lines, so we can interleave them
  // according to the diff, without losing the syntax highlighting.
  const linesBefore = treeBefore ? splitIntoLines(treeBefore) : []
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []

  // Modify the lines in-place to add word-diff highlighting segments.
  addWordDiff(fileDiff, linesBefore, linesAfter)

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
        res.push(...lineAfter, { type: 'text', value: '\n' })
        pointerAfter++
      })
      .with('removed', () => {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
      })
      .with('unchanged', () => {
        res.push(...lineBefore, { type: 'text', value: '\n' })
        pointerBefore++
        pointerAfter++
      })
      .exhaustive()
  }

  return renderTree({ type: 'root', children: res })
}

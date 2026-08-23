import { all, createStarryNight } from '@wooorm/starry-night'
import type { Element, Root, Text } from 'hast'
import { expose } from 'threads/worker'
import { match } from 'ts-pattern'

import type {
  ConflictType,
  DiffLine,
  DiffLineSegment,
  DiffType,
  FileConflicts,
  FileDiff,
} from '@/api/models'

import type {
  DiffFilter,
  HighlightedContent,
  HighlightJob,
  LineNode,
  LineType,
  ViewerRow,
} from './utils'

/**
 * This module owns the syntax highlighter which is expensive to initialize and to run.
 */
type StarryNight = Awaited<ReturnType<typeof createStarryNight>>

let starryNight: StarryNight | undefined
let starryNightPromise: Promise<StarryNight> | undefined

/**
 * Loads the syntax highlighter's grammars, reusing the same instance across calls.
 */
const initHighlighter = (): Promise<StarryNight> => {
  if (!starryNightPromise) {
    starryNightPromise = createStarryNight(all).then((instance) => {
      starryNight = instance
      return instance
    })
  }

  return starryNightPromise
}

const NEWLINE_REGEX = /\r\n|\r|\n/

/**
 * Builds a syntax-highlighted tree for the given content and language identifier.
 *
 * @param content - The full content to highlight.
 * @param identifier - The language identifier (can be a filepath).
 */
const getTree = (content: string, identifier: string): Root => {
  if (!starryNight) {
    throw new Error('The syntax highlighter has not finished initializing.')
  }

  const scope = starryNight.flagToScope(identifier)
  if (!scope) {
    return {
      type: 'root',
      children: [{ type: 'text', value: content }],
    }
  }

  return starryNight.highlight(content, scope)
}

/**
 * Splits a syntax-highlighted tree into lines.
 *
 * @param tree - The hast tree to split.
 */
const splitIntoLines = (tree: Root): LineNode[][] => {
  const lines: LineNode[][] = []
  let line: LineNode[] = []

  tree.children.forEach((node) => {
    if (node.type === 'text') {
      const parts = node.value.split(NEWLINE_REGEX)
      parts.forEach((part, index) => {
        if (index > 0) {
          line.push({ type: 'text', value: '\n' })
          lines.push(line)
          line = []
        }

        if (part.length > 0) {
          line.push({ ...node, value: part })
        }
      })
    } else if (node.type === 'element') {
      line.push(node)
    }
  })

  if (line.length > 0) {
    lines.push(line)
  }

  return lines
}

/**
 * Builds a shallow copy of the relevant children of a node.
 *
 * @param node - The node to get the children of.
 */
const getNodeChildren = (node: Element): LineNode[] => {
  const res: LineNode[] = []

  for (const child of node.children) {
    if (child.type === 'text' || child.type === 'element') {
      res.push(child)
    }
  }

  return res
}

/**
 * Wraps the given node with the appropriate highlighting for the given segment type.
 *
 * @param node - The node to wrap.
 * @param type - The type to apply.
 */
const wrapNodeInType = (node: Text, type: LineType): LineNode => {
  return match(type)
    .returnType<LineNode>()
    .with('added', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-success-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('removed', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-danger-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('ours', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-primary-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('theirs', () => ({
      type: 'element',
      tagName: 'span',
      properties: {
        className: 'bg-warning-400/15 py-0.5',
      },
      children: [node],
    }))
    .with('unchanged', () => node)
    .exhaustive()
}

/**
 * Wraps the given line with the appropriate highlighting for the given line type.
 *
 * @param line - The line to wrap.
 * @param type - The type to apply.
 */
const wrapLineInType = (line: LineNode[], type: LineType): Element => {
  return match(type)
    .returnType<Element>()
    .with('added', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-success-500/8 block w-max min-w-full -ml-2 pl-2 pr-5',
      },
    }))
    .with('removed', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-danger-500/8 block w-max min-w-full -ml-2 pl-2 pr-5',
      },
    }))
    .with('ours', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-primary-500/8 block w-max min-w-full -ml-2 pl-2 pr-5',
      },
    }))
    .with('theirs', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: {
        className: 'bg-warning-500/8 block w-max min-w-full -ml-2 pl-2 pr-5',
      },
    }))
    .with('unchanged', () => ({
      type: 'element',
      children: line,
      tagName: 'span',
      properties: { className: 'block w-max min-w-full -ml-2 pl-2 pr-5' },
    }))
    .exhaustive()
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

type ChangedLineType = Exclude<LineType, 'unchanged'>

/**
 * Applies a diff segment to a text node, returning a new node
 * and the number of characters covered.
 *
 * @param diffSegment - The diff segment to apply.
 * @param node - The text node to apply it to.
 * @param lineType - The type of the line the segment belongs to.
 */
const applyDiffSegment = (
  diffSegment: DiffLineSegment,
  node: Text,
  lineType: ChangedLineType,
): [LineNode, number] => {
  const nodeLength = node.value.length
  const segmentType =
    getDiffSegmentType(diffSegment) === 'unchanged' ? 'unchanged' : lineType
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
 * @param lineType - The type of the line the segments belong to.
 */
const applyDiffLineInner = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
  lineType: ChangedLineType,
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
      const [newNode, lengthCovered] = applyDiffSegment(segment, node, lineType)
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
      const childLine = applyDiffLineInner(
        diffSegments,
        getNodeChildren(node),
        lineType,
      )
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
 * @param lineType - The type of the line the newline belongs to.
 */
const addVisibleNewlines = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
  lineType: ChangedLineType,
) => {
  const lastSegment = diffSegments.at(-1)

  if (line.length > 0 && lastSegment) {
    if (
      getDiffSegmentType(lastSegment) !== 'unchanged' &&
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
          className: match(lineType)
            .with('added', () => 'text-success-300/90 py-0.5 select-none')
            .with('removed', () => 'text-danger-300/90 py-0.5 select-none')
            .with('ours', () => 'text-primary-300/90 py-0.5 select-none')
            .with('theirs', () => 'text-warning-300/90 py-0.5 select-none')
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
 * @param lineType - The type of the line the segments belong to.
 */
const applyDiffLine = (
  diffSegments: DiffLineSegment[],
  line: LineNode[],
  lineType: ChangedLineType,
): LineNode[] => {
  const newLine = [...line]
  const newSegments = [...diffSegments]

  addVisibleNewlines(newSegments, newLine, lineType)

  return applyDiffLineInner(newSegments, newLine, lineType)
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
        linesAfter[pointerAfter] = applyDiffLine(
          diffLine.content,
          lineAfter,
          'added',
        )
        pointerAfter++
      })
      .with('removed', () => {
        linesBefore[pointerBefore] = applyDiffLine(
          diffLine.content,
          lineBefore,
          'removed',
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
 * @param filter - A filter indicating which parts of the diff to show.
 * @param showWordDiffs - Whether to add word-diff highlighting segments.
 */
const buildDiffRows = (
  fileDiff: FileDiff,
  path: string,
  filter: DiffFilter,
  showWordDiffs: boolean,
): HighlightedContent => {
  // Recover the contents of the file from the diff, before and after.
  // Then syntax-highlight both versions completely.
  const contentBefore = getContentBefore(fileDiff)
  const contentAfter = getContentAfter(fileDiff)

  const treeBefore = getTree(contentBefore, path)
  const treeAfter = getTree(contentAfter, path)

  // Split the syntax-highlighted trees into lines, so we can interleave them
  // according to the diff, without losing the syntax highlighting.
  const linesBefore = treeBefore ? splitIntoLines(treeBefore) : []
  const linesAfter = treeAfter ? splitIntoLines(treeAfter) : []

  if (showWordDiffs) {
    // Modify the lines in-place to add word-diff highlighting segments.
    addWordDiff(fileDiff, linesBefore, linesAfter)
  }

  // We use pointers to track which lines we're going to provide when the diff
  // asks for a line from before or after.
  let pointerBefore = 0
  let pointerAfter = 0

  /** Staggers numbers over sequences of deletions in inline mode. */
  let offset = 0
  /** Counts lines hidden by the filter. */
  let ignored = 0
  let deletions = 0
  let maxLineLength = 0

  const rows: ViewerRow[] = []

  const pushRow = (line: DiffLine, content: LineNode[], pos: number) => {
    rows.push({
      key: `${pos}`,
      type: line.type,
      lineNumber: pos + 1 + offset - ignored,
      content: wrapLineInType(content, line.type),
    })

    const lineLength = line.content.reduce(
      (acc, segment) => acc + segment.length - 1,
      0,
    )
    maxLineLength = Math.max(maxLineLength, lineLength)
  }

  fileDiff.forEach((diffLine, i) => {
    if (filter === 'both') {
      if (diffLine.type === 'removed') {
        deletions++
      } else if (deletions > 0) {
        offset -= deletions
        deletions = 0
      }
    }

    const lineBefore = linesBefore.at(pointerBefore) ?? []
    const lineAfter = linesAfter.at(pointerAfter) ?? []

    match(diffLine.type)
      .with('added', () => {
        // If this is an added line, we take it from the "after" content.
        if (filter !== 'theirs') {
          pushRow(diffLine, lineAfter, i)
        } else {
          ignored++
        }
        pointerAfter++
      })
      .with('removed', () => {
        // If this is a removed line, we take it from the "before" content.
        if (filter !== 'ours') {
          pushRow(diffLine, lineBefore, i)
        } else {
          ignored++
        }
        pointerBefore++
      })
      .with('unchanged', () => {
        // If this is an unchanged line, either one should be the same,
        // and so we move both pointers.
        pushRow(diffLine, lineBefore, i)
        pointerBefore++
        pointerAfter++
      })
      .exhaustive()
  })

  return {
    rows,
    maxLineLength,
    finalLineNumber: fileDiff.length + 1 + offset - ignored,
  }
}

/**
 * Recovers the full content of a file from a diff, from our changes.
 *
 * @param fileConflicts - The diff to recover the content from.
 */
const getContentOurs = (fileConflicts: FileConflicts): string => {
  return fileConflicts
    .filter((line) => line.type !== 'theirs')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

/**
 * Recovers the full content of a file from a diff, from their changes.
 *
 * @param fileConflicts - The diff to recover the content from.
 */
const getContentTheirs = (fileConflicts: FileConflicts): string => {
  return fileConflicts
    .filter((line) => line.type !== 'ours')
    .map((line) => line.content.map((segment) => segment.slice(1)).join(''))
    .join('')
}

/**
 * Adds word-diff highlighting segments to the given lines according to a conflict.
 *
 * Each side carries its own segments, measured against the merge base, so the two
 * are applied independently.
 *
 * @param fileConflicts - The conflicts to apply.
 * @param linesOurs - Our lines, to modify in-place.
 * @param linesTheirs - Their lines, to modify in-place.
 */
const addConflictWordDiff = (
  fileConflicts: FileConflicts,
  linesOurs: LineNode[][],
  linesTheirs: LineNode[][],
) => {
  let pointerOurs = 0
  let pointerTheirs = 0

  for (const conflictLine of fileConflicts) {
    const lineOurs = linesOurs.at(pointerOurs) ?? []
    const lineTheirs = linesTheirs.at(pointerTheirs) ?? []

    match(conflictLine.type)
      .with('ours', () => {
        linesOurs[pointerOurs] = applyDiffLine(
          conflictLine.content,
          lineOurs,
          'ours',
        )
        pointerOurs++
      })
      .with('theirs', () => {
        linesTheirs[pointerTheirs] = applyDiffLine(
          conflictLine.content,
          lineTheirs,
          'theirs',
        )
        pointerTheirs++
      })
      .with('unchanged', () => {
        pointerOurs++
        pointerTheirs++
      })
      .exhaustive()
  }
}

/**
 * Builds the row that introduces a conflict section.
 *
 * @param type - The type of conflict section.
 * @param pos - The position of the line that starts the section.
 */
const getSeparatorRow = (
  type: Exclude<ConflictType, 'unchanged'>,
  pos: number,
): ViewerRow => {
  const label = match(type)
    .with('ours', () => 'Ours')
    .with('theirs', () => 'Theirs')
    .exhaustive()
  const colorClass = match(type)
    .with('ours', () => 'text-primary-500')
    .with('theirs', () => 'text-warning-500')
    .exhaustive()

  return {
    key: `separator-${pos}`,
    type,
    lineNumber: undefined,
    empty: true,
    content: wrapLineInType(
      [
        {
          type: 'element',
          tagName: 'p',
          properties: {
            className: `${colorClass} italic select-none text-xs leading-4.5`,
          },
          children: [{ type: 'text', value: label }],
        },
      ],
      type,
    ),
  }
}

/**
 * Adds syntax and conflict highlighting to a file's conflicts.
 *
 * @param fileConflicts - The conflicts to highlight.
 * @param path - The path of the file with conflicts (used to determine the language).
 * @param showWordDiffs - Whether to add word-diff highlighting segments.
 */
const buildConflictRows = (
  fileConflicts: FileConflicts,
  path: string,
  showWordDiffs: boolean,
): HighlightedContent => {
  // Recover the contents of the file from the conflict, ours and theirs.
  // Then syntax-highlight both versions completely.
  const contentOurs = getContentOurs(fileConflicts)
  const contentTheirs = getContentTheirs(fileConflicts)

  const treeOurs = getTree(contentOurs, path)
  const treeTheirs = getTree(contentTheirs, path)

  // Split the syntax-highlighted trees into lines, so we can interleave them
  // according to the conflicts, without losing the syntax highlighting.
  const linesOurs = treeOurs ? splitIntoLines(treeOurs) : []
  const linesTheirs = treeTheirs ? splitIntoLines(treeTheirs) : []

  if (showWordDiffs) {
    // Modify the lines in-place to add word-diff highlighting segments.
    addConflictWordDiff(fileConflicts, linesOurs, linesTheirs)
  }

  // We use pointers to track which lines we're going to provide when the conflict
  // asks for a line from one side or the other.
  let pointerOurs = 0
  let pointerTheirs = 0
  let maxLineLength = 0

  /** Staggers numbers over the sides of a conflict, so they cover the same lines. */
  let offset = 0
  let ourLines = 0
  let theirLines = 0

  const rows: ViewerRow[] = []
  let currentSection: ConflictType = 'unchanged'

  fileConflicts.forEach((conflictLine, i) => {
    // Their side of a conflict restarts at the number ours began on, and the
    // lines after it resume from where ours ended.
    if (conflictLine.type === 'theirs') {
      if (theirLines === 0) {
        offset -= ourLines
      }
      theirLines++
    } else {
      if (theirLines > 0) {
        offset += ourLines - theirLines
        ourLines = 0
        theirLines = 0
      }

      ourLines = conflictLine.type === 'ours' ? ourLines + 1 : 0
    }

    // Each time we enter a new side of a conflict, we introduce it with a separator.
    if (
      conflictLine.type !== currentSection &&
      conflictLine.type !== 'unchanged'
    ) {
      rows.push(getSeparatorRow(conflictLine.type, i))
    }
    currentSection = conflictLine.type

    const lineOurs = linesOurs.at(pointerOurs) ?? []
    const lineTheirs = linesTheirs.at(pointerTheirs) ?? []

    const line = match(conflictLine.type)
      .with('theirs', () => {
        // If this is their line, we take it from the "theirs" content.
        pointerTheirs++
        return lineTheirs
      })
      .with('ours', () => {
        // If this is our line, we take it from the "ours" content.
        pointerOurs++
        return lineOurs
      })
      .with('unchanged', () => {
        // If this is an unchanged line, either one should be the same,
        // and so we move both pointers.
        pointerOurs++
        pointerTheirs++
        return lineOurs
      })
      .exhaustive()

    rows.push({
      key: `${i}`,
      type: conflictLine.type,
      lineNumber: i + 1 + offset,
      content: wrapLineInType(line, conflictLine.type),
    })

    const lineLength = conflictLine.content.reduce(
      (acc, segment) => acc + segment.length - 1,
      0,
    )
    maxLineLength = Math.max(maxLineLength, lineLength)
  })

  return {
    rows,
    maxLineLength,
    finalLineNumber: pointerOurs + 1,
  }
}

/**
 * The highlighting worker. Exposes the work as a plain async function.
 */
const highlighter = {
  async highlight(job: HighlightJob): Promise<HighlightedContent> {
    await initHighlighter()

    return match(job)
      .with({ type: 'diff' }, (req) =>
        buildDiffRows(req.fileDiff, req.path, req.filter, req.showWordDiffs),
      )
      .with({ type: 'conflicts' }, (req) =>
        buildConflictRows(req.fileConflicts, req.path, req.showWordDiffs),
      )
      .exhaustive()
  },
}

export type Highlighter = typeof highlighter

expose(highlighter)

import type { ReactNode } from 'react'
import type { Element, Text } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { spawn } from 'threads'

import type {
  DiffType,
  FileConflicts,
  FileDiff,
  MergeDiffStage,
} from '@/api/models'

import type { Highlighter } from './worker'

export type LineType = DiffType | MergeDiffStage

export type LineNode = Element | Text

export const DIFF_FILTERS = ['ours', 'theirs', 'both'] as const
export type DiffFilter = (typeof DIFF_FILTERS)[number]

/**
 * A unit of work handed to the highlighting worker.
 */
export type HighlightJob =
  | {
      type: 'diff'
      fileDiff: FileDiff
      path: string
      filter: DiffFilter
      showWordDiffs: boolean
    }
  | {
      type: 'conflicts'
      fileConflicts: FileConflicts
      path: string
    }

export const ROW_HEIGHT = 26

export const SEPARATOR_HEIGHT = 18

export interface ViewerRow {
  /**
   * The row's unique identifier.
   */
  key: string

  /**
   * The type of the line.
   */
  type: LineType

  /**
   * The line number to display, if any.
   */
  lineNumber: number | undefined

  /**
   * Whether the row only introduces a section, and carries no line of its own.
   */
  empty?: boolean

  /**
   * The syntax-highlighted contents of the row.
   */
  content: Element
}

/**
 * The fully highlighted contents of a file viewer.
 */
export interface HighlightedContent {
  /**
   * The rows to display.
   */
  rows: ViewerRow[]

  /**
   * The length in characters of the longest line.
   */
  maxLineLength: number

  /**
   * The line number of the trailing filler row.
   */
  finalLineNumber: number
}

/**
 * The single highlighting worker, spawned lazily so its grammars are only
 * loaded once a file actually needs to be highlighted.
 */
let highlighterPromise: Promise<Highlighter> | undefined

const getHighlighter = (): Promise<Highlighter> => {
  highlighterPromise ??= spawn<Highlighter>(
    new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
  )

  return highlighterPromise
}

/**
 * Highlights a file's contents in the worker.
 *
 * @param job - The contents to highlight.
 * @param signal - A signal to abandon the job before it starts.
 */
export const highlight = async (
  job: HighlightJob,
  signal?: AbortSignal,
): Promise<HighlightedContent> => {
  signal?.throwIfAborted()

  const highlighter = await getHighlighter()
  return highlighter.highlight(job)
}

/**
 * Renders a chunk of highlighted rows into a React node.
 *
 * @param rows - The rows to render.
 */
export const renderRows = (rows: ViewerRow[]): ReactNode =>
  toJsxRuntime(
    { type: 'root', children: rows.map((row) => row.content) },
    { Fragment, jsx, jsxs },
  )

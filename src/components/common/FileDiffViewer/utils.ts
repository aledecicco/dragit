import { match } from 'ts-pattern'

import type { DiffLine, DiffLineSegment, DiffType } from '@/api/models'

/**
 * Gets the type of a diff segment based on its first character.
 *
 * @param segment - The segment to get the diff type for.
 */
export const getDiffSegmentType = (segment: DiffLineSegment): DiffType => {
  return match(segment.at(0))
    .returnType<DiffType>()
    .with('+', () => 'added')
    .with('-', () => 'removed')
    .otherwise(() => 'unchanged')
}

/**
 * @param diffLine - The line to check.
 * @returns Whether the line contains any added segments.
 */
export const lineHasAdditions = (diffLine: DiffLine): boolean => {
  return diffLine.some((segment) => getDiffSegmentType(segment) === 'added')
}

/**
 * @param diffLine - The line to check.
 * @returns Whether the line contains any removed segments.
 */
export const lineHasRemovals = (diffLine: DiffLine): boolean => {
  return diffLine.some((segment) => getDiffSegmentType(segment) === 'removed')
}

/**
 * Gets the type of a line in a diff based on its segments. If any segment is an addition,
 * the line is considered an addition. If not, and if any segment is a removal, the line is considered
 * a removal. Otherwise, the line is considered unchanged.
 *
 * @param line - The line to get the diff type for.
 */
export const getDiffLineType = (line: DiffLine): DiffType => {
  if (lineHasAdditions(line)) {
    return 'added'
  }

  if (lineHasRemovals(line)) {
    return 'removed'
  }

  return 'unchanged'
}

/**
 * Checks whether a line contains both added and removed segments.
 *
 * @param line - The line to check.
 */
export const isCompositeLine = (line: DiffLine): boolean => {
  return lineHasAdditions(line) && lineHasRemovals(line)
}

import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType, LineDiff } from '@/api/models'

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
 * Gets the type of a line in a diff based on its segments. If any segment is an addition,
 * the line is considered an addition. If not, and if any segment is a removal, the line is considered
 * a removal. Otherwise, the line is considered unchanged.
 *
 * @param line - The line to get the diff type for.
 */
export const getLineDiffType = (line: LineDiff): DiffType => {
  if (line.some((segment) => getDiffSegmentType(segment) === 'added')) {
    return 'added'
  }

  if (line.some((segment) => getDiffSegmentType(segment) === 'removed')) {
    return 'removed'
  }

  return 'unchanged'
}

/**
 * Checks whether a line contains both added and removed segments.
 *
 * @param line - The line to check.
 */
export const isCompositeLine = (line: LineDiff): boolean => {
  return (
    line.some((segment) => getDiffSegmentType(segment) === 'added') &&
    line.some((segment) => getDiffSegmentType(segment) === 'removed')
  )
}

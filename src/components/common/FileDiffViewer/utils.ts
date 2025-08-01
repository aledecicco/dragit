import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType, LineDiff } from '@/api/models'

export const getDiffSegmentType = (segment: DiffLineSegment): DiffType => {
  return match(segment.at(0))
    .returnType<DiffType>()
    .with('+', () => 'added')
    .with('-', () => 'removed')
    .otherwise(() => 'unchanged')
}

export const getLineDiffType = (line: LineDiff): DiffType => {
  for (const segment of line) {
    const diffType = getDiffSegmentType(segment)
    if (diffType !== 'unchanged') {
      return diffType
    }
  }

  return 'unchanged'
}

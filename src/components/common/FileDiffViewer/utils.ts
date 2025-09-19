import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType } from '@/api/models'

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

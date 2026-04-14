import type { ReactNode } from 'react'
import { match, P } from 'ts-pattern'

import type { FileDiff } from '@/api/models'
import { cn } from '@/utils/styles'

import { LineIndicator } from '../../common/LineIndicator'
import { LineNumber } from '../../common/LineNumber'
import type { DiffFilter } from '../utils'

/**
 * Generates the line indicators for a given file diff.
 */
export const getLineIndicators = (
  content: FileDiff,
  filter: DiffFilter,
): ReactNode => {
  const res: ReactNode[] = []

  content.forEach((line, i) => {
    const show = match([filter, line.type])
      .with(['both', P._], () => true)
      .with(['ours', P.select()], (lineType) => lineType !== 'removed')
      .with(['theirs', P.select()], (lineType) => lineType !== 'added')
      .exhaustive()

    if (show) {
      res.push(<LineIndicator key={`${i + 1}`} type={line.type} />)
    }
  })

  res.push(<LineIndicator type="unchanged" className={cn('grow')} empty />)

  return res
}

/**
 * Generates the line numbers for a given file diff.
 *
 * In inline mode, staggers line numbers when there's a sequence of deletions to keep them aligned
 * with the actual lines in the resulting file.
 */
export const getLineNumbers = (
  content: FileDiff,
  filter: DiffFilter = 'both',
): ReactNode => {
  const res: ReactNode[] = []

  let offset = 0
  let ignored = 0
  let deletions = 0

  content.forEach((line, i) => {
    match(filter)
      .with('both', () => {
        if (line.type === 'removed') {
          deletions++
        } else if (deletions > 0) {
          offset -= deletions
          deletions = 0
        }

        res.push(
          <LineNumber
            key={`${i + 1}`}
            type={line.type}
            lineNumber={i + 1 + offset}
          />,
        )
      })
      .with('ours', () => {
        if (line.type !== 'removed') {
          res.push(
            <LineNumber
              key={`${i + 1}`}
              type={line.type}
              lineNumber={i + 1 - ignored}
            />,
          )
        } else {
          ignored++
        }
      })
      .with('theirs', () => {
        if (line.type !== 'added') {
          res.push(
            <LineNumber
              key={`${i + 1}`}
              type={line.type}
              lineNumber={i + 1 - ignored}
            />,
          )
        } else {
          ignored++
        }
      })
      .exhaustive()
  })

  res.push(
    <LineNumber
      key={content.length + 1}
      type="unchanged"
      className={cn('grow rounded-bl-sm')}
      lineNumber={content.length + 1 + offset - ignored}
      faded
    />,
  )

  return res
}

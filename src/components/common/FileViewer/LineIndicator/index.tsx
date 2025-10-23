import type { ComponentProps, ReactNode } from 'react'
import { match, P } from 'ts-pattern'

import {
  type ConflictType,
  conflictTypes,
  type FileConflicts,
  type FileDiff,
} from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

import type { DiffFilter } from '../Diff/utils'
import type { LineType } from '../utils'

interface LineIndicatorProps extends ComponentProps<'div'> {
  /**
   * The type of line being displayed.
   */
  type: LineType

  /**
   * Whether this cell should be empty.
   */
  empty?: boolean
}

/**
 * Displays an indicator of a line's type with the appropriate styling.
 */
const LineIndicator = (props: LineIndicatorProps) => {
  const { type, empty, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'h-7 flex flex-row justify-center font-mono',
        'w-4 py-1.25 font-bold',
        match(type)
          .with('added', () => 'bg-success-500/30 text-success-500')
          .with('removed', () => 'bg-danger-600/30 text-danger-600')
          .with('ours', () => 'bg-primary-500/30 text-primary-500')
          .with('theirs', () => 'bg-warning-600/30 text-warning-600')
          .with('unchanged', () => 'bg-dark-600 text-light-950')
          .exhaustive(),
      )}
    >
      {!empty &&
        match(type)
          .with('added', () => '+')
          .with('removed', () => '-')
          .with('ours', () => '<')
          .with('theirs', () => '>')
          .with('unchanged', () => ' ')
          .exhaustive()}
    </div>
  )
}

const getLineIndicators = (
  content: FileDiff | FileConflicts,
  filter: DiffFilter = 'both',
): ReactNode => {
  const res: ReactNode[] = []
  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    const show = match([filter, line.type])
      .with(['both', P._], () => true)
      .with(['ours', P.select()], (lineType) => lineType !== 'removed')
      .with(['theirs', P.select()], (lineType) => lineType !== 'added')
      .exhaustive()

    if (show) {
      if (
        sectionType !== line.type &&
        (line.type === 'ours' || line.type === 'theirs')
      ) {
        res.push(
          <LineIndicator
            key={`indicator-${i + 1}`}
            type={line.type}
            empty
            className="h-4.5"
          />,
        )
      }

      res.push(<LineIndicator key={`${i + 1}`} type={line.type} />)
    }

    if (
      line.type === 'ours' ||
      line.type === 'theirs' ||
      line.type === 'unchanged'
    ) {
      sectionType = line.type
    }
  })

  res.push(<LineIndicator className={cn('grow')} type="unchanged" empty />)

  return res
}

export { LineIndicator, getLineIndicators, type LineIndicatorProps }

import type { ComponentProps } from 'react'
import { match, P } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

import type { DiffFilter } from '../utils'

interface DiffViewerLineChangesProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: FileDiff

  /**
   * A filter indicating which parts of the diff to show changes for.
   */
  filter: DiffFilter
}

/**
 * Displays a column with the diff type of each line in a diff viewer.
 */
const DiffViewerLineChanges = (props: DiffViewerLineChangesProps) => {
  const { fileDiff, filter, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'flex flex-col select-none')}>
      {fileDiff.map((diffLine, i) => {
        const show = match([filter, diffLine.type])
          .with(['both', P._], () => true)
          .with(['ours', P.select()], (lineType) => lineType !== 'removed')
          .with(['theirs', P.select()], (lineType) => lineType !== 'added')
          .exhaustive()

        if (show) {
          return <LineChangeCell key={`${i + 1}`} diffType={diffLine.type} />
        }
      })}

      <LineChangeCell className={cn('grow')} diffType="unchanged" empty />
    </div>
  )
}

interface LineChangeCellProps extends ComponentProps<'div'> {
  /**
   * The type of diff for the line.
   */
  diffType: DiffType

  /**
   * Whether this cell should be empty.
   */
  empty?: boolean
}

/**
 * Displays a single diff type for a line with the appropriate styling.
 */
const LineChangeCell = (props: LineChangeCellProps) => {
  const { diffType, empty, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'h-7 flex flex-row justify-center font-mono',
        'w-4 py-1.25 font-bold',
        match(diffType)
          .with('added', () => 'bg-success-500/30 text-success-500')
          .with('removed', () => 'bg-danger-600/30 text-danger-600')
          .with('unchanged', () => 'bg-dark-600 text-light-950')
          .exhaustive(),
      )}
    >
      {!empty &&
        match(diffType)
          .with('added', () => '+')
          .with('removed', () => '-')
          .with('unchanged', () => ' ')
          .exhaustive()}
    </div>
  )
}

export { DiffViewerLineChanges, type DiffViewerLineChangesProps }

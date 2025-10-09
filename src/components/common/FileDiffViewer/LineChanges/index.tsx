import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

interface DiffViewerLineChangesProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: FileDiff
}

/**
 * Displays a column with the diff type of each line in a diff viewer.
 */
const DiffViewerLineChanges = (props: DiffViewerLineChangesProps) => {
  const { fileDiff, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'flex flex-col select-none')}>
      {fileDiff.map((diffLine, i) => (
        <LineChangeCell key={`${i + 1}`} diffType={diffLine.type} />
      ))}

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

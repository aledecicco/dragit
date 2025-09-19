import { type ComponentProps, Fragment } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { getDiffSegmentType } from '../utils'

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
    <div {...propsWithCn(divProps, 'select-none row-start-1 -row-end-1')}>
      {fileDiff.map((diffLine, i) => (
        <LineChangesCell key={`${i + 1}`} diffType={diffLine.type} />
      ))}

      <LineChangesCell diffType={fileDiff.at(-1)?.type ?? 'unchanged'} empty />
    </div>
  )
}

/**
 * Displays a single diff type for a line with the appropriate styling.
 *
 * @param props.diffType - The type of diff for the line.
 * @param props.empty - Whether this cell should be empty.
 */
const LineChangesCell = (props: { diffType: DiffType; empty?: boolean }) => {
  const { diffType, empty } = props

  return (
    <div
      className={cn(
        'h-7 flex flex-row items-center justify-center font-mono',
        'w-4 font-bold',
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

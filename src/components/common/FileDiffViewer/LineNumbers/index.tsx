import type { ComponentProps, ReactNode } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

import type { DiffFilter } from '../utils'

interface DiffViewerLineNumbersProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: FileDiff

  /**
   * A filter indicating which parts of the diff to show line numbers for.
   */
  filter: DiffFilter
}

/**
 * Displays a column with the line numbers of each line in a diff viewer.
 */
const DiffViewerLineNumbers = (props: DiffViewerLineNumbersProps) => {
  const { fileDiff, filter, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'flex flex-col select-none')}>
      {getLineNumbers(fileDiff, filter)}
    </div>
  )
}

interface LineNumberCellProps extends ComponentProps<'div'> {
  /**
   * The line number to display.
   */
  lineNumber: number | undefined

  /**
   * The type of diff for the line.
   */
  diffType: DiffType

  /**
   * Whether to display the line number in a faded style.
   */
  faded?: boolean
}

/**
 * Displays a single line number with the appropriate styling based on its diff type.
 *
 * @param props.lineNumber - The line number to display.
 * @param props.diffType - The type of diff for the line.
 * @param props.faded - Whether to display the line number in a faded style.
 */
const LineNumberCell = (props: LineNumberCellProps) => {
  const { lineNumber, diffType, faded, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'h-7 flex flex-row font-mono',
        'text-xs w-15 px-1 py-1.75 overflow-hidden',
        match(diffType)
          .with('added', () => [
            'bg-success-500/30',
            faded ? 'text-success-700/70' : 'text-success-500',
          ])
          .with('removed', () => [
            'bg-danger-600/30',
            faded ? 'text-danger-800/70' : 'text-danger-600',
          ])
          .with('unchanged', () => [
            'bg-dark-600',
            faded ? 'text-light-950/30' : 'text-light-950',
          ])
          .exhaustive(),
      )}
    >
      {lineNumber}
    </div>
  )
}

/**
 * Generates the line numbers for a given file diff.
 *
 * In inline mode, staggers line numbers when there's a sequence of deletions to keep them aligned
 * with the actual lines in the resulting file.
 */
const getLineNumbers = (fileDiff: FileDiff, filter: DiffFilter): ReactNode => {
  const res = []

  let offset = 0
  let ignored = 0
  let deletions = 0

  fileDiff.forEach((diffLine, i) => {
    match(filter)
      .with('both', () => {
        if (diffLine.type === 'removed') {
          deletions++
        } else if (deletions > 0) {
          offset -= deletions
          deletions = 0
        }

        res.push(
          <LineNumberCell
            key={`${i + 1}`}
            lineNumber={i + 1 + offset}
            diffType={diffLine.type}
          />,
        )
      })
      .with('ours', () => {
        if (diffLine.type !== 'removed') {
          res.push(
            <LineNumberCell
              key={`${i + 1}`}
              lineNumber={i + 1 - ignored}
              diffType={diffLine.type}
            />,
          )
        } else {
          ignored++
        }
      })
      .with('theirs', () => {
        if (diffLine.type !== 'added') {
          res.push(
            <LineNumberCell
              key={`${i + 1}`}
              lineNumber={i + 1 - ignored}
              diffType={diffLine.type}
            />,
          )
        } else {
          ignored++
        }
      })
      .exhaustive()
  })

  res.push(
    <LineNumberCell
      key={fileDiff.length + 1}
      lineNumber={fileDiff.length + 1 + offset - ignored}
      diffType="unchanged"
      faded
      className={cn('grow rounded-bl-sm')}
    />,
  )

  return res
}

export { DiffViewerLineNumbers, type DiffViewerLineNumbersProps }

import type { ComponentProps, ReactNode } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

interface DiffViewerLineNumbersProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: FileDiff
}

/**
 * Displays a column with the line numbers of each line in a diff viewer.
 */
const DiffViewerLineNumbers = (props: DiffViewerLineNumbersProps) => {
  const { fileDiff, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'select-none row-start-1 -row-end-1')}>
      {getLineNumbers(fileDiff)}
    </div>
  )
}

/**
 * Displays a single line number with the appropriate styling based on its diff type.
 *
 * @param props.lineNumber - The line number to display.
 * @param props.diffType - The type of diff for the line.
 * @param props.faded - Whether to display the line number in a faded style.
 */
const LineNumbersCell = (props: {
  lineNumber: number | undefined
  diffType: DiffType
  faded?: boolean
}) => {
  const { lineNumber, diffType, faded } = props

  return (
    <div
      className={cn(
        'h-7 flex flex-row items-center font-mono',
        'text-xs w-15 px-1 overflow-hidden',
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

const getLineNumbers = (fileDiff: FileDiff): ReactNode => {
  const res = []

  let offset = 0
  let removals = 0

  fileDiff.forEach((diffLine, i) => {
    if (diffLine.type === 'removed') {
      removals++
    } else if (removals > 0) {
      offset -= removals
      removals = 0
    }

    res.push(
      <LineNumbersCell
        key={`${i + 1}`}
        lineNumber={i + 1 + offset}
        diffType={diffLine.type}
      />,
    )
  })

  res.push(
    <LineNumbersCell
      lineNumber={fileDiff.length + 1 + offset}
      diffType={fileDiff.at(-1)?.type ?? 'unchanged'}
      faded
    />,
  )

  return res
}

export { DiffViewerLineNumbers, type DiffViewerLineNumbersProps }

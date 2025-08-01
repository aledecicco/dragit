import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, LineDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { getLineDiffType } from '../utils'

interface DiffViewerLineNumbersProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: LineDiff[]
}

/**
 * Displays a column with the line numbers of each line in a diff viewer.
 */
const DiffViewerLineNumbers = (props: DiffViewerLineNumbersProps) => {
  const { fileDiff, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'select-none row-start-1 -row-end-1')}>
      {fileDiff.map((line, i) => {
        const diffType = getLineDiffType(line)
        return (
          <LineNumbersCell
            key={`${diffType}-${i + 1}`}
            lineNumber={i + 1}
            diffType={diffType}
          />
        )
      })}

      <LineNumbersCell
        lineNumber={fileDiff.length + 1}
        diffType={mapFn(fileDiff.at(-1), getLineDiffType) ?? 'unchanged'}
        faded
      />
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
  lineNumber: number
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

export { DiffViewerLineNumbers, type DiffViewerLineNumbersProps }

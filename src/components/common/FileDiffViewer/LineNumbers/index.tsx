import { type ComponentProps, Fragment, type ReactNode } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import {
  getDiffLineType,
  getDiffSegmentType,
  lineHasAdditions,
  lineHasRemovals,
} from '../utils'

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
      {getDiffLineNumbers(fileDiff)}
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

const getDiffLineNumbers = (fileDiff: FileDiff): ReactNode => {
  let deletions = 0
  let offset = 0

  return (
    <>
      {fileDiff.map((diffLine, i) => {
        const hasRemovals = lineHasRemovals(diffLine)
        const hasAdditions = lineHasAdditions(diffLine)

        const lastSegment = diffLine.at(-1)
        const endsWithNewline = lastSegment?.endsWith('\n') ?? false

        if (lastSegment && endsWithNewline) {
          const lastSegmentType = getDiffSegmentType(lastSegment)

          if (lastSegmentType === 'added') {
            offset -= deletions
            deletions = 0
          }

          const res =
            !hasAdditions && !hasRemovals ? (
              <LineNumbersCell
                key={`${i + 1}`}
                lineNumber={i + 1 + offset}
                diffType="unchanged"
              />
            ) : (
              match(lastSegmentType)
                .with('unchanged', () => (
                  <Fragment key={`${i + 1}`}>
                    <LineNumbersCell
                      lineNumber={i + 1 + offset}
                      diffType="removed"
                    />
                    <LineNumbersCell lineNumber={undefined} diffType="added" />
                  </Fragment>
                ))
                .with('removed', () => (
                  <LineNumbersCell
                    key={`${i + 1}`}
                    lineNumber={i + 1 + offset}
                    diffType="removed"
                  />
                ))
                .with('added', () => (
                  <LineNumbersCell
                    key={`${i + 1}`}
                    lineNumber={i + 1 + offset}
                    diffType="added"
                  />
                ))
                .exhaustive()
            )

          if (lastSegmentType === 'unchanged') {
            offset -= deletions
            deletions = 0
          }

          if (lastSegmentType === 'removed') {
            deletions++
          }

          return res
        }

        const diffType = getDiffLineType(diffLine)
        return (
          <LineNumbersCell
            key={`${i + 1}`}
            lineNumber={i + 1 + offset}
            diffType={diffType}
          />
        )
      })}

      <LineNumbersCell
        lineNumber={fileDiff.length + 1 + offset}
        diffType={mapFn(fileDiff.at(-1), getDiffLineType) ?? 'unchanged'}
        faded
      />
    </>
  )
}

export { DiffViewerLineNumbers, type DiffViewerLineNumbersProps }

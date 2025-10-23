import type { ComponentProps, ReactNode } from 'react'
import { match } from 'ts-pattern'

import type { ConflictType, FileConflicts, FileDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'

import type { DiffFilter } from '../Diff/utils'
import type { LineType } from '../utils'

interface LineNumberProps extends ComponentProps<'div'> {
  /**
   * The line number to display.
   */
  lineNumber: number | undefined

  /**
   * The type of the line being displayed.
   */
  type: LineType

  /**
   * Whether to display the number in a faded style.
   */
  faded?: boolean
}

/**
 * Displays a single line number with the appropriate styling based on its type.
 */
const LineNumber = (props: LineNumberProps) => {
  const { lineNumber, type, faded, ...divProps } = props

  return (
    <div
      {...propsWithCn(
        divProps,
        'h-7 flex flex-row font-mono',
        'text-xs w-15 px-1 py-1.75 overflow-hidden',
        match(type)
          .with('added', () => [
            'bg-success-500/30',
            faded ? 'text-success-700/70' : 'text-success-500',
          ])
          .with('removed', () => [
            'bg-danger-600/30',
            faded ? 'text-danger-800/70' : 'text-danger-600',
          ])
          .with('ours', () => [
            'bg-primary-500/30',
            faded ? 'text-primary-700/70' : 'text-primary-500',
          ])
          .with('theirs', () => [
            'bg-warning-600/30',
            faded ? 'text-warning-800/70' : 'text-warning-600',
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
 * Generates the line numbers for a given file diff or conflict.
 *
 * In inline mode, staggers line numbers when there's a sequence of deletions to keep them aligned
 * with the actual lines in the resulting file.
 */
const getLineNumbers = (
  content: FileDiff | FileConflicts,
  filter: DiffFilter = 'both',
): ReactNode => {
  const res: ReactNode[] = []

  let offset = 0
  let ignored = 0
  let deletions = 0

  let sectionType: ConflictType = 'unchanged'

  content.forEach((line, i) => {
    match(filter)
      .with('both', () => {
        if (line.type === 'removed') {
          deletions++
        } else if (deletions > 0) {
          offset -= deletions
          deletions = 0
        }

        if (
          sectionType !== line.type &&
          (line.type === 'ours' || line.type === 'theirs')
        ) {
          res.push(
            <LineNumber
              key={`indicator-${i + 1}`}
              lineNumber={undefined}
              className="h-4.5"
              type={line.type}
            />,
          )
        }

        res.push(
          <LineNumber
            key={`${i + 1}`}
            lineNumber={i + 1 + offset}
            type={line.type}
          />,
        )
      })
      .with('ours', () => {
        if (line.type !== 'removed') {
          res.push(
            <LineNumber
              key={`${i + 1}`}
              lineNumber={i + 1 - ignored}
              type={line.type}
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
              lineNumber={i + 1 - ignored}
              type={line.type}
            />,
          )
        } else {
          ignored++
        }
      })
      .exhaustive()

    if (
      line.type === 'ours' ||
      line.type === 'theirs' ||
      line.type === 'unchanged'
    ) {
      sectionType = line.type
    }
  })

  res.push(
    <LineNumber
      key={content.length + 1}
      lineNumber={content.length + 1 + offset - ignored}
      type="unchanged"
      faded
      className={cn('grow rounded-bl-sm')}
    />,
  )

  return res
}

export { LineNumber, getLineNumbers, type LineNumberProps }

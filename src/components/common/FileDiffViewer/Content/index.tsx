import { type ComponentProps, Fragment } from 'react'
import { match } from 'ts-pattern'

import type { DiffLineSegment, DiffType, LineDiff } from '@/api/models'
import { cn, propsWithCn } from '@/utils/styles'
import { mapFn } from '@/utils/types'

import { getDiffSegmentType, getLineDiffType, isCompositeLine } from '../utils'

interface DiffViewerContentProps extends ComponentProps<'div'> {
  /**
   * The diff to display.
   */
  fileDiff: LineDiff[]
}

/**
 * Displays the contents of a file in a diff viewer.
 */
const DiffViewerContent = (props: DiffViewerContentProps) => {
  const { fileDiff, ...divProps } = props
  return (
    <div
      {...propsWithCn(
        divProps,
        'overflow-x-auto overflow-y-hidden',
        'col-start-1 -col-end-1',
      )}
    >
      <div className={cn('w-max min-w-full')}>
        {fileDiff.map((line, i) => {
          const isComposite = isCompositeLine(line)

          if (isComposite) {
            return (
              <Fragment key={`${i + 1}`}>
                <ContentCell
                  diffType="removed"
                  segments={line.filter(
                    (segment) => getDiffSegmentType(segment) !== 'added',
                  )}
                />
                <ContentCell
                  diffType="added"
                  segments={line.filter(
                    (segment) => getDiffSegmentType(segment) !== 'removed',
                  )}
                />
              </Fragment>
            )
          }

          const diffType = getLineDiffType(line)
          return (
            <ContentCell key={`${i + 1}`} diffType={diffType} segments={line} />
          )
        })}

        <ContentCell
          diffType={mapFn(fileDiff.at(-1), getLineDiffType) ?? 'unchanged'}
          segments={[]}
        />
      </div>
    </div>
  )
}

/**
 * Displays a single line of content with the appropriate styling based on its diff type.
 *
 * @param props.diffType - The type of diff for the line.
 * @param props.segments - The content of the line to display.
 */
const ContentCell = (props: {
  diffType: DiffType
  segments: DiffLineSegment[]
}) => {
  const { diffType, segments } = props

  return (
    <div
      className={cn(
        'h-7 font-mono whitespace-pre pl-2 pr-3 flex flex-row items-center w-full',
        match(diffType)
          .with('added', () => 'bg-success-500/10')
          .with('removed', () => 'bg-danger-600/10')
          .with('unchanged', () => undefined)
          .exhaustive(),
      )}
    >
      {segments.map((segment, index) => (
        <span
          key={`${index + 1}`}
          className={cn(
            'flex flex-row items-center h-full',
            segments.length > 1 &&
              match(getDiffSegmentType(segment))
                .with('added', () => 'bg-success-500/30')
                .with('removed', () => 'bg-danger-600/30')
                .with('unchanged', () => undefined)
                .exhaustive(),
          )}
        >
          {segment.slice(1)}
        </span>
      ))}
    </div>
  )
}

export { DiffViewerContent, type DiffViewerContentProps }

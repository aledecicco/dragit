import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'

interface DiffViewerLineChangesProps extends ComponentProps<'div'> {
  fileDiff: FileDiff
}

const DiffViewerLineChanges = (props: DiffViewerLineChangesProps) => {
  const { fileDiff, ...divProps } = props

  return (
    <div {...propsWithCn(divProps, 'select-none row-start-1 -row-end-1')}>
      {fileDiff.sections.map((section, i) =>
        section.lines.map((_, j) => (
          <LineChangesCell
            key={`${section.diffType}-${i}-${j}`}
            diffType={section.diffType}
          />
        )),
      )}

      <LineChangesCell
        diffType={fileDiff.sections.at(-1)?.diffType ?? 'unchanged'}
        empty
      />
    </div>
  )
}

const LineChangesCell = (props: {
  diffType: DiffType
  empty?: boolean
}) => {
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

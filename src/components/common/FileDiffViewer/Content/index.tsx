import type { ComponentProps } from 'react'
import { match } from 'ts-pattern'

import type { DiffType, FileDiff } from '@api/models'
import { cn, propsWithCn } from '@utils/styles'

interface DiffViewerContentProps extends ComponentProps<'div'> {
  fileDiff: FileDiff
}

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
      <div className={cn('w-max')}>
        {fileDiff.sections.map((section, i) =>
          section.lines.map((line, j) => (
            <ContentCell
              key={`${section.diffType}-${i}-${j}`}
              diffType={section.diffType}
              line={line}
            />
          )),
        )}

        <ContentCell
          diffType={fileDiff.sections.at(-1)?.diffType ?? 'unchanged'}
          line=""
        />
      </div>
    </div>
  )
}

const ContentCell = (props: {
  diffType: DiffType
  line: string
}) => {
  const { diffType, line } = props

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
      {line}
    </div>
  )
}

export { DiffViewerContent, type DiffViewerContentProps }

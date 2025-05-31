import { type ComponentProps, Fragment } from 'react'

import { useQueryFileDiff } from '@api/queries/fileDiff'
import { QueryLoader } from '@lib/Loader/Query'
import { IconFile } from '@tabler/icons-react'
import { Icon } from '@ui/Icon'
import { Marquee } from '@ui/Marquee'
import { Separator } from '@ui/Separator'
import { Skeleton } from '@ui/Skeleton'
import { range } from '@utils/array'
import { cn, propsWithCn } from '@utils/styles'
import { match } from 'ts-pattern'

interface FileDiffViewerProps extends ComponentProps<'div'> {
  reference: string
  filepath: string
}

const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { reference, filepath, ...divProps } = props

  const fileDiffQuery = useQueryFileDiff(reference, filepath)

  return (
    <div
      {...propsWithCn(
        divProps,
        'p-2 w-full h-full',
        'grid grid-rows-[max-content_max-content_1fr] gap-y-3',
      )}
    >
      <div className="flex flex-row items-center gap-x-2 pr-9">
        <Icon Glyph={IconFile} size="lg" />
        <Marquee className={cn('text-md text-light-500')}>{filepath}</Marquee>
      </div>

      <Separator />

      <div
        className={cn(
          'px-2 text-sm overflow-y-auto grid grid-cols-[max-content_max-content_1fr]',
        )}
      >
        <QueryLoader
          query={fileDiffQuery}
          loadingFallback={range(5).map((i) => (
            <Skeleton key={i} variant="line" className={cn('col-span-2')} />
          ))}
        >
          {(fileDiff) => {
            if (fileDiff.sections.length === 0) {
              return (
                <p className={cn('text-light-950/50 italic')}>Empty file</p>
              )
            }

            const lengthSums = fileDiff.sections.reduce(
              (acc: number[], section) => {
                acc.push((acc.at(-1) ?? 0) + section.lines.length)
                return acc
              },
              [],
            )
            const totalLength = lengthSums.at(-1) ?? 0

            return (
              <>
                <div
                  className={cn('col-start-1 select-none')}
                  style={{ gridRowStart: 1, gridRowEnd: totalLength + 1 }}
                >
                  {fileDiff.sections.map((section, i) =>
                    section.lines.map((_, j) => (
                      <div
                        key={`${section.diffType}-${i}-${j}`}
                        className={cn(
                          'h-7 flex flex-row items-center font-mono',
                          'text-xs w-18 px-1 overflow-hidden',
                          match(section.diffType)
                            .with('added', () => 'bg-success-500/30')
                            .with('removed', () => 'bg-danger-600/30')
                            .with('unchanged', () => 'bg-dark-600')
                            .exhaustive(),
                        )}
                      >
                        {(i === 0 ? 0 : lengthSums[i - 1]) + j + 1}
                      </div>
                    )),
                  )}
                  <div className={cn('h-7 bg-dark-600')} />
                </div>

                <div
                  className={cn('col-start-2 select-none')}
                  style={{ gridRowStart: 1, gridRowEnd: totalLength + 1 }}
                >
                  {fileDiff.sections.map((section, i) =>
                    section.lines.map((_, j) => (
                      <div
                        key={`${section.diffType}-${i}-${j}`}
                        className={cn(
                          'h-7 flex flex-row items-center justify-center font-mono',
                          'w-4',
                          match(section.diffType)
                            .with('added', () => 'bg-success-500/10')
                            .with('removed', () => 'bg-danger-600/10')
                            .with('unchanged', () => undefined)
                            .exhaustive(),
                        )}
                      >
                        {match(section.diffType)
                          .with('added', () => '+')
                          .with('removed', () => '-')
                          .with('unchanged', () => ' ')
                          .exhaustive()}
                      </div>
                    )),
                  )}
                  <div className={cn('h-7')} />
                </div>

                <div
                  className={cn(
                    'col-start-3 flex flex-col overflow-x-auto overflow-y-hidden',
                  )}
                  style={{ gridRowStart: 1, gridRowEnd: totalLength + 1 }}
                >
                  {fileDiff.sections.map((section, i) =>
                    section.lines.map((line, j) => (
                      <div
                        key={`${section.diffType}-${i}-${j}`}
                        className={cn(
                          'h-7 font-mono whitespace-pre pl-1 flex flex-row items-center w-full',
                          match(section.diffType)
                            .with('added', () => 'bg-success-500/10')
                            .with('removed', () => 'bg-danger-600/10')
                            .with('unchanged', () => undefined)
                            .exhaustive(),
                        )}
                      >
                        {line}
                      </div>
                    )),
                  )}
                  <div className={cn('h-7')} />
                </div>
              </>
            )
          }}
        </QueryLoader>
      </div>
    </div>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }

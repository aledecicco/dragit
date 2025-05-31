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
import { DiffViewerContent } from './Content'
import { DiffViewerLineChanges } from './LineChanges'
import { DiffViewerLineNumbers } from './LineNumbers'

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
        'w-full h-full',
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <div className="flex flex-row items-center gap-x-2 p-2 pr-9">
        <Icon Glyph={IconFile} size="lg" />
        <Marquee className={cn('text-md text-light-500')}>{filepath}</Marquee>
      </div>

      <Separator />

      <div
        className={cn(
          'pl-1 pt-1 text-sm overflow-y-auto grid grid-cols-[max-content_max-content_1fr] auto-rows-max',
        )}
      >
        <QueryLoader
          query={fileDiffQuery}
          loadingFallback={range(50).map((i) => (
            <Fragment key={i}>
              <div
                className={cn(
                  'h-7 flex flex-row items-center font-mono',
                  'text-xs w-19 px-1 overflow-hidden',
                  'bg-dark-600 text-light-950/30',
                )}
              >
                {i + 1}
              </div>
              <Skeleton
                variant="line"
                className={cn('col-span-2 m-1.5 mx-2')}
              />
            </Fragment>
          ))}
        >
          {(fileDiff) => {
            if (fileDiff.sections.length === 0) {
              return (
                <p className={cn('text-light-950/50 italic')}>Empty file</p>
              )
            }

            return (
              <>
                <DiffViewerLineNumbers
                  fileDiff={fileDiff}
                  className={cn('col-start-1')}
                />

                <DiffViewerLineChanges
                  fileDiff={fileDiff}
                  className={cn('col-start-2')}
                />

                <DiffViewerContent
                  fileDiff={fileDiff}
                  className={cn('col-start-3')}
                />
              </>
            )
          }}
        </QueryLoader>
      </div>
    </div>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }

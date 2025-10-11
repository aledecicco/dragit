import { type ComponentProps, Fragment, useEffect, useRef } from 'react'
import { IconFile } from '@tabler/icons-react'

import type { DiffScope } from '@/api/models'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { QueryLoader } from '@/lib/Loader/Query'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { Separator } from '@/ui/Separator'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

import { DiffViewerContent } from './Content'
import { DiffViewerLineChanges } from './LineChanges'
import { DiffViewerLineNumbers } from './LineNumbers'

interface FileDiffViewerProps extends ComponentProps<'div'> {
  /**
   * The scope of the diff to display (staged changes, unstaged changes, or a specific snapshot).
   */
  diffScope: DiffScope
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { diffScope, ...divProps } = props

  const fileDiffQuery = useQueryFileDiff(diffScope)

  const viewerRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll when a different file is selected
  useEffect(() => {
    viewerRef.current?.scrollTo({ top: 0, left: 0 })
  }, [diffScope.file.path])

  return (
    <div
      {...propsWithCn(
        divProps,
        'w-full h-full',
        'grid grid-rows-[max-content_max-content_1fr]',
      )}
    >
      <div className={cn('flex flex-row items-center gap-x-2 p-2 pr-9')}>
        <Icon Glyph={IconFile} size="lg" />
        <Marquee className={cn('text-md text-light-500')}>
          {diffScope.file.path}
        </Marquee>
      </div>

      <Separator />

      <div
        ref={viewerRef}
        className={cn(
          'pl-1 pt-1 text-sm overflow-y-auto',
          'grid grid-cols-[max-content_max-content_1fr] grid-rows-[1fr]',
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
            if (fileDiff.length === 0) {
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
                  file={diffScope.file}
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

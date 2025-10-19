import { type ComponentProps, Fragment, useEffect, useRef } from 'react'
import { IconFile } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { DiffScope } from '@/api/models'
import { useQueryFileDiff } from '@/api/queries/fileDiff'
import { useCurrentPath } from '@/api/utils'
import { QueryLoader } from '@/lib/Loader/Query'
import { Icon } from '@/ui/Icon'
import { Marquee } from '@/ui/Marquee'
import { Separator } from '@/ui/Separator'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { openFile } from '@/utils/interaction'
import { cn, propsWithCn } from '@/utils/styles'

import { DiffViewerContent } from './Content'
import { DiffViewerLineChanges } from './LineChanges'
import { DiffViewerLineNumbers } from './LineNumbers'
import type { DiffFilter } from './utils'

interface FileDiffViewerProps extends ComponentProps<'div'> {
  /**
   * The scope of the diff to display (staged changes, unstaged changes, or a specific snapshot).
   */
  diffScope: DiffScope

  /**
   * An optional filter to apply to the displayed diff lines.
   */
  filter?: DiffFilter
}

/**
 * Displays the contents of a file, showing changes made to it on each line.
 */
const FileDiffViewer = (props: FileDiffViewerProps) => {
  const { diffScope, filter = 'both', ...divProps } = props
  const repoPath = useCurrentPath()

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
        <Marquee
          className={cn('text-md text-light-500')}
          onClick={() => {
            if (
              diffScope.type === 'worktree' ||
              diffScope.type === 'unmerged'
            ) {
              // ToDo: make more usable
              openFile(`${repoPath}/${diffScope.file.path}`)
            }
          }}
        >
          {diffScope.file.path}
          <span className={cn('text-light-900 text-sm italic ml-2')}>
            {diffScope.type === 'unmerged'
              ? match(diffScope.stage)
                  .with('ours', () => ' (ours)')
                  .with('theirs', () => ' (theirs)')
                  .exhaustive()
              : match(filter)
                  .with('ours', () => ' (after changes)')
                  .with('theirs', () => ' (before changes)')
                  .with('both', () => undefined)
                  .exhaustive()}
          </span>
        </Marquee>
      </div>

      <Separator />

      <div
        ref={viewerRef}
        className={cn(
          'pl-1 py-1 text-sm overflow-y-auto',
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
          {(fileDiff) => (
            <>
              <DiffViewerLineNumbers
                fileDiff={fileDiff}
                filter={filter}
                className={cn('col-start-1')}
              />

              <DiffViewerLineChanges
                fileDiff={fileDiff}
                filter={filter}
                className={cn('col-start-2')}
              />

              <DiffViewerContent
                file={diffScope.file}
                fileDiff={fileDiff}
                filter={filter}
                className={cn('col-start-3')}
              />
            </>
          )}
        </QueryLoader>
      </div>
    </div>
  )
}

export { FileDiffViewer, type FileDiffViewerProps }

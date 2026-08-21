import type { ComponentProps } from 'react'

import { ROW_HEIGHT } from '@/highlighting/utils'
import { Skeleton } from '@/ui/Skeleton'
import { range } from '@/utils/array'
import { cn, propsWithCn } from '@/utils/styles'

const PLACEHOLDER_LINES = 50

interface FileViewerLoaderProps extends ComponentProps<'div'> {}

/**
 * Displays placeholder lines while the contents of a file are unavailable.
 */
const FileViewerLoader = (props: FileViewerLoaderProps) => {
  return (
    <div {...propsWithCn(props, 'col-start-1 -col-end-1 flex flex-col')}>
      {range(PLACEHOLDER_LINES).map((i) => (
        <div
          key={i}
          className={cn('flex flex-row items-center')}
          style={{ height: ROW_HEIGHT }}
        >
          <div
            className={cn(
              'self-stretch flex flex-row items-center font-mono',
              'text-xs w-19 px-1 overflow-hidden',
              'bg-dark-950/50 text-light-950/30',
            )}
          >
            {i + 1}
          </div>

          <Skeleton variant="line" className={cn('grow m-1.5 mx-2')} />
        </div>
      ))}
    </div>
  )
}

export { FileViewerLoader, type FileViewerLoaderProps }

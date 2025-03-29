import * as Ariakit from '@ariakit/react'
import { type ComponentType, useMemo } from 'react'

import type { FileInfo, Page } from '@api/models'
import type { FileType } from '@context/files'
import { VirtualizedDiv } from '@lib/VirtualizedDiv'
import { cn } from '@utils/styles'

interface FileStatusListProps<T extends FileInfo> {
  files: Page<T> | undefined
  status: FileType
  RenderItem: ComponentType<{ item: T }>
  itemSize: number
}

const FileStatusList = <T extends FileInfo>(props: FileStatusListProps<T>) => {
  const { files, status, RenderItem, itemSize } = props

  const options = useMemo(() => {
    return files
      ? {
          getItemKey: (index: number) => files.items[index].path,
        }
      : undefined
  }, [files])

  return files?.items.length ? (
    <Ariakit.CompositeRow
      render={
        <VirtualizedDiv
          size="sm"
          items={files.items}
          RenderItem={RenderItem}
          itemSize={itemSize}
          className={cn('w-full h-full')}
          options={options}
        />
      }
    />
  ) : (
    <p className={cn('text-sm text-light-950/50 italic p-3')}>
      No {status} files
    </p>
  )
}

export { FileStatusList, type FileStatusListProps }

import type { ComponentProps } from 'react'

import type { VersionedFileInfo, WorktreeFileInfo } from '@/api/models'
import { FileIcon } from '@/common/File/Icon'
import { FilePath } from '@/common/File/Path'
import { Marquee } from '@/ui/Marquee'
import { getPathLocation } from '@/utils/string'
import { cn, propsWithCn } from '@/utils/styles'

interface FileItemProps extends ComponentProps<'div'> {
  /**
   * The file being displayed.
   */
  file: WorktreeFileInfo | VersionedFileInfo
}

/**
 * Base component for displaying a file item in a list.
 */
const FileItem = (props: FileItemProps) => {
  const { file, ...divProps } = props

  const { filedir, filename } = getPathLocation(file.path)

  return (
    <div {...propsWithCn(divProps, 'w-full flex flex-col items-start')}>
      <div
        className={cn(
          'grid grid-cols-[max-content_1fr] gap-x-1 items-center min-w-0',
        )}
      >
        <FileIcon file={file} />

        <Marquee className={cn('text-sm text-light-500')}>{filename}</Marquee>
      </div>

      <Marquee className={cn('text-xs text-light-900/80')}>
        <FilePath
          filepath={filedir}
          separatorProps={{ className: cn('text-light-700') }}
        />
      </Marquee>
    </div>
  )
}

export { FileItem, type FileItemProps }

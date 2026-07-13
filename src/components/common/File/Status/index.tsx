import type { VersionedFileInfo, WorktreeFileInfo } from '@/api/models'
import { Chip, type ChipProps } from '@/ui/Chip'

import { getStatusColorForFile, getStatusTextForFile } from './utils'

interface FileStatusProps extends Omit<ChipProps, 'status'> {
  /**
   * The file being displayed.
   */
  file: WorktreeFileInfo | VersionedFileInfo
}

/**
 * Chip displaying the status of a file.
 */
const FileStatus = (props: FileStatusProps) => {
  const { file, ...chipProps } = props

  return (
    <Chip
      size="xs"
      rounded={false}
      status={getStatusColorForFile(file)}
      {...chipProps}
    >
      {getStatusTextForFile(file)}
    </Chip>
  )
}

export { FileStatus, type FileStatusProps }

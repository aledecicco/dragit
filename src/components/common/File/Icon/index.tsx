import {
  IconFileAlert,
  IconFileArrowRight,
  IconFileCode2,
  IconFileMinus,
  IconFilePencil,
  IconFilePlus,
  IconFiles,
  IconFileUnknown,
} from '@tabler/icons-react'
import { match, P } from 'ts-pattern'

import type { VersionedFileInfo, WorktreeFileInfo } from '@/api/models'
import { Icon, type IconProps } from '@/ui/Icon'
import { propsWithCn } from '@/utils/styles'

interface FileIconProps extends Partial<IconProps> {
  /**
   *  The file being displayed.
   */
  file: WorktreeFileInfo | VersionedFileInfo
}

/**
 * An icon representing the status of a file.
 */
const FileIcon = (props: FileIconProps) => {
  const { file, ...iconProps } = props

  return (
    <Icon
      Glyph={getFileGlyph(file)}
      size="md"
      {...propsWithCn(
        iconProps,
        match(file)
          .with({ status: P.union('staged', 'versioned') }, (file) =>
            match(file.changes)
              .with('added', () => 'text-success-200/90')
              .with('deleted', () => 'text-danger-200/90')
              .with('modified', () => 'text-success-200/90')
              .with('typeChanged', () => 'text-light-400')
              .with('copied', () => 'text-light-400')
              .with('renamed', () => 'text-light-400')
              .exhaustive(),
          )
          .with({ status: 'unstaged' }, (file) =>
            match(file.changes)
              .with('added', () => 'text-success-200/90')
              .with('deleted', () => 'text-danger-200/90')
              .with('modified', () => 'text-success-200/90')
              .with('typeChanged', () => 'text-light-400')
              .exhaustive(),
          )
          .with({ status: 'untracked' }, () => 'text-light-600')
          .with({ status: 'unmerged' }, () => 'text-warning-100/90')
          .exhaustive(),
      )}
    />
  )
}

const getFileGlyph = (file: WorktreeFileInfo | VersionedFileInfo) => {
  return match(file)
    .with({ status: P.union('staged', 'versioned') }, (file) =>
      match(file.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .with('copied', () => IconFiles)
        .with('renamed', () => IconFileArrowRight)
        .exhaustive(),
    )
    .with({ status: 'unstaged' }, (file) =>
      match(file.changes)
        .with('added', () => IconFilePlus)
        .with('deleted', () => IconFileMinus)
        .with('modified', () => IconFilePencil)
        .with('typeChanged', () => IconFileCode2)
        .exhaustive(),
    )
    .with({ status: 'untracked' }, () => IconFileUnknown)
    .with({ status: 'unmerged' }, () => IconFileAlert)
    .exhaustive()
}

export { FileIcon, type FileIconProps }

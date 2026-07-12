import type { ComponentProps } from 'react'
import { match, P } from 'ts-pattern'

import type { VersionedFileInfo, WorktreeFileInfo } from '@/api/models'
import { propsWithCn } from '@/utils/styles'

interface FileStatusProps extends ComponentProps<'span'> {
  /**
   * The file being displayed.
   */
  file: WorktreeFileInfo | VersionedFileInfo
}

/**
 * Text status of a file.
 */
const FileStatus = (props: FileStatusProps) => {
  const { file, ...spanProps } = props

  return (
    <span
      {...propsWithCn(
        spanProps,
        'text-xs tracking-normal',
        'px-1 py-px rounded-xs',
        match(file)
          .with({ status: P.union('staged', 'versioned') }, (file) =>
            match(file.changes)
              .with('added', () => 'text-success-200/90 bg-success-400/15')
              .with('deleted', () => 'text-danger-200/90 bg-danger-400/15')
              .with('modified', () => 'text-success-200/90 bg-success-400/15')
              .with('typeChanged', () => 'text-light-400 bg-light-600/15')
              .with('copied', () => 'text-light-400 bg-light-600/15')
              .with('renamed', () => 'text-light-400 bg-light-600/15')
              .exhaustive(),
          )
          .with({ status: 'unstaged' }, (file) =>
            match(file.changes)
              .with('added', () => 'text-success-200/90 bg-success-400/15')
              .with('deleted', () => 'text-danger-200/90 bg-danger-400/15')
              .with('modified', () => 'text-success-200/90 bg-success-400/15')
              .with('typeChanged', () => 'text-light-400 bg-light-600/15')
              .exhaustive(),
          )
          .with({ status: 'untracked' }, () => 'text-light-600 bg-light-800/15')
          .with(
            { status: 'unmerged' },
            () => 'text-warning-100/90 bg-warning-300/15',
          )
          .exhaustive(),
      )}
    >
      {getFileStatus(file)}
    </span>
  )
}

const getFileStatus = (file: WorktreeFileInfo | VersionedFileInfo) => {
  return match(file)
    .with({ status: P.union('staged', 'versioned') }, (file) =>
      match(file.changes)
        .with('added', () => 'Added')
        .with('deleted', () => 'Deleted')
        .with('modified', () => 'Modified')
        .with('typeChanged', () => 'Type changed')
        .with('copied', () => 'Copied')
        .with('renamed', () => 'Renamed')
        .exhaustive(),
    )
    .with({ status: 'unstaged' }, (file) =>
      match(file.changes)
        .with('added', () => 'Added')
        .with('deleted', () => 'Deleted')
        .with('modified', () => 'Modified')
        .with('typeChanged', () => 'Type changed')
        .exhaustive(),
    )
    .with({ status: 'untracked' }, () => 'Untracked')
    .with({ status: 'unmerged' }, (file) =>
      match(file.changes)
        .with('bothAdded', () => 'Added by both')
        .with('bothDeleted', () => 'Deleted by both')
        .with('bothModified', () => 'Modified by both')
        .with('addedByUs', () => 'Added by us')
        .with('deletedByUs', () => 'Deleted by us')
        .with('addedByThem', () => 'Added by them')
        .with('deletedByThem', () => 'Deleted by them')
        .exhaustive(),
    )
    .exhaustive()
}

export { FileStatus, type FileStatusProps }

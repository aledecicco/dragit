import { match, P } from 'ts-pattern'

import type { VersionedFileInfo, WorktreeFileInfo } from '@/api/models'
import type { Status } from '@/utils/types'

/**
 * Chooses a status color for a file.
 */
export const getStatusColorForFile = (
  file: WorktreeFileInfo | VersionedFileInfo,
): Status => {
  return match(file)
    .returnType<Status>()
    .with({ status: P.union('staged', 'versioned') }, (file) =>
      match(file.changes)
        .returnType<Status>()
        .with('added', () => 'success')
        .with('deleted', () => 'danger')
        .with('modified', () => 'success')
        .with('typeChanged', () => 'neutral')
        .with('copied', () => 'neutral')
        .with('renamed', () => 'neutral')
        .exhaustive(),
    )
    .with({ status: 'unstaged' }, (file) =>
      match(file.changes)
        .returnType<Status>()
        .with('added', () => 'success')
        .with('deleted', () => 'danger')
        .with('modified', () => 'success')
        .with('typeChanged', () => 'neutral')
        .exhaustive(),
    )
    .with({ status: 'untracked' }, () => 'neutral')
    .with({ status: 'unmerged' }, () => 'warning')
    .exhaustive()
}

/**
 * Chooses a status text for a file.
 */
export const getStatusTextForFile = (
  file: WorktreeFileInfo | VersionedFileInfo,
): string => {
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

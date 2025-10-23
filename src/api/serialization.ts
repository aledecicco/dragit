import { match, P } from 'ts-pattern'

import type {
  StagedFileInfo,
  UnmergedFileInfo,
  UnstagedFileInfo,
  UntrackedFileInfo,
  VersionedFileInfo,
  WorktreeFileInfo,
} from './models'

export const serializeWorktreeFile = (file: WorktreeFileInfo) => {
  return match(file)
    .with({ status: 'staged' }, (file) => ({
      Staged: serializeStagedFile(file),
    }))
    .with({ status: 'unstaged' }, (file) => ({
      Unstaged: serializeUnstagedFile(file),
    }))
    .with({ status: 'unmerged' }, (file) => ({
      Unmerged: serializeUnmergedFile(file),
    }))
    .with({ status: 'untracked' }, (file) => ({
      Untracked: serializeUntrackedFile(file),
    }))
    .exhaustive()
}

export const serializeStagedFile = (file: StagedFileInfo) => {
  return {
    path: file.path,
    status: match(file)
      .with({ changes: 'added' }, () => ({
        Changed: { changes: { Added: null } },
      }))
      .with({ changes: 'deleted' }, () => ({
        Changed: { changes: { Deleted: null } },
      }))
      .with({ changes: 'modified' }, () => ({
        Changed: { changes: { Modified: null } },
      }))
      .with({ changes: 'typeChanged' }, () => ({
        Changed: { changes: { TypeChanged: null } },
      }))
      .with({ changes: 'renamed', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Renamed: null }, oldPath },
      }))
      .with({ changes: 'copied', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Copied: null }, oldPath },
      }))
      .exhaustive(),
  }
}

export const serializeUnstagedFile = (file: UnstagedFileInfo) => {
  return {
    path: file.path,
    status: match(file.changes)
      .with('added', () => ({ Added: null }))
      .with('deleted', () => ({ Deleted: null }))
      .with('modified', () => ({ Modified: null }))
      .with('typeChanged', () => ({ TypeChanged: null }))
      .exhaustive(),
  }
}

export const serializeUnmergedFile = (file: UnmergedFileInfo) => {
  return {
    path: file.path,
    status: match(file.changes)
      .with('bothAdded', () => ({ BothAdded: null }))
      .with('bothDeleted', () => ({ BothDeleted: null }))
      .with('bothModified', () => ({ BothModified: null }))
      .with('addedByThem', () => ({ AddedByThem: null }))
      .with('addedByUs', () => ({ AddedByUs: null }))
      .with('deletedByThem', () => ({ DeletedByThem: null }))
      .with('deletedByUs', () => ({ DeletedByUs: null }))
      .exhaustive(),
  }
}

export const serializeUntrackedFile = (file: UntrackedFileInfo) => {
  return { path: file.path }
}

export const serializeVersionedFile = (file: VersionedFileInfo) => {
  return {
    path: file.path,
    status: match(file)
      .with({ changes: 'added' }, () => ({
        Changed: { changes: { Added: null } },
      }))
      .with({ changes: 'deleted' }, () => ({
        Changed: { changes: { Deleted: null } },
      }))
      .with({ changes: 'modified' }, () => ({
        Changed: { changes: { Modified: null } },
      }))
      .with({ changes: 'typeChanged' }, () => ({
        Changed: { changes: { TypeChanged: null } },
      }))
      .with({ changes: 'renamed', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Renamed: null }, oldPath },
      }))
      .with({ changes: 'copied', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Copied: null }, oldPath },
      }))
      .exhaustive(),
  }
}

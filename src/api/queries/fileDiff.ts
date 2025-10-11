import { type QueryFunctionContext, queryOptions } from '@tanstack/react-query'
import type { BorshSchema } from 'borsher'
import { match, P } from 'ts-pattern'

import type {
  DiffLine,
  DiffScope,
  FileDiff,
  VersionedFileInfo,
  WorktreeFileInfo,
} from '../models'
import {
  FILE_DIFF_SCHEMA,
  type STAGED_FILE_INFO_SCHEMA,
  type VERSIONED_FILE_INFO_SCHEMA,
  type WORKTREE_FILE_INFO_SCHEMA,
} from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

const filesDiffQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'file_diff',
    }) as const,
  file: (repoPath: string, scope: DiffScope) =>
    ({
      ...filesDiffQueryKeys.all(repoPath),
      scope,
    }) as const,
}

const fetchFileDiff = async (
  repoPath: string,
  scope: DiffScope,
  context: QueryFunctionContext,
): Promise<FileDiff> => {
  const res = await fetchAndDeserialize(
    'get_file_diff',
    {
      repoPath,
      scope: {
        ...scope,
        file: match(scope)
          .with({ type: 'worktree', file: P.select() }, (file) =>
            serializeWorktreeFile(file),
          )
          .with({ type: 'snapshot', file: P.select() }, (file) =>
            serializeVersionedFile(file),
          )
          .exhaustive(),
      },
    },
    FILE_DIFF_SCHEMA,
    context,
  )

  return res.map((resItem) =>
    match(resItem)
      .returnType<DiffLine>()
      .with({ Added: P.select() }, (line) => ({
        type: 'added',
        content: line,
      }))
      .with({ Removed: P.select() }, (line) => ({
        type: 'removed',
        content: line,
      }))
      .with({ Unchanged: P.select() }, (line) => ({
        type: 'unchanged',
        content: line,
      }))
      .exhaustive(),
  )
}

const fileDiffQuery = (repoPath: string, scope: DiffScope) =>
  queryOptions({
    queryKey: [filesDiffQueryKeys.file(repoPath, scope)],
    queryFn: (context) => fetchFileDiff(repoPath, scope, context),
  })

const useQueryFileDiff = (scope: DiffScope) =>
  useRepositoryQuery(fileDiffQuery, scope)

type SchemaType<T extends BorshSchema<unknown>> = ReturnType<T['deserialize']>

type SerializedWorktreeFile = SchemaType<typeof WORKTREE_FILE_INFO_SCHEMA>
type StagedFileStatus = SchemaType<typeof STAGED_FILE_INFO_SCHEMA>['status']

const serializeWorktreeFile = (
  file: WorktreeFileInfo,
): SerializedWorktreeFile => {
  return match(file)
    .returnType<SerializedWorktreeFile>()
    .with({ status: 'staged' }, (file) => ({
      Staged: {
        path: file.path,
        status: match(file)
          .returnType<StagedFileStatus>()
          .with({ changes: 'added' }, () => ({
            Changed: { changes: { Added: {} } },
          }))
          .with({ changes: 'deleted' }, () => ({
            Changed: { changes: { Deleted: {} } },
          }))
          .with({ changes: 'modified' }, () => ({
            Changed: { changes: { Modified: {} } },
          }))
          .with({ changes: 'typeChanged' }, () => ({
            Changed: { changes: { TypeChanged: {} } },
          }))
          .with({ changes: 'renamed', oldPath: P.select() }, (oldPath) => ({
            Moved: { changes: { Renamed: {} }, oldPath },
          }))
          .with({ changes: 'copied', oldPath: P.select() }, (oldPath) => ({
            Moved: { changes: { Copied: {} }, oldPath },
          }))
          .exhaustive(),
      },
    }))
    .with({ status: 'unstaged' }, (file) => ({
      Unstaged: {
        path: file.path,
        status: match(file.changes)
          .with('added', () => ({ Added: {} }))
          .with('deleted', () => ({ Deleted: {} }))
          .with('modified', () => ({ Modified: {} }))
          .with('typeChanged', () => ({ TypeChanged: {} }))
          .exhaustive(),
      },
    }))
    .with({ status: 'unmerged' }, (file) => ({
      Unmerged: {
        path: file.path,
        status: match(file.changes)
          .with('bothAdded', () => ({ BothAdded: {} }))
          .with('bothDeleted', () => ({ BothDeleted: {} }))
          .with('bothModified', () => ({ BothModified: {} }))
          .with('addedByThem', () => ({ AddedByThem: {} }))
          .with('addedByUs', () => ({ AddedByUs: {} }))
          .with('deletedByThem', () => ({ DeletedByThem: {} }))
          .with('deletedByUs', () => ({ DeletedByUs: {} }))
          .exhaustive(),
      },
    }))
    .with({ status: 'untracked' }, (file) => ({
      Untracked: { path: file.path },
    }))
    .exhaustive()
}

type SerializedVersionedFile = SchemaType<typeof VERSIONED_FILE_INFO_SCHEMA>

const serializeVersionedFile = (
  file: VersionedFileInfo,
): SerializedVersionedFile => {
  return {
    path: file.path,
    status: match(file)
      .returnType<SerializedVersionedFile['status']>()
      .with({ changes: 'added' }, () => ({
        Changed: { changes: { Added: {} } },
      }))
      .with({ changes: 'deleted' }, () => ({
        Changed: { changes: { Deleted: {} } },
      }))
      .with({ changes: 'modified' }, () => ({
        Changed: { changes: { Modified: {} } },
      }))
      .with({ changes: 'typeChanged' }, () => ({
        Changed: { changes: { TypeChanged: {} } },
      }))
      .with({ changes: 'renamed', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Renamed: {} }, oldPath },
      }))
      .with({ changes: 'copied', oldPath: P.select() }, (oldPath) => ({
        Moved: { changes: { Copied: {} }, oldPath },
      }))
      .exhaustive(),
  }
}

export { filesDiffQueryKeys, useQueryFileDiff }

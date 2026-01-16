import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import { useWorktreeFilesPage } from '@/state/pages'

import type {
  ChangeStatus,
  FileOfType,
  MergeStatus,
  MovedStatus,
  Page,
  StagedFileInfo,
  WorktreeFileInfo,
  WorktreeFileType,
  WorktreeFileTypes,
} from '../models'
import { WORKTREE_FILES_PAGE_SCHEMA } from '../schemas'
import {
  fetchAndDeserialize,
  getFileTypeFilter,
  pathQueryKey,
  useRepositoryQuery,
} from '../utils'

export const WORKTREE_FILES_PAGE_SIZE = 1000

const worktreeFilesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'worktree_files',
    }) as const,
  status: (repoPath: string, types: WorktreeFileType | WorktreeFileType[]) => ({
    all: {
      ...worktreeFilesQueryKeys.all(repoPath),
      ...getFileTypeFilter(types),
    } as const,
    pathspec: (pathspec: string | undefined) =>
      ({
        ...worktreeFilesQueryKeys.status(repoPath, types).all,
        pathspec: pathspec,
      }) as const,
    page: (pathspec: string | undefined, page: number) =>
      ({
        ...worktreeFilesQueryKeys.status(repoPath, types).pathspec(pathspec),
        page: page,
      }) as const,
  }),
}

const fetchWorktreeFilesPage = async <T extends WorktreeFileType>(
  repoPath: string,
  types: T | T[],
  pathspec: string | null,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<FileOfType<T>>> => {
  const filter = getFileTypeFilter(types)
  const res = await fetchAndDeserialize(
    'get_worktree_files_page',
    {
      repoPath,
      filter,
      pathspec,
      startAfter: page * WORKTREE_FILES_PAGE_SIZE,
      limit: WORKTREE_FILES_PAGE_SIZE,
    },
    WORKTREE_FILES_PAGE_SCHEMA,
    context,
  )

  const files = res.items.map((item) =>
    match(item)
      .returnType<WorktreeFileInfo>()
      .with({ Staged: P.select() }, (file) => {
        return match(file)
          .returnType<StagedFileInfo>()
          .with({ status: { Changed: P.select() } }, (status) => ({
            path: file.path,
            status: 'staged',
            changes: match(status.changes)
              .returnType<ChangeStatus>()
              .with({ Added: P.any }, () => 'added')
              .with({ Deleted: P.any }, () => 'deleted')
              .with({ Modified: P.any }, () => 'modified')
              .with({ TypeChanged: P.any }, () => 'typeChanged')
              .exhaustive(),
          }))
          .with({ status: { Moved: P.select() } }, (status) => ({
            path: file.path,
            status: 'staged',
            oldPath: status.oldPath,
            changes: match(status.changes)
              .returnType<MovedStatus>()
              .with({ Copied: P.any }, () => 'copied')
              .with({ Renamed: P.any }, () => 'renamed')
              .exhaustive(),
          }))
          .exhaustive()
      })
      .with({ Unstaged: P.select() }, (file) => ({
        path: file.path,
        status: 'unstaged',
        changes: match(file.status)
          .returnType<ChangeStatus>()
          .with({ Added: P.any }, () => 'added')
          .with({ Deleted: P.any }, () => 'deleted')
          .with({ Modified: P.any }, () => 'modified')
          .with({ TypeChanged: P.any }, () => 'typeChanged')
          .exhaustive(),
      }))
      .with({ Unmerged: P.select() }, (file) => ({
        path: file.path,
        status: 'unmerged',
        changes: match(file.status)
          .returnType<MergeStatus>()
          .with({ BothAdded: P.any }, () => 'bothAdded')
          .with({ BothDeleted: P.any }, () => 'bothDeleted')
          .with({ BothModified: P.any }, () => 'bothModified')
          .with({ AddedByThem: P.any }, () => 'addedByThem')
          .with({ AddedByUs: P.any }, () => 'addedByUs')
          .with({ DeletedByThem: P.any }, () => 'deletedByThem')
          .with({ DeletedByUs: P.any }, () => 'deletedByUs')
          .exhaustive(),
      }))
      .with({ Untracked: P.select() }, (file) => ({
        path: file.path,
        status: 'untracked',
      }))
      .exhaustive(),
  )

  const matchingFiles = files.filter(
    (file): file is FileOfType<T> =>
      (!!filter.staged && file.status === 'staged') ||
      (!!filter.unstaged && file.status === 'unstaged') ||
      (!!filter.unmerged && file.status === 'unmerged') ||
      (!!filter.untracked && file.status === 'untracked'),
  )

  return {
    hasNext: res.hasNext,
    items: matchingFiles,
  }
}

const worktreeFilesQuery = <T extends WorktreeFileType>(
  repoPath: string,
  types: T | T[],
  page: number,
  pathspec?: string,
) =>
  queryOptions({
    queryKey: [
      worktreeFilesQueryKeys
        .status(repoPath, types)
        .page(pathspec ? pathspec : undefined, page),
    ],
    queryFn: (context) =>
      fetchWorktreeFilesPage(
        repoPath,
        types,
        pathspec ? pathspec : null,
        page,
        context,
      ),
  })

const useQueryWorktreeFiles = <T extends WorktreeFileType>(
  types: T | T[],
  pathspec?: string,
): UseQueryResult<Page<WorktreeFileTypes[T]>> =>
  useRepositoryQuery(
    worktreeFilesQuery,
    types,
    useWorktreeFilesPage(types),
    pathspec,
  )

export { worktreeFilesQueryKeys, useQueryWorktreeFiles }

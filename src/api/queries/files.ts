import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import { useFilesPage } from '@/context/pages'

import type {
  ChangeStatus,
  FileInfo,
  FileOfType,
  FileType,
  FileTypes,
  MergeStatus,
  MovedStatus,
  Page,
  StagedFileInfo,
} from '../models'
import { FILES_PAGE_SCHEMA } from '../schemas'
import {
  fetchAndDeserialize,
  getFileTypeFilter,
  useRepositoryQuery,
} from '../utils'
import { pathQueryKey } from '.'

export const FILE_STATUSES_PAGE_SIZE = 1000

const filesQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'files',
    }) as const,
  status: (path: string, types: FileType | FileType[]) => ({
    all: {
      ...filesQueryKeys.all(path),
      ...getFileTypeFilter(types),
    } as const,
    pathspec: (pathspec: string | undefined) =>
      ({
        ...filesQueryKeys.status(path, types).all,
        pathspec: pathspec,
      }) as const,
    page: (pathspec: string | undefined, page: number) =>
      ({
        ...filesQueryKeys.status(path, types).pathspec(pathspec),
        page: page,
      }) as const,
  }),
}

const fetchFilesPage = async <T extends FileType>(
  path: string,
  types: T | T[],
  pathspec: string | null,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<FileOfType<T>>> => {
  const filter = getFileTypeFilter(types)
  const res = await fetchAndDeserialize(
    'get_files_page',
    {
      path,
      filter,
      pathspec,
      startAfter: page * FILE_STATUSES_PAGE_SIZE,
      limit: FILE_STATUSES_PAGE_SIZE,
    },
    FILES_PAGE_SCHEMA,
    context,
  )

  const files = res.items.map((item) =>
    match(item)
      .returnType<FileInfo>()
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

const filesQuery = <T extends FileType>(
  path: string,
  types: T | T[],
  page: number,
  pathspec?: string,
) =>
  queryOptions({
    queryKey: [
      filesQueryKeys
        .status(path, types)
        .page(pathspec ? pathspec : undefined, page),
    ],
    queryFn: (context) =>
      fetchFilesPage(path, types, pathspec ? pathspec : null, page, context),
  })

function useQueryFiles<T extends FileType>(
  types: T | T[],
  pathspec?: string,
): UseQueryResult<Page<FileTypes[T]>> {
  return useRepositoryQuery(filesQuery, types, useFilesPage(types), pathspec)
}

export { filesQueryKeys, useQueryFiles }

import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type {
  ChangeStatus,
  MovedStatus,
  Page,
  StashId,
  VersionedFileInfo,
} from '../models'
import { VERSIONED_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

export const STASH_FILES_PAGE_SIZE = 1000

const stashFilesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'stash_files',
    }) as const,
  stash: (repoPath: string, stashId: StashId) => ({
    all: {
      ...stashFilesQueryKeys.all(repoPath),
      stashId,
    } as const,
    page: (page: number) =>
      ({
        ...stashFilesQueryKeys.stash(repoPath, stashId).all,
        page,
      }) as const,
  }),
}

const fetchStashFilesPage = async (
  repoPath: string,
  stashId: StashId,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<VersionedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_stash_files_page',
    {
      repoPath,
      stashId,
      startAfter: page * STASH_FILES_PAGE_SIZE,
      limit: STASH_FILES_PAGE_SIZE,
    },
    VERSIONED_FILES_PAGE_SCHEMA,
    context,
  )

  const files: VersionedFileInfo[] = res.items.map((file) =>
    match(file)
      .returnType<VersionedFileInfo>()
      .with({ status: { Changed: P.select() } }, (status) => ({
        path: file.path,
        status: 'versioned',
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
        status: 'versioned',
        oldPath: status.oldPath,
        changes: match(status.changes)
          .returnType<MovedStatus>()
          .with({ Copied: P.any }, () => 'copied')
          .with({ Renamed: P.any }, () => 'renamed')
          .exhaustive(),
      }))
      .exhaustive(),
  )

  return { hasNext: res.hasNext, items: files }
}

const stashFilesQuery = (repoPath: string, stashId: StashId, page: number) =>
  queryOptions({
    queryKey: [stashFilesQueryKeys.stash(repoPath, stashId).page(page)],
    queryFn: (context) => fetchStashFilesPage(repoPath, stashId, page, context),
  })

const useQueryStashFiles = (
  stashId: StashId,
  page: number,
): UseQueryResult<Page<VersionedFileInfo>> =>
  useRepositoryQuery(stashFilesQuery, stashId, page)

export { stashFilesQueryKeys, useQueryStashFiles }

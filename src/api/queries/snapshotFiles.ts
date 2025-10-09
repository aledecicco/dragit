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
  SnapshotId,
  VersionedFileInfo,
} from '../models'
import { SNAPSHOT_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

export const SNAPSHOT_FILES_PAGE_SIZE = 1000

const snapshotFilesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'snapshot_files',
    }) as const,
  snapshot: (repoPath: string, snapshot: SnapshotId) => ({
    all: {
      ...snapshotFilesQueryKeys.all(repoPath),
      snapshot,
    } as const,
    page: (page: number) =>
      ({
        ...snapshotFilesQueryKeys.snapshot(repoPath, snapshot).all,
        page: page,
      }) as const,
  }),
}

const fetchSnapshotFilesPage = async (
  repoPath: string,
  snapshotId: SnapshotId,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<VersionedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_snapshot_files_page',
    {
      repoPath,
      snapshotId,
      startAfter: page * SNAPSHOT_FILES_PAGE_SIZE,
      limit: SNAPSHOT_FILES_PAGE_SIZE,
    },
    SNAPSHOT_FILES_PAGE_SCHEMA,
    context,
  )

  const files: VersionedFileInfo[] = res.items.map((file) =>
    match(file)
      .returnType<VersionedFileInfo>()
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
      .exhaustive(),
  )

  return {
    hasNext: res.hasNext,
    items: files,
  }
}

const snapshotFilesQuery = (
  repoPath: string,
  page: number,
  snapshotId: SnapshotId,
) =>
  queryOptions({
    queryKey: [
      snapshotFilesQueryKeys.snapshot(repoPath, snapshotId).page(page),
    ],
    queryFn: (context) =>
      fetchSnapshotFilesPage(repoPath, snapshotId, page, context),
  })

const useQuerySnapshotFiles = (
  snapshotId: SnapshotId,
  page: number,
): UseQueryResult<Page<VersionedFileInfo>> => {
  return useRepositoryQuery(snapshotFilesQuery, page, snapshotId)
}

export { snapshotFilesQueryKeys, useQuerySnapshotFiles }

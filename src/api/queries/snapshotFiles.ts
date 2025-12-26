import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import { MS_IN_SECOND } from '@/utils/time'

import type {
  ChangeStatus,
  MovedStatus,
  Page,
  SnapshotId,
  SnapshotInfo,
  VersionedFileInfo,
} from '../models'
import { SNAPSHOT_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

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
  snapshot: SnapshotInfo,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<VersionedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_snapshot_files_page',
    {
      repoPath,
      snapshot: {
        ...snapshot,
        timestamp: snapshot.timestamp / MS_IN_SECOND,
      },
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

  return {
    hasNext: res.hasNext,
    items: files,
  }
}

const snapshotFilesQuery = (
  repoPath: string,
  page: number,
  snapshot: SnapshotInfo,
) =>
  queryOptions({
    queryKey: [
      snapshotFilesQueryKeys.snapshot(repoPath, snapshot.id).page(page),
    ],
    queryFn: (context) =>
      fetchSnapshotFilesPage(repoPath, snapshot, page, context),
  })

const useQuerySnapshotFiles = (
  snapshot: SnapshotInfo,
  page: number,
): UseQueryResult<Page<VersionedFileInfo>> =>
  useRepositoryQuery(snapshotFilesQuery, page, snapshot)

export { snapshotFilesQueryKeys, useQuerySnapshotFiles }

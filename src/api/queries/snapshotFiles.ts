import {
  type QueryFunctionContext,
  queryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { match, P } from 'ts-pattern'

import type {
  Page,
  SnapshotId,
  VersionedFileInfo,
  VersionedFileStatus,
} from '../models'
import { SNAPSHOT_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'
import { pathQueryKey } from '.'

export const SNAPSHOT_FILES_PAGE_SIZE = 1000

const snapshotFilesQueryKeys = {
  all: (path: string) =>
    ({
      ...pathQueryKey(path),
      key: 'snapshot_files',
    }) as const,
  snapshot: (path: string, snapshot: SnapshotId) => ({
    all: {
      ...snapshotFilesQueryKeys.all(path),
      snapshot,
    } as const,
    page: (page: number) =>
      ({
        ...snapshotFilesQueryKeys.snapshot(path, snapshot).all,
        page: page,
      }) as const,
  }),
}

const fetchSnapshotFilesPage = async (
  path: string,
  snapshotId: SnapshotId,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<VersionedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_snapshot_files_page',
    {
      path,
      snapshotId,
      startAfter: page * SNAPSHOT_FILES_PAGE_SIZE,
      limit: SNAPSHOT_FILES_PAGE_SIZE,
    },
    SNAPSHOT_FILES_PAGE_SCHEMA,
    context,
  )

  const files: VersionedFileInfo[] = res.items.map((item) => ({
    path: item.path,
    status: match(item.status)
      .returnType<VersionedFileStatus>()
      .with({ Modified: P._ }, () => 'modified')
      .with({ TypeChanged: P._ }, () => 'typeChanged')
      .with({ Added: P._ }, () => 'added')
      .with({ Deleted: P._ }, () => 'deleted')
      .with({ Renamed: P._ }, () => 'renamed')
      .with({ Copied: P._ }, () => 'copied')
      .exhaustive(),
  }))

  return {
    hasNext: res.hasNext,
    items: files,
  }
}

const snapshotFilesQuery = (
  path: string,
  page: number,
  snapshotId: SnapshotId,
) =>
  queryOptions({
    queryKey: [snapshotFilesQueryKeys.snapshot(path, snapshotId).page(page)],
    queryFn: (context) =>
      fetchSnapshotFilesPage(path, snapshotId, page, context),
  })

function useQuerySnapshotFiles(
  snapshotId: SnapshotId,
  page: number,
): UseQueryResult<Page<VersionedFileInfo>> {
  return useRepositoryQuery(snapshotFilesQuery, page, snapshotId)
}

export { snapshotFilesQueryKeys, useQuerySnapshotFiles }

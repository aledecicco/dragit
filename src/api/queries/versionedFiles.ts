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
  RefName,
  VersionedFileInfo,
} from '../models'
import { VERSIONED_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, pathQueryKey, useRepositoryQuery } from '../utils'

export const VERSIONED_FILES_PAGE_SIZE = 1000

const versionedFilesQueryKeys = {
  all: (repoPath: string) =>
    ({
      ...pathQueryKey(repoPath),
      key: 'versioned_files',
    }) as const,
  snapshot: (repoPath: string, reference: RefName, against?: RefName) => ({
    all: {
      ...versionedFilesQueryKeys.all(repoPath),
      reference,
      against,
    } as const,
    page: (page: number) =>
      ({
        ...versionedFilesQueryKeys.snapshot(repoPath, reference, against).all,
        page: page,
      }) as const,
  }),
}

const fetchVersionedFilesPage = async (
  repoPath: string,
  reference: RefName,
  against: RefName | undefined,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<VersionedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_versioned_files_page',
    {
      repoPath,
      reference,
      against: against ?? null,
      startAfter: page * VERSIONED_FILES_PAGE_SIZE,
      limit: VERSIONED_FILES_PAGE_SIZE,
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

  return {
    hasNext: res.hasNext,
    items: files,
  }
}

const versionedFilesQuery = (
  repoPath: string,
  reference: RefName,
  page: number,
  against?: RefName,
) =>
  queryOptions({
    queryKey: [
      versionedFilesQueryKeys.snapshot(repoPath, reference, against).page(page),
    ],
    queryFn: (context) =>
      fetchVersionedFilesPage(repoPath, reference, against, page, context),
  })

const useQueryVersionedFiles = (
  reference: RefName,
  page: number,
  against?: RefName,
): UseQueryResult<Page<VersionedFileInfo>> =>
  useRepositoryQuery(versionedFilesQuery, reference, page, against)

export { versionedFilesQueryKeys, useQueryVersionedFiles }

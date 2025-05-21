import {
  type QueryFunctionContext,
  type UseQueryResult,
  queryOptions,
} from '@tanstack/react-query'
import { P, match } from 'ts-pattern'

import { commitInfoQueryKeys } from '.'
import type {
  CommitId,
  CommitedFileInfo,
  CommitedFileStatus,
  Page,
} from '../models'
import { COMMIT_FILES_PAGE_SCHEMA } from '../schemas'
import { fetchAndDeserialize, useRepositoryQuery } from '../utils'

export const COMMIT_FILES_PAGE_SIZE = 1000

const commitFilesQueryKeys = {
  files: (path: string, commit: CommitId) => ({
    all: {
      ...commitInfoQueryKeys.commit(path, commit),
      data: 'files',
    } as const,
    page: (page: number) =>
      ({
        ...commitFilesQueryKeys.files(path, commit).all,
        page: page,
      }) as const,
  }),
}

const fetchCommitFilesPage = async (
  path: string,
  reference: CommitId,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<CommitedFileInfo>> => {
  const res = await fetchAndDeserialize(
    'get_commit_files_page',
    {
      path,
      reference,
      startAfter: page * COMMIT_FILES_PAGE_SIZE,
      limit: COMMIT_FILES_PAGE_SIZE,
    },
    COMMIT_FILES_PAGE_SCHEMA,
    context,
  )

  const files: CommitedFileInfo[] = res.items.map((item) => ({
    path: item.path,
    status: match(item.status)
      .returnType<CommitedFileStatus>()
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

const commitFilesQuery = (path: string, page: number, reference: CommitId) =>
  queryOptions({
    queryKey: [commitFilesQueryKeys.files(path, reference).page(page)],
    queryFn: (context) => fetchCommitFilesPage(path, reference, page, context),
  })

function useQueryCommitFiles(
  reference: CommitId,
  page: number,
): UseQueryResult<Page<CommitedFileInfo>> {
  return useRepositoryQuery(commitFilesQuery, page, reference)
}

export { commitFilesQueryKeys, useQueryCommitFiles }

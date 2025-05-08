import {
  type QueryFunctionContext,
  type UseQueryResult,
  infiniteQueryOptions,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { P, match } from 'ts-pattern'

import { useFilesPage } from '@context/pages'
import { MS_IN_SECOND } from '@utils/time'
import type {
  BranchDivergence,
  BranchInfo,
  BranchName,
  ChangeStatus,
  CommitId,
  CommitInfo,
  CommonAncestorInfo,
  CurrentDirInfo,
  FileInfo,
  FileOfType,
  FileType,
  FileTypes,
  HeadInfo,
  HistoryItem,
  MergeStatus,
  MovedStatus,
  Page,
  RemoteInfo,
  RemoteRef,
  Settings,
  StagedFileInfo,
  StashInfo,
} from './models'
import {
  BRANCHES_SCHEMA,
  BRANCH_DIVERGENCE_SCHEMA,
  COMMIT_INFO_SCHEMA,
  COMMON_ANCESTOR_INFO_SCHEMA,
  CURRENT_DIR_INFO_SCHEMA,
  FILES_PAGE_SCHEMA,
  HEAD_INFO_SCHEMA,
  HISTORY_PAGE_SCHEMA,
  RECENTLY_OPENED_SCHEMA,
  REMOTES_SCHEMA,
  STASHES_SCHEMA,
} from './schemas'
import {
  fetchAndDeserialize,
  getFileTypeFilter,
  useRepositoryInfiniteQuery,
  useRepositoryQuery,
} from './utils'

export const HISTORY_PAGE_SIZE = 50
export const FILE_STATUSES_PAGE_SIZE = MS_IN_SECOND

const queryKeys = {
  currentDir: ['current_dir'] as const,
  settings: ['settings'] as const,
  recentlyOpened: ['recently_opened'] as const,
  directory: {
    current: (path: string) => ({ path: path }) as const,
    isRepository: (path: string) =>
      ({
        ...queryKeys.directory.current(path),
        key: 'is_repository',
      }) as const,
    headInfo: (path: string) =>
      ({
        ...queryKeys.directory.current(path),
        key: 'head_info',
      }) as const,

    files: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'files',
        }) as const,
      status: (path: string, types: FileType | FileType[]) => ({
        all: {
          ...queryKeys.directory.files.all(path),
          ...getFileTypeFilter(types),
        } as const,
        pathspec: (pathspec: string | undefined) =>
          ({
            ...queryKeys.directory.files.status(path, types).all,
            pathspec: pathspec,
          }) as const,
        page: (pathspec: string | undefined, page: number) =>
          ({
            ...queryKeys.directory.files.status(path, types).pathspec(pathspec),
            page: page,
          }) as const,
      }),
    },
    branches: (path: string) =>
      ({
        ...queryKeys.directory.current(path),
        key: 'branches',
      }) as const,
    commitHistory: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'commit_history',
        }) as const,
      reference: (path: string, reference: string | undefined) =>
        ({
          ...queryKeys.directory.commitHistory.all(path),
          reference: reference,
        }) as const,
    },
    commitInfo: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'commit_info',
        }) as const,
      commit: (path: string, commit: CommitId) =>
        ({
          ...queryKeys.directory.commitInfo.all(path),
          commit: commit,
        }) as const,
    },
    commonAncestor: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'common_ancestor',
        }) as const,
      reference: (path: string, reference: string | undefined) =>
        ({
          ...queryKeys.directory.commonAncestor.all(path),
          reference: reference,
        }) as const,
      baseReference: (path: string, baseReference: string | undefined) =>
        ({
          ...queryKeys.directory.commonAncestor.all(path),
          baseReference: baseReference,
        }) as const,
      pair: (
        path: string,
        reference: string | undefined,
        baseReference: string | undefined,
      ) =>
        ({
          ...queryKeys.directory.commonAncestor.reference(path, reference),
          ...queryKeys.directory.commonAncestor.baseReference(
            path,
            baseReference,
          ),
        }) as const,
    },
    branchDivergence: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'branch_divergence',
        }) as const,
      branch: (path: string, branch: BranchName | undefined) =>
        ({
          ...queryKeys.directory.branchDivergence.all(path),
          branch: branch,
        }) as const,
      baseBranch: (path: string, baseBranch: BranchName | undefined) =>
        ({
          ...queryKeys.directory.branchDivergence.all(path),
          baseBranch: baseBranch,
        }) as const,
      pair: (
        path: string,
        branch: BranchName | undefined,
        baseBranch: BranchName | undefined,
      ) =>
        ({
          ...queryKeys.directory.branchDivergence.branch(path, branch),
          ...queryKeys.directory.branchDivergence.baseBranch(path, baseBranch),
        }) as const,
    },
    remotes: (path: string) =>
      ({
        ...queryKeys.directory.current(path),
        key: 'remotes',
      }) as const,
    stashes: (path: string) =>
      ({
        ...queryKeys.directory.current(path),
        key: 'stashes',
      }) as const,
  },
}

const fetchSettings = (): Promise<Settings> => invoke('get_setings')

const settingsQuery = queryOptions({
  queryKey: [queryKeys.settings],
  queryFn: fetchSettings,
})

const useQuerySettings = () => useQuery(settingsQuery)

const fetchCurrentDir = (
  context: QueryFunctionContext,
): Promise<CurrentDirInfo | null> => {
  return fetchAndDeserialize(
    'get_current_dir',
    {},
    CURRENT_DIR_INFO_SCHEMA,
    context,
  )
}

const currentDirQuery = queryOptions({
  queryKey: [queryKeys.currentDir],
  queryFn: fetchCurrentDir,
})

const useQueryCurrentDir = () => useQuery(currentDirQuery)

const fetchRecentlyOpened = (
  context: QueryFunctionContext,
): Promise<string[]> => {
  return fetchAndDeserialize(
    'get_recently_opened',
    {},
    RECENTLY_OPENED_SCHEMA,
    context,
  )
}

const recentlyOpenedQuery = queryOptions({
  queryKey: [queryKeys.recentlyOpened],
  queryFn: fetchRecentlyOpened,
})

const useQueryRecentlyOpened = () => useQuery(recentlyOpenedQuery)

const fetchHeadInfo = async (
  path: string,
  context: QueryFunctionContext,
): Promise<HeadInfo> => {
  const res = await fetchAndDeserialize(
    'get_head_info',
    { path },
    HEAD_INFO_SCHEMA,
    context,
  )

  return match(res)
    .returnType<HeadInfo>()
    .with({ Branch: { name: P.select() } }, (branchName) => ({
      type: 'branch',
      name: branchName,
    }))
    .with({ Detached: { commit: P.select() } }, (commit) => ({
      type: 'detached',
      commit: commit,
    }))
    .exhaustive()
}

const headInfoQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.headInfo(path)],
    queryFn: (context) => fetchHeadInfo(path, context),
  })

const useQueryHeadInfo = () => useRepositoryQuery(headInfoQuery)

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
      queryKeys.directory.files
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

const fetchBranches = async (
  path: string,
  context: QueryFunctionContext,
): Promise<BranchInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_branches',
    { path },
    BRANCHES_SCHEMA,
    context,
  )

  return res.map((resItem) =>
    match(resItem)
      .returnType<BranchInfo>()
      .with({ Local: P.select() }, (branch) => ({
        type: 'local',
        name: branch.name,
        timestamp: branch.timestamp * MS_IN_SECOND,
        remote: branch.remote,
      }))
      .with({ Remote: P.select() }, (branch) => ({
        type: 'remote',
        name: branch.name as RemoteRef,
        timestamp: branch.timestamp * MS_IN_SECOND,
      }))
      .exhaustive(),
  )
}

const branchesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.branches(path)],
    queryFn: (context) => fetchBranches(path, context),
  })

const useQueryBranches = () => useRepositoryQuery(branchesQuery)

const fetchCommitHistoryPage = (
  path: string,
  refName: string,
  page: number,
  context: QueryFunctionContext,
): Promise<Page<HistoryItem>> => {
  return fetchAndDeserialize(
    'get_commit_history_page',
    {
      path,
      reference: refName,
      startAfter: page * HISTORY_PAGE_SIZE,
      limit: HISTORY_PAGE_SIZE,
    },
    HISTORY_PAGE_SCHEMA,
    context,
  )
}

const commitHistoryQuery = (path: string, refName: string | undefined) =>
  infiniteQueryOptions({
    queryKey: [queryKeys.directory.commitHistory.reference(path, refName)],
    queryFn: refName
      ? (context) =>
          fetchCommitHistoryPage(path, refName, context.pageParam, context)
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNext ? lastPageParam + 1 : undefined
    },
  })

const useQueryCommitHistory = (refName: string | undefined) =>
  useRepositoryInfiniteQuery(commitHistoryQuery, refName)

const fetchCommitInfo = async (
  path: string,
  commitId: CommitId,
  context: QueryFunctionContext,
): Promise<CommitInfo> => {
  const res = await fetchAndDeserialize(
    'get_commit_info',
    { path, reference: commitId },
    COMMIT_INFO_SCHEMA,
    context,
  )

  return {
    ...res,
    timestamp: res.timestamp * MS_IN_SECOND,
  }
}

const commitInfoQuery = (path: string, commitId: CommitId) =>
  queryOptions({
    queryKey: [queryKeys.directory.commitInfo.commit(path, commitId)],
    queryFn: (context) => fetchCommitInfo(path, commitId, context),
  })

const useQueryCommitInfo = (commitId: CommitId) =>
  useRepositoryQuery(commitInfoQuery, commitId)

const fetchCommonAncestor = (
  path: string,
  refName: string,
  baseRefName: string,
  context: QueryFunctionContext,
): Promise<CommonAncestorInfo | null> => {
  return fetchAndDeserialize(
    'get_common_ancestor',
    { path, referenceA: refName, referenceB: baseRefName },
    COMMON_ANCESTOR_INFO_SCHEMA,
    context,
  )
}

const commonAncestorQuery = (
  path: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [
      queryKeys.directory.commonAncestor.pair(path, refName, baseRefName),
    ],
    queryFn:
      refName && baseRefName
        ? (context) => fetchCommonAncestor(path, refName, baseRefName, context)
        : skipToken,
  })

const useQueryCommonAncestor = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(commonAncestorQuery, refName, baseRefName)

const fetchBranchDivergence = (
  path: string,
  branch: BranchName,
  baseBranch: BranchName,
  context: QueryFunctionContext,
): Promise<BranchDivergence> => {
  return fetchAndDeserialize(
    'get_branch_divergence',
    { path, branch, baseBranch },
    BRANCH_DIVERGENCE_SCHEMA,
    context,
  )
}

const branchDivergenceQuery = (
  path: string,
  refName: string | undefined,
  baseRefName: string | undefined,
) =>
  queryOptions({
    queryKey: [
      queryKeys.directory.branchDivergence.pair(path, refName, baseRefName),
    ],
    queryFn:
      refName && baseRefName
        ? (context) =>
            fetchBranchDivergence(path, refName, baseRefName, context)
        : skipToken,
  })

const useQueryBranchDivergence = (
  refName: string | undefined,
  baseRefName: string | undefined,
) => useRepositoryQuery(branchDivergenceQuery, refName, baseRefName)

const fetchRemotes = (
  path: string,
  context: QueryFunctionContext,
): Promise<RemoteInfo[]> => {
  return fetchAndDeserialize('get_remotes', { path }, REMOTES_SCHEMA, context)
}

const remotesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.remotes(path)],
    queryFn: (context) => fetchRemotes(path, context),
  })

const useQueryRemotes = () => useRepositoryQuery(remotesQuery)

const fetchStashes = async (
  path: string,
  context: QueryFunctionContext,
): Promise<StashInfo[]> => {
  const res = await fetchAndDeserialize(
    'get_stashes',
    { path },
    STASHES_SCHEMA,
    context,
  )

  return res.map((resItem) => ({
    ...resItem,
    timestamp: resItem.timestamp * MS_IN_SECOND,
  }))
}

const stashesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.stashes(path)],
    queryFn: (context) => fetchStashes(path, context),
  })

const useQueryStashes = () => useRepositoryQuery(stashesQuery)

export {
  queryKeys,
  useQuerySettings,
  useQueryCurrentDir,
  useQueryRecentlyOpened,
  useQueryHeadInfo,
  useQueryFiles,
  useQueryBranches,
  useQueryCommitHistory,
  useQueryCommitInfo,
  useQueryCommonAncestor,
  useQueryBranchDivergence,
  useQueryRemotes,
  useQueryStashes,
}

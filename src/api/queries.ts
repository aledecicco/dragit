import {
  type UseQueryResult,
  infiniteQueryOptions,
  queryOptions,
  skipToken,
  useQuery,
} from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { match } from 'ts-pattern'

import { useFilesPage } from '@context/pages'
import type {
  BranchDivergence,
  BranchInfo,
  BranchName,
  CommitId,
  CommitInfo,
  CommonAncestorInfo,
  CurrentDirInfo,
  FileType,
  FileTypes,
  HeadInfo,
  HistoryItem,
  Page,
  RemoteInfo,
  Settings,
  StashInfo,
} from './models'
import { useRepositoryInfiniteQuery, useRepositoryQuery } from './utils'

export const HISTORY_PAGE_SIZE = 50
export const FILE_STATUSES_PAGE_SIZE = 1000

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
      staged: (path: string) => ({
        all: {
          ...queryKeys.directory.files.all(path),
          status: 'staged',
        } as const,
        page: (page: number) =>
          ({
            ...queryKeys.directory.files.staged(path).all,
            page: page,
          }) as const,
      }),
      unstaged: (path: string) => ({
        all: {
          ...queryKeys.directory.files.all(path),
          status: 'unstaged',
        } as const,
        page: (page: number) =>
          ({
            ...queryKeys.directory.files.unstaged(path).all,
            page: page,
          }) as const,
      }),
      unmerged: (path: string) => ({
        all: {
          ...queryKeys.directory.files.all(path),
          status: 'unmerged',
        } as const,
        page: (page: number) =>
          ({
            ...queryKeys.directory.files.unmerged(path).all,
            page: page,
          }) as const,
      }),
      untracked: (path: string) => ({
        all: {
          ...queryKeys.directory.files.all(path),
          status: 'untracked',
        } as const,
        page: (page: number) =>
          ({
            ...queryKeys.directory.files.untracked(path).all,
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
      branch: (path: string, branch: BranchName | undefined) =>
        ({
          ...queryKeys.directory.commitHistory.all(path),
          branch: branch,
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
      branch: (path: string, branch: BranchName | undefined) =>
        ({
          ...queryKeys.directory.commonAncestor.all(path),
          branch: branch,
        }) as const,
      baseBranch: (path: string, baseBranch: BranchName | undefined) =>
        ({
          ...queryKeys.directory.commonAncestor.all(path),
          baseBranch: baseBranch,
        }) as const,
      pair: (
        path: string,
        branch: BranchName | undefined,
        baseBranch: BranchName | undefined,
      ) =>
        ({
          ...queryKeys.directory.commonAncestor.branch(path, branch),
          ...queryKeys.directory.commonAncestor.baseBranch(path, baseBranch),
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

const fetchCurrentDir = (): Promise<CurrentDirInfo | null> =>
  invoke('get_current_dir')

const currentDirQuery = queryOptions({
  queryKey: [queryKeys.currentDir],
  queryFn: fetchCurrentDir,
})

const useQueryCurrentDir = () => useQuery(currentDirQuery)

const fetchSettings = (): Promise<Settings> => invoke('get_setings')

const settingsQuery = queryOptions({
  queryKey: [queryKeys.settings],
  queryFn: fetchSettings,
})

const useQuerySettings = () => useQuery(settingsQuery)

const fetchRecentlyOpened = (): Promise<string[]> =>
  invoke('get_recently_opened')

const recentlyOpenedQuery = queryOptions({
  queryKey: [queryKeys.recentlyOpened],
  queryFn: fetchRecentlyOpened,
})

const useQueryRecentlyOpened = () => useQuery(recentlyOpenedQuery)

const fetchHeadInfo = (path: string): Promise<HeadInfo> =>
  invoke('get_head_info', { path: path })

const headInfoQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.headInfo(path)],
    queryFn: () => fetchHeadInfo(path),
  })

const useQueryHeadInfo = () => useRepositoryQuery(headInfoQuery)

const fetchFiles = <T extends FileType>(
  path: string,
  type: T,
  page: number,
): Promise<Page<FileTypes[T]>> => {
  const command = match<FileType>(type)
    .with('staged', () => 'get_staged_files_page')
    .with('unstaged', () => 'get_unstaged_files_page')
    .with('unmerged', () => 'get_unmerged_files_page')
    .with('untracked', () => 'get_untracked_files_page')
    .exhaustive()

  return invoke(command, {
    path: path,
    startAfter: page * FILE_STATUSES_PAGE_SIZE,
    limit: FILE_STATUSES_PAGE_SIZE,
  })
}

const filesQuery = <T extends FileType>(path: string, type: T, page: number) =>
  queryOptions({
    queryKey: [queryKeys.directory.files[type](path).page(page)],
    queryFn: () => fetchFiles(path, type, page),
  })

function useQueryFiles<T extends FileType>(
  type: T,
): UseQueryResult<Page<FileTypes[T]>> {
  return useRepositoryQuery(filesQuery, type, useFilesPage(type))
}

const fetchBranches = (path: string): Promise<BranchInfo[]> =>
  invoke('get_branches', { path: path })

const branchesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.branches(path)],
    queryFn: () => fetchBranches(path),
  })

const useQueryBranches = () => useRepositoryQuery(branchesQuery)

const fetchCommitHistory = (
  path: string,
  branch: BranchName,
  page: number,
): Promise<Page<HistoryItem>> =>
  invoke('get_commit_history_page', {
    path: path,
    branch: branch,
    startAfter: page * HISTORY_PAGE_SIZE,
    limit: HISTORY_PAGE_SIZE,
  })

const commitHistoryQuery = (path: string, branch: BranchName | undefined) =>
  infiniteQueryOptions({
    queryKey: [queryKeys.directory.commitHistory.branch(path, branch)],
    queryFn: branch
      ? ({ pageParam }) => fetchCommitHistory(path, branch, pageParam)
      : skipToken,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.hasNext ? lastPageParam + 1 : undefined
    },
  })

const useQueryCommitHistory = (branch: BranchName | undefined) =>
  useRepositoryInfiniteQuery(commitHistoryQuery, branch)

const fetchCommitInfo = (
  path: string,
  commitId: CommitId,
): Promise<CommitInfo> =>
  invoke('get_commit_info', { path: path, reference: commitId })

const commitInfoQuery = (path: string, commitId: CommitId) =>
  queryOptions({
    queryKey: [queryKeys.directory.commitInfo.commit(path, commitId)],
    queryFn: () => fetchCommitInfo(path, commitId),
  })

const useQueryCommitInfo = (commitId: CommitId) =>
  useRepositoryQuery(commitInfoQuery, commitId)

const fetchCommonAncestor = (
  path: string,
  branch: BranchName,
  baseBranch: BranchName,
): Promise<CommonAncestorInfo | null> =>
  invoke('get_common_ancestor', {
    path: path,
    branch: branch,
    baseBranch: baseBranch,
  })

const commonAncestorQuery = (
  path: string,
  branch: BranchName | undefined,
  baseBranch: BranchName | undefined,
) =>
  queryOptions({
    queryKey: [
      queryKeys.directory.commonAncestor.pair(path, branch, baseBranch),
    ],
    queryFn:
      branch && baseBranch
        ? () => fetchCommonAncestor(path, branch, baseBranch)
        : skipToken,
  })

const useQueryCommonAncestor = (
  branch: BranchName | undefined,
  baseBranch: BranchName | undefined,
) => useRepositoryQuery(commonAncestorQuery, branch, baseBranch)

const fetchBranchDivergence = (
  path: string,
  branch: BranchName,
  baseBranch: BranchName,
): Promise<BranchDivergence | null> =>
  invoke('get_branch_divergence', {
    path: path,
    branch: branch,
    baseBranch: baseBranch,
  })

const branchDivergenceQuery = (
  path: string,
  branch: BranchName | undefined,
  baseBranch: BranchName | undefined,
) =>
  queryOptions({
    queryKey: [
      queryKeys.directory.branchDivergence.pair(path, branch, baseBranch),
    ],
    queryFn:
      branch && baseBranch
        ? () => fetchBranchDivergence(path, branch, baseBranch)
        : skipToken,
  })

const useQueryBranchDivergence = (
  branch: BranchName | undefined,
  baseBranch: BranchName | undefined,
) => useRepositoryQuery(branchDivergenceQuery, branch, baseBranch)

const fetchRemotes = (path: string): Promise<RemoteInfo[]> =>
  invoke('get_remotes', { path: path })

const remotesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.remotes(path)],
    queryFn: () => fetchRemotes(path),
  })

const useQueryRemotes = () => useRepositoryQuery(remotesQuery)

const fetchStashes = (path: string): Promise<StashInfo[]> =>
  invoke('get_stashes', { path: path })

const stashesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.stashes(path)],
    queryFn: () => fetchStashes(path),
  })

const useQueryStashes = () => useRepositoryQuery(stashesQuery)

export {
  queryKeys,
  useQueryCurrentDir,
  useQuerySettings,
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

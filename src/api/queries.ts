import {
  infiniteQueryOptions,
  queryOptions,
  skipToken,
} from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, CommitId, CommitInfo, HeadInfo } from './models'

const queryKeys = {
  currentDir: ['current_dir'] as const,
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
    branches: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'branches',
        }) as const,
      branch: (path: string, branch: BranchName) =>
        ({
          ...queryKeys.directory.branches.all(path),
          branch: branch,
        }) as const,
    },
    commitHistory: {
      all: (path: string) =>
        ({
          ...queryKeys.directory.current(path),
          key: 'commit_history',
        }) as const,
      branch: (path: string, branch: BranchName) =>
        ({
          ...queryKeys.directory.branches.branch(path, branch),
          ...queryKeys.directory.commitHistory.all(path),
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
      pair: (
        path: string,
        branch: BranchName | undefined,
        otherBranch: BranchName | undefined,
      ) =>
        ({
          ...queryKeys.directory.commonAncestor.branch(path, branch),
          otherBranch: otherBranch,
        }) as const,
    },
  },
}

const fetchCurrentDir = (): Promise<string | undefined> =>
  invoke('get_current_dir')

const currentDirQuery = queryOptions({
  queryKey: queryKeys.currentDir,
  queryFn: fetchCurrentDir,
})

const fetchIsRepository = (): Promise<boolean> => invoke('is_repository')

const isRepositoryQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.isRepository(path)],
    queryFn: fetchIsRepository,
  })

const fetchHeadInfo = (): Promise<HeadInfo> => invoke('get_head_info')

const headInfoQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.headInfo(path)],
    queryFn: fetchHeadInfo,
  })

const fetchBranches = (): Promise<BranchName[]> => invoke('get_branches')

const branchesQuery = (path: string) =>
  queryOptions({
    queryKey: [queryKeys.directory.branches.all(path)],
    queryFn: fetchBranches,
  })

export const PAGE_SIZE = 10

const fetchCommitHistory = (
  branch: BranchName,
  page: number,
): Promise<CommitId[]> =>
  invoke('get_commit_history', {
    branch: branch,
    startAfter: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

const commitHistoryQuery = (path: string, branch: BranchName) =>
  infiniteQueryOptions({
    queryKey: [queryKeys.directory.commitHistory.branch(path, branch)],
    queryFn: ({ pageParam }) => fetchCommitHistory(branch, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
  })

const fetchCommitInfo = (commitId: CommitId): Promise<CommitInfo> =>
  invoke('get_commit_info', { reference: commitId })

const commitInfoQuery = (path: string, commitId: CommitId) =>
  queryOptions({
    queryKey: [queryKeys.directory.commitInfo.commit(path, commitId)],
    queryFn: () => fetchCommitInfo(commitId),
  })

const fetchCommonAncestor = (
  branchA: BranchName,
  branchB: BranchName,
): Promise<CommitId | undefined> =>
  invoke('get_common_ancestor', { branchA: branchA, branchB: branchB })

const commonAncestorQuery = (
  path: string,
  branchA: BranchName | undefined,
  branchB: BranchName | undefined,
) =>
  queryOptions({
    queryKey: [queryKeys.directory.commonAncestor.pair(path, branchA, branchB)],
    queryFn:
      branchA && branchB
        ? () => fetchCommonAncestor(branchA, branchB)
        : skipToken,
  })

export {
  queryKeys,
  currentDirQuery,
  isRepositoryQuery,
  headInfoQuery,
  branchesQuery,
  commitHistoryQuery,
  commitInfoQuery,
  commonAncestorQuery,
}

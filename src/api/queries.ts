import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { CommitInfo, HeadInfo } from './models'

const queryKeys = {
  currentDir: ['current_dir'] as const,
  directory: {
    all: ['directory'] as const,
    current: (path: string) => [...queryKeys.directory.all, path] as const,
    isRepository: (path: string) =>
      [...queryKeys.directory.current(path), 'is_repository'] as const,
    headInfo: (path: string) =>
      [...queryKeys.directory.current(path), 'head_info'] as const,
    branches: {
      all: (path: string) =>
        [...queryKeys.directory.current(path), 'branches'] as const,
      branch: (path: string, branch: string) =>
        [...queryKeys.directory.branches.all(path), branch] as const,
    },
    commitHistory: {
      all: (path: string) =>
        [...queryKeys.directory.current(path), 'commit_history'] as const,
      branch: (path: string, branch: string) =>
        [...queryKeys.directory.commitHistory.all(path), branch] as const,
    },
    commitInfo: {
      all: (path: string) =>
        [...queryKeys.directory.current(path), 'commit_info'] as const,
      commit: (path: string, reference: string) =>
        [...queryKeys.directory.commitInfo.all(path), reference] as const,
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
    queryKey: queryKeys.directory.isRepository(path),
    queryFn: fetchIsRepository,
  })

const fetchHeadInfo = (): Promise<HeadInfo> => {
  const a: Promise<HeadInfo> = invoke('get_head_info')
  a.then(console.log).catch(console.log)
  return a
}

const headInfoQuery = (path: string) =>
  queryOptions({
    queryKey: queryKeys.directory.headInfo(path),
    queryFn: fetchHeadInfo,
  })

const fetchBranches = (): Promise<string[]> => invoke('get_branches')

const branchesQuery = (path: string) =>
  queryOptions({
    queryKey: queryKeys.directory.branches.all(path),
    queryFn: fetchBranches,
  })

const PAGE_SIZE = 10

const fetchCommitHistory = (branch: string, page: number): Promise<string[]> =>
  invoke('get_commit_history', {
    branch: branch,
    startAfter: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

const commitHistoryQuery = (path: string, branch: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.directory.commitHistory.branch(path, branch),
    queryFn: ({ pageParam }) => fetchCommitHistory(branch, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
  })

const fetchCommitInfo = (reference: string): Promise<CommitInfo> =>
  invoke('get_commit_info', { reference: reference })

const commitInfoQuery = (path: string, reference: string) =>
  queryOptions({
    queryKey: queryKeys.directory.commitInfo.commit(path, reference),
    queryFn: () => fetchCommitInfo(reference),
  })

export {
  queryKeys,
  currentDirQuery,
  isRepositoryQuery,
  headInfoQuery,
  branchesQuery,
  commitHistoryQuery,
  commitInfoQuery,
}

import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, RemoteName, Settings } from './models'
import { mutationOptions, useRepositoryMutation } from './utils'

const mutationKeys = {
  openFolder: ['open_folder'] as const,
  setSettings: ['set_settings'] as const,
  removeRecentFolder: ['remove_recent_folder'] as const,
  repository: {
    current: (path: string) => ({ path: path }) as const,
    initRepository: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'init_repository',
    }),
    checkoutLocal: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'checkout_local_branch',
    }),
    fetchRemote: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'fetch_remote',
    }),
    addToIndex: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'add_to_index',
    }),
    removeFromIndex: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'remove_from_index',
    }),
    removeFromTree: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'remove_from_tree',
    }),
    commitIndex: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'commit_index',
    }),
    pushBranch: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'push_branch',
    }),
    pullBranch: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'pull_branch',
    }),
  },
}

const openFolderMutation = mutationOptions({
  mutationKey: mutationKeys.openFolder,
  mutationFn: (args: { newPath: string }) => {
    return invoke('open_folder', args)
  },
})

const useOpenFolder = () => useMutation(openFolderMutation)

const removeRecentFolderMutation = mutationOptions({
  mutationKey: mutationKeys.removeRecentFolder,
  mutationFn: (args: {
    recentPath: string
  }) => {
    return invoke('remove_recent', args)
  },
})

const useRemoveRecentFolder = () => useMutation(removeRecentFolderMutation)

const setSettingsMutation = mutationOptions({
  mutationKey: mutationKeys.setSettings,
  mutationFn: (args: {
    settings: Settings
  }) => {
    return invoke('set_settings', args)
  },
})

const useSetSettings = () => useMutation(setSettingsMutation)

const initRepositoryMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.initRepository(path)],
    mutationFn: () => {
      return invoke('init_repository', { path: path })
    },
  })

const useInitRepository = () => useRepositoryMutation(initRepositoryMutation)

const checkoutLocalMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.checkoutLocal(path)],
    mutationFn: (args: { branch: BranchName }) => {
      return invoke('checkout_local_branch', { path: path, ...args })
    },
  })

const useCheckoutLocal = () => useRepositoryMutation(checkoutLocalMutation)

const fetchRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.fetchRemote(path)],
    mutationFn: (args: { remote: RemoteName }) => {
      return invoke('fetch_remote', { path: path, ...args })
    },
  })

const useFetchRemote = () => useRepositoryMutation(fetchRemoteMutation)

const addToIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.addToIndex(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('add_to_index', { path: path, ...args })
    },
  })

const useAddToIndex = () => useRepositoryMutation(addToIndexMutation)

const removeFromIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.removeFromIndex(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_index', { path: path, ...args })
    },
  })

const useRemoveFromIndex = () => useRepositoryMutation(removeFromIndexMutation)

const removeFromTreeMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.removeFromTree(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_tree', { path: path, ...args })
    },
  })

const useRemoveFromTree = () => useRepositoryMutation(removeFromTreeMutation)

const commitIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.commitIndex(path)],
    mutationFn: (args: { message: string; isAmend: boolean }) => {
      return invoke('commit_index', { path: path, ...args })
    },
  })

const useCommitIndex = () => useRepositoryMutation(commitIndexMutation)

const pushBranchMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.pushBranch(path)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
      isForce: boolean
      setUpstream: boolean
    }) => {
      return invoke('push_branch', { path: path, ...args })
    },
  })

const usePushBranch = () => useRepositoryMutation(pushBranchMutation)

const pullBranchMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.pullBranch(path)],
    mutationFn: (args: {
      branch: BranchName
      remote: RemoteName
      remoteBranch: BranchName
      isRebase: boolean
    }) => {
      return invoke('pull_branch', { path: path, ...args })
    },
  })

const usePullBranch = () => useRepositoryMutation(pullBranchMutation)

export {
  mutationKeys,
  useOpenFolder,
  useRemoveRecentFolder,
  useSetSettings,
  useInitRepository,
  useCheckoutLocal,
  useFetchRemote,
  useAddToIndex,
  useRemoveFromIndex,
  useRemoveFromTree,
  useCommitIndex,
  usePushBranch,
  usePullBranch,
}

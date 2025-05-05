import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, RemoteName, RemoteRef, Settings } from './models'
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
    setUpstream: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'set_upstream',
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
    addRemote: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'add_remote',
    }),
    removeRemote: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'remove_remote',
    }),
    saveStash: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'stash',
    }),
    applyStash: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'apply_stash',
    }),
    discardStash: (path: string) => ({
      ...mutationKeys.repository.current(path),
      key: 'discard_stash',
    }),
  },
}

const openFolderMutation = mutationOptions({
  mutationKey: mutationKeys.openFolder,
  mutationFn: (args: { newPath: string }) => {
    return invoke('open_folder', args)
  },
  networkMode: 'always',
})

const useOpenFolder = () => useMutation(openFolderMutation)

const removeRecentFolderMutation = mutationOptions({
  mutationKey: mutationKeys.removeRecentFolder,
  mutationFn: (args: {
    recentPath: string
  }) => {
    return invoke('remove_recent', args)
  },
  networkMode: 'always',
})

const useRemoveRecentFolder = () => useMutation(removeRecentFolderMutation)

const setSettingsMutation = mutationOptions({
  mutationKey: mutationKeys.setSettings,
  mutationFn: (args: {
    settings: Settings
  }) => {
    return invoke('set_settings', args)
  },
  networkMode: 'always',
})

const useSetSettings = () => useMutation(setSettingsMutation)

const initRepositoryMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.initRepository(path)],
    mutationFn: () => {
      return invoke('init_repository', { path: path })
    },
    networkMode: 'always',
  })

const useInitRepository = () => useRepositoryMutation(initRepositoryMutation)

const checkout = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.checkoutLocal(path)],
    mutationFn: (args: { reference: string }) => {
      return invoke('checkout', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useCheckout = () => useRepositoryMutation(checkout)

const addToIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.addToIndex(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('add_to_index', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useAddToIndex = () => useRepositoryMutation(addToIndexMutation)

const removeFromIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.removeFromIndex(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_index', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useRemoveFromIndex = () => useRepositoryMutation(removeFromIndexMutation)

const removeFromTreeMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.removeFromTree(path)],
    mutationFn: (args: { files: string[] }) => {
      return invoke('remove_from_tree', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useRemoveFromTree = () => useRepositoryMutation(removeFromTreeMutation)

const commitIndexMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.commitIndex(path)],
    mutationFn: (args: { message: string; isAmend: boolean }) => {
      return invoke('commit_index', { path: path, ...args })
    },
    networkMode: 'always',
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
    networkMode: 'online',
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
    networkMode: 'online',
  })

const usePullBranch = () => useRepositoryMutation(pullBranchMutation)

const fetchRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.fetchRemote(path)],
    mutationFn: (args: { remote: RemoteName }) => {
      return invoke('fetch_remote', { path: path, ...args })
    },
    networkMode: 'online',
  })

const useFetchRemote = () => useRepositoryMutation(fetchRemoteMutation)

const setUpstreamMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.setUpstream(path)],
    mutationFn: (args: {
      branch: BranchName
      remoteRef: RemoteRef
    }) => {
      return invoke('set_upstream', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useSetUpstream = () => useRepositoryMutation(setUpstreamMutation)

const addRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.addRemote(path)],
    mutationFn: (args: {
      name: RemoteName
      url: string
    }) => {
      return invoke('add_remote', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useAddRemote = () => useRepositoryMutation(addRemoteMutation)

const removeRemoteMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.removeRemote(path)],
    mutationFn: (args: {
      name: RemoteName
    }) => {
      return invoke('remove_remote', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useRemoveRemote = () => useRepositoryMutation(removeRemoteMutation)

const saveStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.saveStash(path)],
    mutationFn: (args: {
      message: string | null
      files: string[]
      includeUntracked: boolean
    }) => {
      return invoke('stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useSaveStash = () => useRepositoryMutation(saveStashMutation)

const applyStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.applyStash(path)],
    mutationFn: (args: {
      stashId: string
    }) => {
      return invoke('apply_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useApplyStash = () => useRepositoryMutation(applyStashMutation)

const discardStashMutation = (path: string) =>
  mutationOptions({
    mutationKey: [mutationKeys.repository.discardStash(path)],
    mutationFn: (args: {
      stashId: string
    }) => {
      return invoke('discard_stash', { path: path, ...args })
    },
    networkMode: 'always',
  })

const useDiscardStash = () => useRepositoryMutation(discardStashMutation)

export {
  mutationKeys,
  useOpenFolder,
  useRemoveRecentFolder,
  useSetSettings,
  useInitRepository,
  useCheckout,
  useAddToIndex,
  useRemoveFromIndex,
  useRemoveFromTree,
  useCommitIndex,
  usePushBranch,
  usePullBranch,
  useFetchRemote,
  useSetUpstream,
  useAddRemote,
  useRemoveRemote,
  useSaveStash,
  useApplyStash,
  useDiscardStash,
}

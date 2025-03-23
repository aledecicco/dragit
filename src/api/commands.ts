import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, RemoteName, Settings } from './models'

const mutationKeys = {
  openFolder: ['open_folder'] as const,
  setSettings: ['set_settings'] as const,
  initRepository: ['init_repository'] as const,
  checkoutLocalBranch: ['checkout_local_branch'] as const,
  fetchRemote: ['fetch_remote'] as const,
  addToIndex: ['add'] as const,
  removeFromIndex: ['remove_index'] as const,
  removeFromTree: ['remove_tree'] as const,
  commitIndex: ['commit'] as const,
  pushBranch: ['push'] as const,
  pullBranch: ['pull'] as const,
}

const executeOpenFolder = (path: string): Promise<void> =>
  invoke('open_folder', { path: path })

const useOpenFolder = () =>
  useMutation({
    mutationKey: mutationKeys.openFolder,
    mutationFn: executeOpenFolder,
  })

const executeSetSettings = (args: {
  path: string
  settings: Settings
}): Promise<void> => invoke('set_settings', args)

const useSetSettings = () =>
  useMutation({
    mutationKey: mutationKeys.setSettings,
    mutationFn: executeSetSettings,
  })

const executeInitRepository = (): Promise<void> => invoke('init_repository')

const useInitRepository = () =>
  useMutation({
    mutationKey: mutationKeys.initRepository,
    mutationFn: executeInitRepository,
  })

const executeCheckoutLocalBranch = (branch: BranchName): Promise<void> =>
  invoke('checkout_local_branch', { branch: branch })

const useCheckoutLocalBranch = () =>
  useMutation({
    mutationKey: mutationKeys.checkoutLocalBranch,
    mutationFn: executeCheckoutLocalBranch,
  })

const executeFetchRemote = (remote: RemoteName): Promise<void> =>
  invoke('fetch_remote', { remote: remote })

const useFetchRemote = () =>
  useMutation({
    mutationKey: mutationKeys.fetchRemote,
    mutationFn: executeFetchRemote,
  })

const executeAddToIndex = (files: string[]): Promise<void> =>
  invoke('add_to_index', { files: files })

const useAddToIndex = () =>
  useMutation({
    mutationKey: mutationKeys.addToIndex,
    mutationFn: executeAddToIndex,
  })

const executeRemoveFromIndex = (files: string[]): Promise<void> =>
  invoke('remove_from_index', { files: files })

const useRemoveFromIndex = () =>
  useMutation({
    mutationKey: mutationKeys.removeFromIndex,
    mutationFn: executeRemoveFromIndex,
  })

const executeRemoveFromTree = (files: string[]): Promise<void> =>
  invoke('remove_from_tree', { files: files })

const useRemoveFromTree = () =>
  useMutation({
    mutationKey: mutationKeys.removeFromTree,
    mutationFn: executeRemoveFromTree,
  })

const executeCommitIndex = (args: {
  message: string
  isAmend: boolean
}): Promise<void> => invoke('commit_index', args)

const useCommitIndex = () =>
  useMutation({
    mutationKey: mutationKeys.commitIndex,
    mutationFn: executeCommitIndex,
  })

const executePushBranch = (args: {
  branch: BranchName
  remote: RemoteName
  remoteBranch: BranchName
  isForce: boolean
}): Promise<void> => invoke('push_branch', args)

const usePushBranch = () =>
  useMutation({
    mutationKey: mutationKeys.pushBranch,
    mutationFn: executePushBranch,
  })

const executePullBranch = (args: {
  branch: BranchName
  remote: RemoteName
  remoteBranch: BranchName
  isRebase: boolean
}): Promise<void> => invoke('pull_branch', args)

const usePullBranch = () =>
  useMutation({
    mutationKey: mutationKeys.pullBranch,
    mutationFn: executePullBranch,
  })

export {
  mutationKeys,
  useOpenFolder,
  useSetSettings,
  useInitRepository,
  useCheckoutLocalBranch,
  useFetchRemote,
  useAddToIndex,
  useRemoveFromIndex,
  useRemoveFromTree,
  useCommitIndex,
  usePushBranch,
  usePullBranch,
}

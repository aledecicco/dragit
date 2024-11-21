import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

const mutationKeys = {
  openFolder: ['open_folder'] as const,
  initRepository: ['init_repository'] as const,
  checkoutLocalBranch: ['checkout_local_branch'] as const,
  fetchRemote: ['fetch_remote'] as const,
  addToIndex: ['add'] as const,
  removeFromIndex: ['remove_index'] as const,
  removeFromTree: ['remove_tree'] as const,
  commitIndex: ['commit'] as const,
}

const pushOpenFolder = (path: string): Promise<void> =>
  invoke('open_folder', { path: path })

const useOpenFolder = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.openFolder,
    mutationFn: pushOpenFolder,
  })

  return (path: string) => mutation.mutateAsync(path)
}

const pushInitRepository = (): Promise<void> => invoke('init_repository')

const useInitRepository = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.initRepository,
    mutationFn: pushInitRepository,
  })

  return () => mutation.mutateAsync()
}

const pushCheckoutLocalBranch = (branch: string): Promise<void> =>
  invoke('checkout_local_branch', { branch: branch })

const useCheckoutLocalBranch = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.checkoutLocalBranch,
    mutationFn: pushCheckoutLocalBranch,
  })

  return (branch: string) => mutation.mutateAsync(branch)
}

const pushFetchRemote = (): Promise<void> => invoke('fetch_remote')

const useFetchRemote = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.fetchRemote,
    mutationFn: pushFetchRemote,
  })

  return () => mutation.mutateAsync()
}

const pushAddToIndex = (files: string[]): Promise<void> =>
  invoke('add_to_index', { files: files })

const useAddToIndex = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.addToIndex,
    mutationFn: pushAddToIndex,
  })

  return (files: string[]) => mutation.mutateAsync(files)
}

const pushRemoveFromIndex = (files: string[]): Promise<void> =>
  invoke('remove_from_index', { files: files })

const useRemoveFromIndex = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.removeFromIndex,
    mutationFn: pushRemoveFromIndex,
  })

  return (files: string[]) => mutation.mutateAsync(files)
}

const pushRemoveFromTree = (files: string[]): Promise<void> =>
  invoke('remove_from_tree', { files: files })

const useRemoveFromTree = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.removeFromTree,
    mutationFn: pushRemoveFromTree,
  })

  return (files: string[]) => mutation.mutateAsync(files)
}

const pushCommitIndex = (message: string): Promise<void> =>
  invoke('commit_index', { message: message })

const useCommitIndex = () => {
  const mutation = useMutation({
    mutationKey: mutationKeys.commitIndex,
    mutationFn: pushCommitIndex,
  })

  return (message: string) => mutation.mutateAsync(message)
}

export {
  mutationKeys,
  useOpenFolder,
  useInitRepository,
  useCheckoutLocalBranch,
  useFetchRemote,
  useAddToIndex,
  useRemoveFromIndex,
  useRemoveFromTree,
  useCommitIndex,
}

import { useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

const mutationKeys = {
  openFolder: ['open_folder'] as const,
  initRepository: ['init_repository'] as const,
  checkoutLocalBranch: ['checkout_local_branch'] as const,
  fetchRemote: ['fetch_remote'] as const,
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

export {
  mutationKeys,
  useOpenFolder,
  useInitRepository,
  useCheckoutLocalBranch,
  useFetchRemote,
}

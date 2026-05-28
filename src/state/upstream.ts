import { useEffect } from 'react'
import { useEffectOnce } from 'react-use'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type {
  BranchInfo,
  BranchName,
  LocalBranch,
  RemoteInfo,
  RemoteName,
  Upstream,
} from '@/api/models'
import { setBranchUpstreamsMutation } from '@/api/mutations/setRepositoryStorage'
import { useQueryBranches } from '@/api/queries/branches'
import { useQueryRemotes } from '@/api/queries/remotes'
import { useCurrentPath, useRepositoryMutation } from '@/api/utils'
import { useCurrentBranch } from '@/utils/repository'

import { getRepositoryStorage } from './storage'

const DEFAULT_REMOTE_NAME: RemoteName = 'origin'

interface SelectedUpstreams {
  /**
   * The selected upstream for each branch.
   */
  upstreams: Map<BranchName, Upstream>
}

interface Setters {
  /**
   * Override the upstreams store for all branches.
   */
  setUpstreams: (upstreams: Map<BranchName, Upstream>) => void

  /**
   * Change the selected upstream for a given branch.
   */
  changeUpstream: (branch: BranchName, upstream: Upstream | undefined) => void
}

const useSelectedUpstreamsStore = create<SelectedUpstreams & Setters>()(
  immer((setState) => ({
    upstreams: new Map(),

    setUpstreams: (upstreams) => {
      setState((state) => {
        state.upstreams = upstreams
      })
    },

    changeUpstream: (branch, upstream) => {
      setState((state) => {
        if (!upstream) {
          state.upstreams.delete(branch)
          return
        }

        state.upstreams.set(branch, upstream)
      })
    },
  })),
)

/**
 * Figures out the default remote name to use for a given branch.
 */
const getDefaultRemoteName = (
  branch: LocalBranch,
  remotes: RemoteInfo[],
  currentBranch?: LocalBranch,
): RemoteName => {
  const store = useSelectedUpstreamsStore.getState()

  const newRemote: RemoteName =
    // Try to find the remote set in git.
    remotes.find((_remote) => _remote.name === branch.upstream?.remote)?.name ??
    // If not found, and there's only one remote, use that one.
    (remotes.length === 1 ? remotes.at(0) : undefined)?.name ??
    // Or if the branch is tracking a remote branch, use that same remote.
    (currentBranch
      ? store.upstreams.get(currentBranch.name)?.remote
      : undefined) ??
    // Otherwise, fall back to the default remote name.
    DEFAULT_REMOTE_NAME

  return newRemote
}

/**
 * Figures out the default remote branch name to use for a given branch.
 */
const getDefaultRemoteBranchName = (branch: LocalBranch): BranchName => {
  const newRemoteBranch: BranchName =
    // If the branch is tracking a remote branch, use that.
    branch.upstream?.remoteBranch ??
    // Otherwise, fall back to using the branch name.
    branch.name

  return newRemoteBranch
}

/**
 * Chooses a sensible upstream for a given branch.
 */
const chooseUpstream = (
  branch: LocalBranch,
  remotes: RemoteInfo[],
  currentBranch?: LocalBranch,
): Upstream | undefined => {
  const store = useSelectedUpstreamsStore.getState()
  const prevUpstream = store.upstreams.get(branch.name)

  const newRemote: RemoteName =
    // First check if there's an override set in the store.
    prevUpstream?.remote ??
    // Otherwise find a default.
    getDefaultRemoteName(branch, remotes, currentBranch)

  const newRemoteBranch: BranchName =
    // First check if there's an override set in the store.
    prevUpstream?.remoteBranch ??
    // Otherwise find a default.
    getDefaultRemoteBranchName(branch)

  const remoteExists = remotes.some((remote) => remote.name === newRemote)

  const newUpstream = remoteExists
    ? {
        remote: newRemote,
        remoteBranch: newRemoteBranch,
      }
    : undefined

  if (
    prevUpstream?.remote === newUpstream?.remote &&
    prevUpstream?.remoteBranch === newUpstream?.remoteBranch
  ) {
    return prevUpstream
  }

  return newUpstream
}

/**
 * Change the selected remote for a given branch.
 */
const changeSelectedRemote = (
  branch: LocalBranch,
  remote: RemoteName | undefined,
) => {
  const store = useSelectedUpstreamsStore.getState()

  if (!remote) {
    store.changeUpstream(branch.name, undefined)
    return
  }

  const currentUpstream = store.upstreams.get(branch.name)
  const newUpstream = {
    remote,
    remoteBranch:
      currentUpstream?.remoteBranch ?? getDefaultRemoteBranchName(branch),
  }

  store.changeUpstream(branch.name, newUpstream)
}

/**
 * Change the selected remote branch for a given branch.
 */
const changeSelectedRemoteBranch = (
  branch: LocalBranch,
  remoteBranch: BranchName | undefined,
) => {
  const store = useSelectedUpstreamsStore.getState()
  const currentUpstream = store.upstreams.get(branch.name)

  if (!currentUpstream) {
    return
  }

  if (!remoteBranch) {
    store.changeUpstream(branch.name, undefined)
    return
  }

  const newUpstream = {
    remote: currentUpstream.remote,
    remoteBranch: remoteBranch,
  }

  store.changeUpstream(branch.name, newUpstream)
}

/**
 * Hook that keeps the stored upstreams in sync when branches and remotes change.
 */
const useUpstreamsSync = () => {
  const branchesQuery = useQueryBranches('local')
  const remotesQuery = useQueryRemotes()
  const currentBranch = useCurrentBranch()
  const saveUpstreams = useRepositoryMutation(setBranchUpstreamsMutation)

  const currentPath = useCurrentPath()

  useEffectOnce(() => {
    const store = useSelectedUpstreamsStore.getState()
    const savedUpstreams = getRepositoryStorage(currentPath)?.branchUpstreams

    if (savedUpstreams) {
      store.setUpstreams(new Map(savedUpstreams))
    }
  })

  useEffect(() => {
    if (!branchesQuery.data || !remotesQuery.data) {
      return
    }

    const newUpstreams = new Map<BranchName, Upstream>()

    for (const branch of branchesQuery.data) {
      const upstream = chooseUpstream(
        branch,
        remotesQuery.data,
        currentBranch?.type === 'local' ? currentBranch : undefined,
      )

      if (upstream) {
        newUpstreams.set(branch.name, upstream)
      }
    }

    const store = useSelectedUpstreamsStore.getState()
    store.setUpstreams(newUpstreams)
  }, [branchesQuery.data, remotesQuery.data, currentBranch])

  const storedUpstreams = useUpstreams()
  useEffect(() => {
    if (storedUpstreams.size > 0) {
      saveUpstreams.mutateAsync({
        branchUpstreams: [...storedUpstreams.entries()],
      })
    }
  }, [storedUpstreams, saveUpstreams.mutateAsync])
}

/**
 * Hook that returns the currently selected upstreams for all branches.
 */
const useUpstreams = () => {
  return useSelectedUpstreamsStore(useShallow((state) => state.upstreams))
}

/**
 * Hook that facilitates tracking the selected upstream for a branch.
 */
const useSelectedUpstream = (
  branch: BranchInfo | undefined,
): Upstream | undefined => {
  const storedUpstream = useSelectedUpstreamsStore(
    useShallow((state) =>
      branch?.type === 'local' ? state.upstreams.get(branch.name) : undefined,
    ),
  )

  return storedUpstream
}

export {
  useUpstreamsSync,
  useUpstreams,
  useSelectedUpstream,
  changeSelectedRemote,
  changeSelectedRemoteBranch,
}

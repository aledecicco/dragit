import { useEffect } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type {
  BranchInfo,
  BranchName,
  LocalBranch,
  Reference,
  RemoteInfo,
  RemoteName,
  Upstream,
} from '@/api/models'
import { useQueryRemotes } from '@/api/queries/remotes'

import { useSelectedBranches } from './branches'

const MAX_UPSTREAMS = 50
const DEFAULT_REMOTE_NAME: RemoteName = 'origin'

// TODO: store persistence.
interface SelectedUpstreams {
  /**
   * The selected upstream for each branch.
   */
  upstreams: Map<BranchName, Upstream>
}

interface Setters {
  /**
   * Change the selected upstream for a given branch.
   */
  changeUpstream: (branch: BranchName, upstream: Upstream | undefined) => void
}

const useSelectedUpstreamsStore = create<SelectedUpstreams & Setters>()(
  immer((setState) => ({
    upstreams: new Map(),

    changeUpstream: (branch, upstream) => {
      setState((state) => {
        if (!upstream) {
          state.upstreams.delete(branch)
          return
        }

        const isNew = !state.upstreams.has(branch)
        if (isNew && state.upstreams.size >= MAX_UPSTREAMS) {
          const oldest = state.upstreams.keys().next().value
          if (oldest) {
            state.upstreams.delete(oldest)
          }
        }

        state.upstreams.delete(branch)
        state.upstreams.set(branch, upstream)
      })
    },
  })),
)

/**
 * Calculates the default remote name to use for a given branch.
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
    // Or if the current branch is tracking a remote branch, use that same remote.
    (currentBranch
      ? store.upstreams.get(currentBranch.name)?.remote
      : undefined) ??
    // Otherwise, fall back to the default remote name.
    DEFAULT_REMOTE_NAME

  return newRemote
}

/**
 * Calculates the default remote branch name to use for a given branch.
 */
const getDefaultRemoteBranchName = (branch: LocalBranch): BranchName => {
  const newRemoteBranch: BranchName =
    // If the current branch is tracking a remote branch, use that.
    branch.upstream?.remoteBranch ??
    // Otherwise, fall back to using the current branch name.
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

  const newRemote: RemoteName =
    // First check if there's an override set in the store.
    store.upstreams.get(branch.name)?.remote ??
    // Otherwise find a default.
    getDefaultRemoteName(branch, remotes, currentBranch)

  const newRemoteBranch: BranchName =
    // First check if there's an override set in the store.
    store.upstreams.get(branch.name)?.remoteBranch ??
    // Otherwise find a default.
    getDefaultRemoteBranchName(branch)

  const remoteExists = remotes.some((remote) => remote.name === newRemote)

  const newUpstream = remoteExists
    ? {
        remote: newRemote,
        remoteBranch: newRemoteBranch,
      }
    : undefined

  return newUpstream
}

const getUpstreamReference = (upstream: Upstream): Reference => ({
  type: 'branch',
  refName: `${upstream.remote}/${upstream.remoteBranch}`,
})

/**
 * Change the selected upstream for a given branch.
 */
const changeSelectedUpstream =
  useSelectedUpstreamsStore.getState().changeUpstream

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
 * Hook that facilitates tracking the selected upstream for a branch.
 */
const useSelectedUpstream = (
  branch: BranchInfo | undefined,
): Upstream | undefined => {
  const remotesQuery = useQueryRemotes()
  const { currentBranch } = useSelectedBranches()

  const upstream = useSelectedUpstreamsStore(
    useShallow(() =>
      branch?.type === 'local'
        ? chooseUpstream(
            branch,
            remotesQuery.data ?? [],
            currentBranch?.type === 'local' ? currentBranch : undefined,
          )
        : undefined,
    ),
  )

  return upstream
}

/**
 * Hook that synchronizes the selected remote and remote branch when the checked out branch changes.
 */
const useUpstreamSync = () => {
  const { currentBranch } = useSelectedBranches()
  const remotesQuery = useQueryRemotes()

  useEffect(() => {
    if (currentBranch?.type !== 'local') {
      return
    }

    const newUpstream = chooseUpstream(currentBranch, remotesQuery.data ?? [])
    changeSelectedUpstream(currentBranch.name, newUpstream)
  }, [currentBranch, remotesQuery.data])
}

export {
  useSelectedUpstream,
  getUpstreamReference,
  changeSelectedUpstream,
  changeSelectedRemote,
  changeSelectedRemoteBranch,
  useUpstreamSync,
}

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
  changeUpstream: (branch: BranchName, upstream: Upstream) => void
}

const useSelectedUpstreamsStore = create<SelectedUpstreams & Setters>()(
  immer((setState) => ({
    upstreams: new Map(),

    changeUpstream: (branch, upstream) => {
      setState((state) => {
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
 * Chooses a sensible upstream for a given branch.
 */
const chooseUpstream = (
  branch: LocalBranch,
  remotes: RemoteInfo[],
): Upstream => {
  const store = useSelectedUpstreamsStore.getState()

  const newRemote: RemoteName =
    // First check if there's an override set in the store.
    store.upstreams.get(branch.name)?.remote ??
    // If no overrides are found, try to find the remote set in git.
    remotes.find((_remote) => _remote.name === branch.upstream?.remote)?.name ??
    // If not found, and there's only one remote, use that one.
    (remotes.length === 1 ? remotes.at(0) : undefined)?.name ??
    // Otherwise fall back to the default remote name.
    DEFAULT_REMOTE_NAME

  const newRemoteBranch: BranchName =
    // First check if there's an override set in the store.
    store.upstreams.get(branch.name)?.remoteBranch ??
    // If the current branch is tracking a remote branch, use that.
    branch.upstream?.remoteBranch ??
    // Otherwise, fall back to using the current branch name.
    branch.name

  // TODO: validate that the chosen remote and remote branch actually exist?
  // Otherwise the branch selector UI gets confused.

  return {
    remote: newRemote,
    remoteBranch: newRemoteBranch,
  }
}

/**
 * Hook that facilitates tracking the selected upstream for a branch.
 */
const useStoredUpstream = (
  branch: BranchInfo | undefined,
): Upstream | undefined => {
  const upstream = useSelectedUpstreamsStore(
    useShallow((state) => {
      if (branch?.type !== 'local') {
        return
      }

      return state.upstreams.get(branch.name) ?? branch.upstream ?? undefined
    }),
  )

  return upstream
}

/**
 * Hook that facilitates tracking the selected upstream for a branch.
 */
const useSelectedUpstream = (
  branch: BranchInfo | undefined,
): Upstream | undefined => {
  const storedUpstream = useStoredUpstream(branch)
  const remotesQuery = useQueryRemotes()

  if (storedUpstream) {
    return storedUpstream
  }

  const upstream =
    branch?.type === 'local'
      ? chooseUpstream(branch, remotesQuery.data ?? [])
      : undefined

  return upstream
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
 * Hook that synchronizes the selected remote and remote branch when the checked out branch changes.
 *
 * Chooses sensible defaults when the branch has no remote set in Git.
 */
const useUpstreamSync = () => {
  const { currentBranch } = useSelectedBranches()
  const remotesQuery = useQueryRemotes()

  useEffect(() => {
    if (currentBranch?.type !== 'local') {
      return
    }

    const store = useSelectedUpstreamsStore.getState()

    store.changeUpstream(
      currentBranch.name,
      chooseUpstream(currentBranch, remotesQuery.data ?? []),
    )
  }, [currentBranch, remotesQuery.data])
}

export {
  useSelectedUpstream,
  getUpstreamReference,
  changeSelectedUpstream,
  useUpstreamSync,
}

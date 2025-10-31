import { useEffect } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'

import type { BranchName, RemoteName, Upstream } from '@/api/models'
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
 * Hook that facilitates tracking the selected upstream for the current branch.
 */
const useCurrentUpstream = (): Upstream | undefined => {
  const { currentBranch } = useSelectedBranches()
  const upstream = useSelectedUpstreamsStore(
    useShallow((state) => {
      if (currentBranch?.type !== 'local') {
        return undefined
      }
      return state.upstreams.get(currentBranch.name)
    }),
  )

  return upstream
}

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
    if (!remotesQuery.data || currentBranch?.type !== 'local') {
      return
    }

    const store = useSelectedUpstreamsStore.getState()

    const newRemote: RemoteName =
      // First check if there's an override set in the store.
      store.upstreams.get(currentBranch.name)?.remote ??
      // If no overrides are found, try to find the remote set in git.
      remotesQuery.data.find(
        (_remote) => _remote.name === currentBranch.remote?.remoteName,
      )?.name ??
      // If not found, and there's only one remote, use that one.
      (remotesQuery.data.length === 1 ? remotesQuery.data.at(0) : undefined)
        ?.name ??
      // Otherwise fall back to the default remote name and try to find that one.
      DEFAULT_REMOTE_NAME

    const newRemoteBranch: BranchName =
      // First check if there's an override set in the store.
      store.upstreams.get(currentBranch.name)?.remoteBranch ??
      // If the current branch is tracking a remote branch, use that.
      currentBranch.remote?.branchName ??
      // Otherwise, fall back to using the current branch name.
      currentBranch.name

    store.changeUpstream(currentBranch.name, {
      remote: newRemote,
      remoteBranch: newRemoteBranch,
    })
  }, [currentBranch, remotesQuery.data])
}

export { useCurrentUpstream, changeSelectedUpstream, useUpstreamSync }

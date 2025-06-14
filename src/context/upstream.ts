import { useEffect } from 'react'
import { Store, useStore } from '@tanstack/react-store'
import { usePrevious } from 'react-use'

import type { BranchName, RemoteInfo } from '@/api/models'
import { useQueryRemotes } from '@/api/queries'
import { DEFAULT_REMOTE_NAME, useSelectedBranches } from '@/utils/repository'

interface SelectedUpstream {
  remote: RemoteInfo | undefined
  remoteBranch: BranchName | undefined
}

const selectedUpstream = new Store<SelectedUpstream>({
  remote: undefined,
  remoteBranch: undefined,
})

/**
 * @returns An object containing:
 * - `remote`: The currently selected remote in the application.
 * - `remoteBranch`: The currently selected remote branch in the application.
 */
const useSelectedUpstream = () => useStore(selectedUpstream)

/**
 * Selects a remote to use for upstream operations.
 *
 * @param remote - The remote to select.
 */
const changeUpstreamRemote = (remote: RemoteInfo | undefined) => {
  selectedUpstream.setState((state) => ({
    ...state,
    remote,
  }))
}

/**
 * Selects a remote branch to use for upstream operations.
 *
 * @param remoteBranch - The remote branch to select.
 */
const changeUpstreamBranch = (remoteBranch: BranchName | undefined) => {
  selectedUpstream.setState((state) => ({
    ...state,
    remoteBranch,
  }))
}

/**
 * Hook that synchronizes the selected remote and remote branch when the checked out branch changes.
 *
 * Chooses sensible defaults when the branch has no remote set in Git.
 */
const useUpstreamSync = () => {
  const { remote } = useSelectedUpstream()
  const { branch } = useSelectedBranches()
  const prevBranch = usePrevious(branch)

  const remotesQuery = useQueryRemotes()

  useEffect(() => {
    if (branch?.type !== 'local') {
      changeUpstreamRemote(undefined)
      changeUpstreamBranch(undefined)
      return
    }

    if (branch.name !== prevBranch?.name) {
      if (branch.remote) {
        changeUpstreamBranch(branch.remote.branchName)
      } else {
        changeUpstreamBranch(branch.name)
      }
    }
  }, [branch, prevBranch])

  useEffect(() => {
    if (branch?.type === 'local' && remotesQuery.data) {
      const exists =
        remote &&
        remotesQuery.data.some((_remote) => _remote.name === remote.name)

      if (!exists) {
        if (branch.remote) {
          const branchRemote = branch.remote
          const newRemote = remotesQuery.data.find(
            (_remote) => _remote.name === branchRemote.remoteName,
          )

          if (newRemote) {
            changeUpstreamRemote(newRemote)
            return
          }
        }

        if (remotesQuery.data.length === 1) {
          changeUpstreamRemote(remotesQuery.data.at(0))
          return
        }

        changeUpstreamRemote(
          remotesQuery.data.find(
            (_remote) => _remote.name === DEFAULT_REMOTE_NAME,
          ),
        )
      }
    }
  }, [remote, remotesQuery.data, branch])
}

export {
  useSelectedUpstream,
  changeUpstreamRemote,
  changeUpstreamBranch,
  useUpstreamSync,
  type SelectedUpstream,
}

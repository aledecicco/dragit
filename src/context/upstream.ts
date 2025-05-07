import { Store, useStore } from '@tanstack/react-store'
import { useEffect } from 'react'

import type { BranchName, RemoteInfo } from '@api/models'
import { useQueryRemotes } from '@api/queries'
import { DEFAULT_REMOTE_NAME, useSelectedBranches } from '@utils/repository'
import { usePrevious } from 'react-use'

interface SelectedUpstream {
  remote: RemoteInfo | undefined
  remoteBranch: BranchName | undefined
}

const selectedUpstream = new Store<SelectedUpstream>({
  remote: undefined,
  remoteBranch: undefined,
})

const useSelectedUpstream = () => useStore(selectedUpstream)

const changeUpstreamRemote = (remote: RemoteInfo | undefined) => {
  selectedUpstream.setState((state) => ({
    ...state,
    remote,
  }))
}

const changeUpstreamBranch = (remoteBranch: BranchName | undefined) => {
  selectedUpstream.setState((state) => ({
    ...state,
    remoteBranch,
  }))
}

const useUpstreamSync = () => {
  const { remote } = useSelectedUpstream()
  const { branch } = useSelectedBranches()
  const prevBranch = usePrevious(branch)

  const remotesQuery = useQueryRemotes()

  useEffect(() => {
    if (branch?.type !== 'local') {
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
    if (remotesQuery.data) {
      const exists =
        remote &&
        remotesQuery.data.some((_remote) => _remote.name === remote.name)

      if (!exists) {
        if (branch?.type === 'local' && branch.remote) {
          const newRemote = remotesQuery.data.find(
            (_remote) => _remote.name === branch.remote?.remoteName,
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

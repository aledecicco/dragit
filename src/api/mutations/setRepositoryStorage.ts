import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { BranchName, Reference, RefName, Upstream } from '../models'
import { pathMutationKey } from '../utils'

interface SetBranchBasesArgs {
  branchBases: [RefName, Reference | null][]
}

interface SetBranchUpstreamsArgs {
  branchUpstreams: [BranchName, Upstream][]
}

const setBranchBasesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'set_branch_bases',
  }) as const

const setBranchBasesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [setBranchBasesKey(repoPath)],
    mutationFn: (args: SetBranchBasesArgs) => {
      return invoke('set_branch_bases', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const setBranchUpstreamsKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'set_branch_upstreams',
  }) as const

const setBranchUpstreamsMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [setBranchUpstreamsKey(repoPath)],
    mutationFn: (args: SetBranchUpstreamsArgs) => {
      return invoke('set_branch_upstreams', { repoPath, ...args })
    },
    networkMode: 'always',
  })

export {
  setBranchBasesKey,
  setBranchBasesMutation,
  setBranchUpstreamsKey,
  setBranchUpstreamsMutation,
  type SetBranchBasesArgs,
  type SetBranchUpstreamsArgs,
}

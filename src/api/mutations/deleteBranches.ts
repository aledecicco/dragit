import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { BranchInfo, BranchName } from '../models'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DeleteBranchesArgs {
  branchNames: BranchName[]
}

const deleteBranchesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'delete_branches',
  }) as const

const deleteBranchesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [deleteBranchesKey(repoPath)],
    mutationFn: (args: DeleteBranchesArgs) => {
      return invoke('delete_branches', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const useDeleteBranch = (branch: BranchInfo): Action => {
  const deleteBranches = useRepositoryMutation(deleteBranchesMutation)

  return {
    id: {
      key: 'branch_operation',
      operation: 'delete_branch',
      branch: branch.name,
    },
    blockedBy: [{ key: 'branch_operation', branch: branch.name }],
    run: async () => {
      await deleteBranches.mutateAsync({
        branchNames: [branch.name],
      })
    },
    Glyph: IconTrash,
    label: {
      idle: 'Delete branch',
      running: 'Deleting branch',
      success: 'Branch deleted',
      error: 'Failed to delete',
    },
  }
}

const useDeleteBranches = (): Action<BranchInfo[]> => {
  const deleteBranches = useRepositoryMutation(deleteBranchesMutation)

  return {
    id: { key: 'branch_operation', operation: 'delete_branches' },
    blockedBy: [{ key: 'branch_operation' }],
    run: async (branches) => {
      await deleteBranches.mutateAsync({
        branchNames: branches.map((branch) => branch.name),
      })
    },
    Glyph: IconTrash,
    label: {
      idle: 'Delete branches',
      running: 'Deleting branches',
      success: 'Branches deleted',
      error: 'Failed to delete',
    },
  }
}

export {
  useDeleteBranch,
  useDeleteBranches,
  deleteBranchesKey,
  deleteBranchesMutation,
  type DeleteBranchesArgs,
}

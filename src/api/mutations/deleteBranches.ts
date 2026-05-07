import { IconTrash } from '@tabler/icons-react'
import { mutationOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { match } from 'ts-pattern'

import type { Action } from '@/state/actions'

import type {
  BranchInfo,
  BranchName,
  RemoteBranch,
  RemoteInfo,
  RemoteName,
} from '../models'
import { useQueryRemotes } from '../queries/remotes'
import { pathMutationKey, useRepositoryMutation } from '../utils'

interface DeleteLocalBranchesArgs {
  branchNames: BranchName[]
}

interface DeleteRemoteBranchesArgs {
  branchNames: BranchName[]
  remote: RemoteName
}

const deleteLocalBranchesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'delete_local_branches',
  }) as const

const deleteLocalBranchesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [deleteLocalBranchesKey(repoPath)],
    mutationFn: (args: DeleteLocalBranchesArgs) => {
      return invoke('delete_local_branches', { repoPath, ...args })
    },
    networkMode: 'always',
  })

const deleteRemoteBranchesKey = (repoPath: string) =>
  ({
    ...pathMutationKey(repoPath),
    key: 'delete_remote_branches',
  }) as const

const deleteRemoteBranchesMutation = (repoPath: string) =>
  mutationOptions({
    mutationKey: [deleteRemoteBranchesKey(repoPath)],
    mutationFn: (args: DeleteRemoteBranchesArgs) => {
      return invoke('delete_remote_branches', { repoPath, ...args })
    },
    networkMode: 'online',
  })

const useMakeDeleteBranch = (): ((branch: BranchInfo) => Action) => {
  const deleteLocalBranches = useRepositoryMutation(deleteLocalBranchesMutation)
  const deleteRemoteBranches = useRepositoryMutation(
    deleteRemoteBranchesMutation,
  )
  const remotesQuery = useQueryRemotes()

  return (branch: BranchInfo): Action => ({
    id: {
      key: 'branch_operation',
      operation: 'delete_branch',
      branch: branch.name,
    },
    blockedBy: [{ key: 'branch_operation', branch: branch.name }],
    run: async () => {
      await match(branch)
        .with({ type: 'local' }, (branch) =>
          deleteLocalBranches.mutateAsync({
            branchNames: [branch.name],
          }),
        )
        .with({ type: 'remote' }, (branch) => {
          const remote = findRemoteAndBranch(branch, remotesQuery.data ?? [])

          if (!remote) {
            throw new Error(`Couldn't find remote for branch ${branch.name}`)
          }

          const [remoteName, branchName] = remote

          return deleteRemoteBranches.mutateAsync({
            branchNames: [branchName],
            remote: remoteName,
          })
        })
        .exhaustive()
    },
    Glyph: IconTrash,
    label: {
      idle: 'Delete branch',
      running: 'Deleting branch',
      success: 'Branch deleted',
      error: 'Failed to delete',
    },
  })
}

const useDeleteBranch = (branch: BranchInfo): Action => {
  return useMakeDeleteBranch()(branch)
}

const useDeleteBranches = (): Action<BranchInfo[]> => {
  const deleteLocalBranches = useRepositoryMutation(deleteLocalBranchesMutation)
  const deleteRemoteBranches = useRepositoryMutation(
    deleteRemoteBranchesMutation,
  )
  const remotesQuery = useQueryRemotes()

  return {
    id: { key: 'branch_operation', operation: 'delete_branches' },
    blockedBy: [{ key: 'branch_operation' }],
    run: async (branches) => {
      const localBranches = branches.filter((branch) => branch.type === 'local')
      const remoteBranches = branches.filter(
        (branch) => branch.type === 'remote',
      )

      const localDeletion =
        localBranches.length > 0
          ? deleteLocalBranches.mutateAsync({
              branchNames: localBranches.map((branch) => branch.name),
            })
          : Promise.resolve()

      const groupedRemoteBranches = [
        ...groupBranchesByRemote(
          remoteBranches,
          remotesQuery.data ?? [],
        ).entries(),
      ]

      const remoteDeletions = groupedRemoteBranches.map(([remote, branches]) =>
        branches.length > 0
          ? deleteRemoteBranches.mutateAsync({
              remote,
              branchNames: branches,
            })
          : Promise.resolve(),
      )

      await Promise.all([localDeletion, ...remoteDeletions])
    },
    derivedIds: (branches) =>
      branches.map((branch) => ({
        key: 'branch_operation',
        operation: 'delete_branch',
        branch: branch.name,
      })),
    Glyph: IconTrash,
    label: {
      idle: 'Delete branches',
      running: 'Deleting branches',
      success: 'Branches deleted',
      error: 'Failed to delete',
    },
  }
}

/**
 * Goes through the remotes and finds the one with the longest name that is a prefix of the branch name.
 */
const findRemoteAndBranch = (
  branch: RemoteBranch,
  remotes: RemoteInfo[],
): [RemoteName, BranchName] | undefined => {
  return remotes.reduce(
    (longest, remote) => {
      if (!longest)
        return [remote.name, branch.name.slice(remote.name.length + 1)]

      const [longestRemoteName] = longest

      if (
        branch.name.startsWith(remote.name) &&
        remote.name.length > longestRemoteName.length
      ) {
        return [remote.name, branch.name.slice(remote.name.length + 1)]
      }

      return longest
    },
    undefined as [RemoteName, BranchName] | undefined,
  )
}

/**
 * Goes through the branches and groups them by their corresponding remotes.
 */
const groupBranchesByRemote = (
  branches: RemoteBranch[],
  remotes: RemoteInfo[],
) => {
  const grouped = new Map<RemoteName, BranchName[]>()

  for (const branch of branches) {
    const remote = findRemoteAndBranch(branch, remotes)

    if (remote) {
      const [remoteName, branchName] = remote
      if (!grouped.has(remoteName)) {
        grouped.set(remoteName, [])
      }

      grouped.get(remoteName)?.push(branchName)
    }
  }

  return grouped
}

export {
  useMakeDeleteBranch,
  useDeleteBranch,
  useDeleteBranches,
  deleteLocalBranchesKey,
  deleteLocalBranchesMutation,
  deleteRemoteBranchesKey,
  deleteRemoteBranchesMutation,
  type DeleteLocalBranchesArgs,
  type DeleteRemoteBranchesArgs,
}

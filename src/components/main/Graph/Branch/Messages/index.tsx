import type { PropsWithChildren } from 'react'

import { commitHistoryQuery } from '@api/queries'
import { useRepositoryInfiniteQuery } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { useCurrentCommonAncestor } from '@main/Graph/utils'
import { cn } from '@utils/styles'

const BranchMessages = () => {
  const { branch, baseBranch } = useSelectedBranches()
  const commonAncestor = useCurrentCommonAncestor()
  const branchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    branch?.name,
  )
  const baseBranchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    baseBranch?.name,
  )

  const branchMessages = [
    { when: !branch, message: 'No branch checked out' },
    {
      when: branchHistory.data?.pages && commonAncestor?.lastCommit === null,
      message: 'No new commits',
    },
    {
      when: !branchHistory.data?.pages,
      message: branchHistory.isFetching
        ? 'Loading history...'
        : 'No commits found',
    },
  ]

  const baseBranchMessages = [
    { when: !baseBranch, message: 'No base branch selected' },
    {
      when: !baseBranchHistory.data?.pages,
      message: baseBranchHistory.isFetching
        ? 'Loading history...'
        : 'No commits found',
    },
  ]

  const branchMessage = branchMessages.find((item) => item.when)?.message
  const baseBranchMessage = baseBranchMessages.find(
    (item) => item.when,
  )?.message

  return (
    <>
      {branchMessage && (
        <BranchMessage isBase={false}>{branchMessage}</BranchMessage>
      )}
      {baseBranchMessage && (
        <BranchMessage isBase={true}>{baseBranchMessage}</BranchMessage>
      )}
    </>
  )
}

const BranchMessage = (props: PropsWithChildren<{ isBase: boolean }>) => {
  const { isBase, children } = props

  return (
    <p
      className={cn(
        'text-center text-light-950 italic',
        'absolute top-10 w-max p-1 overflow-visible',
        isBase ? 'left-[68%]' : 'left-[12%]',
      )}
    >
      {children}
    </p>
  )
}

export { BranchMessages }

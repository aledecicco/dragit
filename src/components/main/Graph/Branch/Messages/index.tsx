import type { PropsWithChildren } from 'react'

import { useQueryCommitHistory } from '@api/queries'
import { useSelectedBranches } from '@context/branches'
import { useCurrentCommonAncestor } from '@main/Graph/utils'
import { cn } from '@utils/styles'

const BranchMessages = () => {
  const { branch, baseBranch } = useSelectedBranches()
  const commonAncestorQuery = useCurrentCommonAncestor()
  const branchHistoryQuery = useQueryCommitHistory(branch?.name)
  const baseBranchHistory = useQueryCommitHistory(baseBranch?.name)

  const branchMessages = [
    { when: !branch, message: 'No branch checked out' },
    {
      when:
        branchHistoryQuery.data?.pages &&
        commonAncestorQuery?.lastCommit === null,
      message: 'No new commits',
    },
    {
      when: !branchHistoryQuery.data?.pages,
      message: branchHistoryQuery.isFetching
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

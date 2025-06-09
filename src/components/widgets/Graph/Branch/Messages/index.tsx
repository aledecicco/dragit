import type { PropsWithChildren } from 'react'

import { useQueryCommitHistory } from '@api/queries'
import { useSelectedRefs } from '@context/branches'
import { cn } from '@utils/styles'
import { useCurrentCommonAncestor } from '@widgets/Graph/utils'

/**
 * Messages that display the status of the main branch and the base branch,
 * in cases where no commits are displayed.
 */
const BranchMessages = () => {
  const { reference, baseReference } = useSelectedRefs()
  const commonAncestorQuery = useCurrentCommonAncestor()
  const branchHistoryQuery = useQueryCommitHistory(reference?.refName)
  const baseBranchHistory = useQueryCommitHistory(baseReference?.refName)

  const branchMessages = [
    { when: !reference, message: 'No branch checked out' },
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
    { when: !baseReference, message: 'No base branch selected' },
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

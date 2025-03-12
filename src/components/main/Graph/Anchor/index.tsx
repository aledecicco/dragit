import type { Virtualizer } from '@tanstack/react-virtual'
import { useMemo } from 'react'

import type { BranchInfo, CommonAncestorInfo } from '@api/models'
import { commitHistoryQuery } from '@api/queries'
import { getNextPaginatedItem, useRepositoryInfiniteQuery } from '@api/utils'
import { cn } from '@utils/styles'
import { mapFn } from '@utils/types'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import {
  ancestorIsDivergent,
  getCommitPositionClass,
  getCommitTranslationY,
  useRemoteDivergence,
} from '../utils'

interface GraphAnchorProps {
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  baseBranch: BranchInfo
  commonAncestorInfo: CommonAncestorInfo
}

const GraphAnchor = (props: GraphAnchorProps) => {
  const { virtualizer, branch, baseBranch, commonAncestorInfo } = props
  const divergence = useRemoteDivergence(branch)

  const baseHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    baseBranch.name,
  )
  const anchorParent = useMemo(() => {
    return getNextPaginatedItem(
      baseHistory.data,
      commonAncestorInfo.commonCommit.distance,
    )
  }, [baseHistory.data, commonAncestorInfo])

  const branchIsDivergent =
    divergence &&
    commonAncestorInfo.lastCommit &&
    ancestorIsDivergent(commonAncestorInfo.lastCommit.distance, divergence)

  const commonCommitId = COMMIT_ELEMENT_ID(
    commonAncestorInfo.commonCommit.hash,
    baseBranch.name,
  )

  return (
    <>
      {commonAncestorInfo.lastCommit && (
        <GraphCommit
          commitId={commonAncestorInfo.lastCommit.hash}
          commitType={branchIsDivergent ? 'unconfirmed' : 'confirmed'}
          elementId={COMMIT_ELEMENT_ID(
            commonAncestorInfo.lastCommit.hash,
            branch.name,
          )}
          parent={{
            id: commonCommitId,
            type: branchIsDivergent ? 'unconfirmed' : 'solid',
          }}
          className={cn('absolute top-0', getCommitPositionClass(false))}
          style={{
            transform: `translateY(${getCommitTranslationY(virtualizer, commonAncestorInfo.lastCommit.distance)}px)`,
          }}
        />
      )}

      <GraphCommit
        commitId={commonAncestorInfo.commonCommit.hash}
        commitType="confirmed"
        elementId={commonCommitId}
        parent={mapFn(anchorParent, (anchorParent) => ({
          id: COMMIT_ELEMENT_ID(anchorParent.hash, baseBranch.name),
          type: 'solid',
        }))}
        className={cn('absolute top-0', getCommitPositionClass(true))}
        style={{
          transform: `translateY(${getCommitTranslationY(virtualizer, commonAncestorInfo.commonCommit.distance)}px)`,
        }}
      />
    </>
  )
}

export { GraphAnchor, type GraphAnchorProps }

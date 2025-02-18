import type { Virtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'

import type { BranchInfo, CommonAncestorInfo } from '@api/models'
import { COMMIT_ELEMENT_ID, GraphCommit } from '../Commit'
import { ancestorIsDivergent, useRemoteDivergence } from '../utils'
import { getAnchorTranslationY } from './utils'

interface GraphAnchorProps {
  path: string
  virtualizer: Virtualizer<HTMLDivElement, Element>
  branch: BranchInfo
  baseBranch: BranchInfo
  commonAncestorInfo: CommonAncestorInfo
}

const GraphAnchor = (props: GraphAnchorProps) => {
  const { path, virtualizer, branch, baseBranch, commonAncestorInfo } = props
  const divergence = useRemoteDivergence(path, branch)

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
          key={commonAncestorInfo.lastCommit.distance}
          path={path}
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
          className={clsx('absolute top-0 left-[8%]')}
          style={{
            transform: `translateY(${getAnchorTranslationY(virtualizer, commonAncestorInfo.lastCommit.distance)}px)`,
          }}
        />
      )}

      <GraphCommit
        key={commonAncestorInfo.commonCommit.distance}
        path={path}
        commitId={commonAncestorInfo.commonCommit.hash}
        commitType="confirmed"
        elementId={commonCommitId}
        parent={undefined}
        className={clsx('absolute top-0 left-[60%]')}
        style={{
          transform: `translateY(${getAnchorTranslationY(virtualizer, commonAncestorInfo.commonCommit.distance)}px)`,
        }}
      />
    </>
  )
}

export { GraphAnchor, type GraphAnchorProps }

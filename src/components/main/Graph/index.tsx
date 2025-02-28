import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect } from 'react'

import type { BranchInfo } from '@api/models'
import { commitHistoryQuery, commonAncestorQuery } from '@api/queries'
import {
  getPaginatedLength,
  useRepositoryInfiniteQuery,
  useRepositoryQuery,
} from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { GraphAnchor } from './Anchor'
import { GraphBranch } from './Branch'
import { BranchMessage } from './Branch/Message'
import { BranchSelectors } from './Branch/Selectors'
import { BranchToolbars } from './Branch/Toolbars'
import { NODE_SIZE } from './Commit'
import { CURVE_SIZE, EDGE_OFFSET, Edges } from './Edges'

const Graph = () => {
  const { branch, baseBranch } = useSelectedBranches()

  return (
    <div className={clsx('h-full w-full min-h-0')}>
      <div
        className={clsx(
          'overflow-hidden w-full h-full relative',
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_max-content_1fr]',
          'gap-x-8 place-items-center p-1',
        )}
      >
        <BranchSelectors />

        <BranchToolbars />

        <SvgOverlay className={clsx('col-span-3')} RenderOverlay={Edges}>
          <GraphInner branch={branch} baseBranch={baseBranch} />
        </SvgOverlay>
      </div>
    </div>
  )
}

interface GraphInnerProps {
  branch: BranchInfo | undefined
  baseBranch: BranchInfo | undefined
}

const GraphInner = (props: GraphInnerProps) => {
  const { branch, baseBranch } = props

  const commonAncestor = useRepositoryQuery(
    commonAncestorQuery,
    branch?.name,
    baseBranch?.name,
  )

  const svgOverlay = useSvgOverlay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh arrows when branches change
  useEffect(() => {
    svgOverlay.refresh()
  }, [commonAncestor.data, branch, baseBranch])

  const branchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    branch?.name,
  )
  const baseBranchHistory = useRepositoryInfiniteQuery(
    commitHistoryQuery,
    baseBranch?.name,
  )

  const branchLength = Math.min(
    (commonAncestor.data?.lastCommit?.distance ?? Number.POSITIVE_INFINITY) + 1,
    getPaginatedLength(branchHistory),
  )
  const baseLength = getPaginatedLength(baseBranchHistory)

  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
    paddingEnd: CURVE_SIZE * 3.5,
    getScrollElement: () => svgOverlay.componentRef.current,
    count: Math.max(branchLength, baseLength),
  })

  return (
    <div
      ref={svgOverlay.componentRef}
      className={clsx('overflow-hidden contain-strict w-full h-full')}
    >
      <div
        className={clsx('relative w-full contain-layout')}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {branch ? (
          <GraphBranch
            virtualizer={virtualizer}
            branch={branch}
            anchor={commonAncestor.data?.lastCommit}
            isBase={false}
          />
        ) : (
          <BranchMessage isBase={false}>No branch checked out</BranchMessage>
        )}

        {baseBranch ? (
          <GraphBranch
            virtualizer={virtualizer}
            branch={baseBranch}
            anchor={commonAncestor.data?.commonCommit ?? undefined}
            isBase={true}
          />
        ) : (
          <BranchMessage isBase={true}>No base branch selected</BranchMessage>
        )}

        {branch && baseBranch && commonAncestor.data && (
          <GraphAnchor
            virtualizer={virtualizer}
            branch={branch}
            baseBranch={baseBranch}
            commonAncestorInfo={commonAncestor.data}
          />
        )}
      </div>
    </div>
  )
}

export { Graph }

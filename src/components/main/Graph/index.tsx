import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect } from 'react'

import type { BranchInfo } from '@api/models'
import { commitHistoryQuery, commonAncestorQuery } from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { useSelectedBranches } from '@context/branches'
import { useCurrentDirectory } from '@context/directory'
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
          'grid grid-cols-[1fr_max-content_1fr] grid-rows-[max-content_1fr_max-content]',
          'col-gap-8 row-gap-4 place-items-center p-1',
        )}
      >
        <BranchSelectors />

        <SvgOverlay className={clsx('col-span-3')} RenderOverlay={Edges}>
          <GraphInner branch={branch} baseBranch={baseBranch} />
        </SvgOverlay>

        <BranchToolbars />
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

  const path = useCurrentDirectory()
  const commonAncestor = useQuery(
    commonAncestorQuery(path, branch?.name, baseBranch?.name),
  )

  const svgOverlay = useSvgOverlay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh arrows when branches change
  useEffect(() => {
    svgOverlay.refresh()
  }, [commonAncestor.data, branch, baseBranch])

  const branchHistory = useInfiniteQuery(commitHistoryQuery(path, branch?.name))
  const baseBranchHistory = useInfiniteQuery(
    commitHistoryQuery(path, baseBranch?.name),
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
            path={path}
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
            path={path}
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
            path={path}
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

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { useCheckoutLocalBranch } from '@api/commands'
import type { BranchName } from '@api/models'
import {
  branchesQuery,
  commitHistoryQuery,
  commonAncestorQuery,
  headInfoQuery,
} from '@api/queries'
import { getPaginatedLength } from '@api/utils'
import { SelectInput } from '@lib/SelectInput'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { GraphBaseBranch } from './BaseBranch'
import { GraphBranch } from './Branch'
import { NODE_SIZE } from './Commit'
import { CURVE_SIZE, EDGE_OFFSET, Edges } from './Edges'
import { useCurrentBranch } from './utils'

interface GraphProps {
  path: string
}

const Graph = (props: GraphProps) => {
  const { path } = props
  const branches = useQuery(branchesQuery(path))
  const headInfo = useQuery(headInfoQuery(path))
  const currentBranch = useCurrentBranch(path)
  const [baseBranch, setBaseBranch] = useState<BranchName>()
  const checkout = useCheckoutLocalBranch()

  return (
    <div className={clsx('h-full w-full min-h-0')}>
      <div
        className={clsx(
          'overflow-hidden w-full h-full',
          'grid grid-cols-2 grid-rows-[max-content_1fr] gap-8',
        )}
      >
        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={branches.data?.map((branch) => ({ value: branch })) ?? []}
          value={currentBranch}
          disabled={headInfo.isLoading}
          onValueChange={(newBranch) => checkout(newBranch)}
        />

        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={
            branches.data
              ?.filter((branch) => branch !== currentBranch)
              .map((branch) => ({ value: branch })) ?? []
          }
          value={baseBranch}
          onValueChange={setBaseBranch}
        />

        <SvgOverlay className={clsx('grid col-span-2')} RenderOverlay={Edges}>
          <GraphInner
            {...props}
            branch={currentBranch}
            baseBranch={baseBranch}
          />
        </SvgOverlay>
      </div>
    </div>
  )
}

interface GraphInnerProps extends GraphProps {
  branch: BranchName | undefined
  baseBranch: BranchName | undefined
}

const GraphInner = (props: GraphInnerProps) => {
  const { path, branch, baseBranch } = props
  const ancestor = useQuery(commonAncestorQuery(path, branch, baseBranch))

  const svgOverlay = useSvgOverlay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh arrows when branches change
  useEffect(() => {
    svgOverlay.refresh()
  }, [ancestor.data, branch, baseBranch])

  const branchHistory = useInfiniteQuery(commitHistoryQuery(path, branch))
  const baseBranchHistory = useInfiniteQuery(
    commitHistoryQuery(path, baseBranch),
  )

  const branchLength = Math.min(
    (ancestor.data?.branchDistance ?? Number.POSITIVE_INFINITY) + 1,
    getPaginatedLength(branchHistory),
  )
  const baseLength = getPaginatedLength(baseBranchHistory)

  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
    paddingEnd: CURVE_SIZE * 2,
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
            path={path}
            branch={branch}
            baseBranch={baseBranch}
            ancestorInfo={ancestor.data}
          />
        ) : (
          <p>No branch selected</p>
        )}

        {baseBranch ? (
          <GraphBaseBranch
            virtualizer={virtualizer}
            path={path}
            branch={baseBranch}
            ancestorInfo={ancestor.data}
          />
        ) : (
          <p>No branch selected</p>
        )}
      </div>
    </div>
  )
}

export { Graph, type GraphProps }

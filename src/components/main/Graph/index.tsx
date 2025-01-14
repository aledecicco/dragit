import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import type { BranchName } from '@api/models'
import {
  branchesQuery,
  commitHistoryQuery,
  commonAncestorQuery,
} from '@api/queries'
import { SelectInput } from '@lib/SelectInput'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { CURVE_SIZE, EDGE_OFFSET } from '@main/SvgOverlay/utils'
import { GraphBranch } from './Branch'
import { NODE_SIZE } from './Commit'

interface GraphProps {
  path: string
}

const Graph = (props: GraphProps) => {
  const { path } = props
  const branches = useQuery(branchesQuery(path))
  const [branch, setBranch] = useState<BranchName>()
  const [baseBranch, setBaseBranch] = useState<BranchName>()

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
          value={branch}
          onValueChange={setBranch}
        />

        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={branches.data?.map((branch) => ({ value: branch })) ?? []}
          value={baseBranch}
          onValueChange={setBaseBranch}
        />

        <SvgOverlay className={clsx('grid col-span-2')}>
          <GraphInner {...props} branch={branch} baseBranch={baseBranch} />
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

  const virtualizer = useVirtualizer({
    estimateSize: () => NODE_SIZE,
    gap: CURVE_SIZE * 2 + EDGE_OFFSET * 2,
    getScrollElement: () => svgOverlay.componentRef.current,
    count: Math.max(
      branchHistory.data?.pages.reduce((sum, page) => sum + page.length, 0) ??
        0,
      baseBranchHistory.data?.pages.reduce(
        (sum, page) => sum + page.length,
        0,
      ) ?? 0,
    ),
  })

  return (
    <div
      ref={svgOverlay.componentRef}
      className={clsx('overflow-hidden contain-strict w-full h-full')}
    >
      <div
        className={clsx('relative w-full')}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {branch ? (
          <GraphBranch
            virtualizer={virtualizer}
            path={path}
            branch={branch}
            stopAt={
              baseBranch && ancestor.data
                ? { branch: baseBranch, commit: ancestor.data }
                : undefined
            }
          />
        ) : (
          <p>No branch selected</p>
        )}

        {baseBranch ? (
          <GraphBranch
            virtualizer={virtualizer}
            path={path}
            branch={baseBranch}
            isBase
          />
        ) : (
          <p>No branch selected</p>
        )}
      </div>
    </div>
  )
}

export { Graph, type GraphProps }

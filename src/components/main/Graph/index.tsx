import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { type HTMLProps, forwardRef, useRef, useState } from 'react'

import type { BranchName } from '@api/models'
import { branchesQuery, commonAncestorQuery } from '@api/queries'
import { SelectInput } from '@lib/SelectInput'
import { SvgOverlay, useSvgOverlay } from '@main/SvgOverlay'
import { GraphBranch } from './Branch'

interface GraphProps extends HTMLProps<HTMLDivElement> {
  path: string
}

const Graph = (props: GraphProps) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  return (
    <div className={clsx('h-full w-full min-h-0')}>
      <SvgOverlay canvasRef={canvasRef}>
        <GraphInner ref={canvasRef} {...props} />
      </SvgOverlay>
    </div>
  )
}

const GraphInner = forwardRef<HTMLDivElement, GraphProps>((props, ref) => {
  const { path, ...divProps } = props
  const [branch, setBranch] = useState<BranchName>()
  const [baseBranch, setBaseBranch] = useState<BranchName>()
  const ancestor = useQuery(commonAncestorQuery(path, branch, baseBranch))
  const branches = useQuery(branchesQuery(path))

  const { refresh } = useSvgOverlay()

  return (
    <div
      ref={ref}
      {...divProps}
      className={clsx(
        'grid grid-cols-2 gap-8',
        'overflow-auto w-full h-full',
        divProps.className,
      )}
      onScroll={() => {
        refresh()
      }}
    >
      <div className={clsx('flex flex-col items-center gap-4 p-10')}>
        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={branches.data?.map((branch) => ({ value: branch })) ?? []}
          value={branch}
          onValueChange={setBranch}
        />
        {branch ? (
          <GraphBranch
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
      </div>
      <div className={clsx('flex flex-col items-center gap-4 p-10')}>
        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={branches.data?.map((branch) => ({ value: branch })) ?? []}
          value={baseBranch}
          onValueChange={setBaseBranch}
        />
        {baseBranch ? (
          <GraphBranch path={path} branch={baseBranch} />
        ) : (
          <p>No branch selected</p>
        )}
      </div>
    </div>
  )
})

export { Graph, type GraphProps }

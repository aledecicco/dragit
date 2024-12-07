import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { type HTMLProps, useEffect, useRef, useState } from 'react'
import { ArcherContainer, type ArcherContainerRef } from 'react-archer'

import type { BranchName } from '@api/models'
import { branchesQuery, commonAncestorQuery } from '@api/queries'
import { SelectInput } from '@lib/SelectInput'
import { GraphBranch } from './Branch'

interface GraphProps extends HTMLProps<HTMLDivElement> {
  path: string
}

const Graph = (props: GraphProps) => {
  const { path, ...divProps } = props
  const [branch, setBranch] = useState<BranchName>()
  const [baseBranch, setBaseBranch] = useState<BranchName>()
  const ancestor = useQuery(commonAncestorQuery(path, branch, baseBranch))
  const branches = useQuery(branchesQuery(path))

  const ref = useRef<ArcherContainerRef>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: need an extra refresh after changing branches
  useEffect(() => {
    ref.current?.refreshScreen()
  }, [ref, branch, baseBranch, ancestor.data])

  return (
    <ArcherContainer
      ref={ref}
      lineStyle="curve"
      strokeColor="var(--color-primary-600)"
      strokeWidth={6}
      offset={4}
      startMarker={false}
      endMarker={false}
    >
      <div
        {...divProps}
        className={clsx('flex flex-row gap-8', divProps.className)}
      >
        <div className={clsx('flex flex-col items-center gap-4 p-10')}>
          <SelectInput
            ariaLabel="Branch"
            placeholder="Branch..."
            options={branches.data?.map((branch) => ({ value: branch })) ?? []}
            value={branch}
            onValueChange={setBranch}
          />
          {branch && !ancestor.isFetching ? (
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
          {baseBranch && !ancestor.isFetching ? (
            <GraphBranch path={path} branch={baseBranch} />
          ) : (
            <p>No branch selected</p>
          )}
        </div>
      </div>
    </ArcherContainer>
  )
}

export { Graph, type GraphProps }

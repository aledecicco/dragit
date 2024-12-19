import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { type HTMLProps, useState } from 'react'

import type { BranchName } from '@api/models'
import { branchesQuery, commonAncestorQuery, headInfoQuery } from '@api/queries'
import { SelectInput } from '@lib/SelectInput'
import { SvgOverlay } from '@main/SvgOverlay'
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

  return (
    <SvgOverlay>
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
    </SvgOverlay>
  )
}

export { Graph, type GraphProps }

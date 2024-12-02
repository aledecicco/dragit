import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'

import type { BranchName } from '@api/models'
import { branchesQuery, commonAncestorQuery } from '@api/queries'
import { SelectInput } from '@lib/SelectInput'
import { useState } from 'react'
import { GraphBranch } from './Branch'

interface GraphProps {
  path: string
}

const Graph = (props: GraphProps) => {
  const { path } = props
  const [branch, setBranch] = useState<BranchName>()
  const [baseBranch, setBaseBranch] = useState<BranchName>()
  const ancestor = useQuery(commonAncestorQuery(path, branch, baseBranch))
  const branches = useQuery(branchesQuery(path))

  return (
    <div className={clsx('flex flex-row gap-8')}>
      <div className={clsx('flex flex-col items-center gap-4 p-10')}>
        <SelectInput
          ariaLabel="Branch"
          placeholder="Branch..."
          options={branches.data?.map((branch) => ({ value: branch })) ?? []}
          value={branch}
          onValueChange={setBranch}
        />
        {branch ? (
          <GraphBranch path={path} branch={branch} stopAt={ancestor.data} />
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
}

export { Graph, type GraphProps }

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
  const [otherBranch, setOtherBranch] = useState<BranchName>()
  const ancestor = useQuery(commonAncestorQuery(path, branch, otherBranch))
  const branches = useQuery(branchesQuery(path))

  return (
    <div className={clsx('flex flex-row')}>
      <SelectInput
        ariaLabel="Branch"
        placeholder="Select a branch..."
        options={branches.data?.map((branch) => ({ value: branch })) ?? []}
        value={branch}
        onValueChange={setBranch}
      />
      {branch ? (
        <GraphBranch path={path} branch={branch} stopAt={ancestor.data} />
      ) : (
        <p>No branch selected</p>
      )}
      <SelectInput
        ariaLabel="Branch"
        placeholder="Select a branch..."
        options={branches.data?.map((branch) => ({ value: branch })) ?? []}
        value={otherBranch}
        onValueChange={setOtherBranch}
      />
      {otherBranch ? (
        <GraphBranch path={path} branch={otherBranch} />
      ) : (
        <p>No branch selected</p>
      )}
    </div>
  )
}

export { Graph, type GraphProps }

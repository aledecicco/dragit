import { useQuery } from '@tanstack/react-query'

import type { BranchName } from '@api/models'
import { commonAncestorQuery } from '@api/queries'
import { GraphBranch } from './Branch'

interface GraphProps {
  path: string
  branch?: BranchName
  otherBranch?: BranchName
}

const Graph = (props: GraphProps) => {
  const { path, branch = 'b3', otherBranch = 'main' } = props
  const ancestor = useQuery(commonAncestorQuery(path, branch, otherBranch))

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {branch ? (
        <GraphBranch path={path} branch={branch} stopAt={ancestor.data} />
      ) : (
        <p>No branch selected</p>
      )}
      {otherBranch ? (
        <GraphBranch path={path} branch={otherBranch} />
      ) : (
        <p>No branch selected</p>
      )}
    </div>
  )
}

export { Graph, type GraphProps }

import { useQuery } from '@tanstack/react-query'

import { currentDirQuery } from '@api/queries'
import { CurrentDirectory } from 'components/CurrentDirectory'
import { FileStatuses } from 'components/FileStatuses'
import { CurrentBranch } from 'components/Graph/CurrentBranch'

const App = () => {
  const currentDir = useQuery(currentDirQuery)

  return (
    <div>
      <CurrentDirectory />
      {currentDir.data && (
        <>
          <FileStatuses path={currentDir.data} />
          <CurrentBranch path={currentDir.data} />
        </>
      )}
    </div>
  )
}

export { App }

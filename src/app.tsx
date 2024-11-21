import { useQuery } from '@tanstack/react-query'

import { currentDirQuery } from '@api/queries'
import { CurrentDirectory } from '@main/CurrentDirectory'
import { FileStatuses } from '@main/FileStatuses'
import { Graph } from '@main/Graph'

const App = () => {
  const currentDir = useQuery(currentDirQuery)

  return (
    <div>
      <CurrentDirectory />
      {currentDir.data && (
        <>
          <FileStatuses path={currentDir.data} />
          <Graph path={currentDir.data} />
        </>
      )}
    </div>
  )
}

export { App }

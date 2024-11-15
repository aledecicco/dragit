import { match } from 'ts-pattern'

import { useAddToIndex } from '@api/commands'
import type { UnmergedFile } from '@api/models'

interface UnmergedFileStatusItemProps {
  file: UnmergedFile
}

const UnmergedFileStatusItem = (props: UnmergedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <div>
      <p>{file.path}</p>
      <p>
        {match(file)
          .with({ mergeStatus: 'addedByThem' }, () => 'File created by them')
          .with({ mergeStatus: 'addedByUs' }, () => 'File created by us')
          .with({ mergeStatus: 'bothAdded' }, () => 'File created by both')
          .with({ mergeStatus: 'bothDeleted' }, () => 'File deleted by both')
          .with({ mergeStatus: 'bothModified' }, () => 'File modified by both')
          .with({ mergeStatus: 'deletedByThem' }, () => 'File deleted by them')
          .with({ mergeStatus: 'deletedByUs' }, () => 'File deleted by us')
          .exhaustive()}
      </p>
      <button
        type="button"
        aria-label="Mark conflict as resolved"
        onClick={() => stage([file.path])}
      >
        Mark as resolved
      </button>
    </div>
  )
}

export { UnmergedFileStatusItem, type UnmergedFileStatusItemProps }

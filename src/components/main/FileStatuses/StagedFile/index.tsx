import { match } from 'ts-pattern'

import { useRemoveFromIndex } from '@api/commands'
import type { StagedFile } from '@api/models'

interface StagedFileStatusItemProps {
  file: StagedFile
}

const StagedFileStatusItem = (props: StagedFileStatusItemProps) => {
  const { file } = props
  const unstage = useRemoveFromIndex()

  return (
    <div>
      <p>{file.path}</p>
      <p>
        {match(file)
          .with({ staged: 'added' }, () => 'File created')
          .with({ staged: 'deleted' }, () => 'File deleted')
          .with({ staged: 'typeChanged' }, () => 'File type changed')
          .with({ staged: 'modified' }, () => 'File contents modified')
          .with({ staged: 'copied' }, (file) => `File copied from ${file.from}`)
          .with(
            { staged: 'renamed' },
            (file) => `File renamed from ${file.from}`,
          )
          .exhaustive()}
      </p>
      <button
        type="button"
        aria-label="Unstage file"
        onClick={() => unstage([file.path])}
      >
        Unstage
      </button>
    </div>
  )
}

export { StagedFileStatusItem, type StagedFileStatusItemProps }

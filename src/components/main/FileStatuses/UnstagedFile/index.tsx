import { match } from 'ts-pattern'

import { useAddToIndex } from '@api/commands'
import type { UnstagedFile } from '@api/models'

interface UnstagedFileStatusItemProps {
  file: UnstagedFile
}

const UnstagedFileStatusItem = (props: UnstagedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <div>
      <p>{file.path}</p>
      <p>
        {match(file)
          .with({ unstaged: 'added' }, () => 'File created')
          .with({ unstaged: 'deleted' }, () => 'File deleted')
          .with({ unstaged: 'typeChanged' }, () => 'File type changed')
          .with({ unstaged: 'modified' }, () => 'File contents modified')
          .exhaustive()}
      </p>
      <button
        type="button"
        aria-label="Stage file"
        onClick={() => stage([file.path])}
      >
        Stage
      </button>
    </div>
  )
}

export { UnstagedFileStatusItem, type UnstagedFileStatusItemProps }

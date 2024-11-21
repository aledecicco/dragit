import { useAddToIndex } from '@api/commands'
import type { UntrackedFile } from '@api/models'

interface UntrackedFileStatusItemProps {
  file: UntrackedFile
}

const UntrackedFileStatusItem = (props: UntrackedFileStatusItemProps) => {
  const { file } = props
  const stage = useAddToIndex()

  return (
    <div>
      <p>{file.path}</p>
      <p>File untracked</p>
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

export { UntrackedFileStatusItem, type UntrackedFileStatusItemProps }

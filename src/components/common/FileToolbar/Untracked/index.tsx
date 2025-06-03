import { IconPlus } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { UntrackedFileInfo } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface UntrackedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: UntrackedFileInfo
}

/**
 * The common set of tools for untracked files.
 */
const UntrackedFileToolbar = (props: UntrackedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const stage = useAddToIndex()

  const tools = useMemo(() => {
    return [
      {
        action: {
          run: () => stage.mutateAsync({ files: [file.path] }),
          label: {
            idle: 'Stage',
            running: 'Staging',
            success: 'Staged',
            error: 'Failed',
          },
          Glyph: IconPlus,
        },
      },
    ]
  }, [file.path, stage.mutateAsync])

  return <Toolbar size="sm" tools={tools} compact {...toolbarProps} />
}

export { UntrackedFileToolbar }

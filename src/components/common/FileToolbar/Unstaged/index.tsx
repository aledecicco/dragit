import { IconPlus } from '@tabler/icons-react'
import { memo, useMemo } from 'react'

import type { UnstagedFileInfo } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface UnstagedFileToolbarProps extends Partial<ToolbarProps> {
  /**
   * The file to operate on.
   */
  file: UnstagedFileInfo
}

/**
 * The common set of tools for unstaged files.
 */
const UnstagedFileToolbar = memo((props: UnstagedFileToolbarProps) => {
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
})

export { UnstagedFileToolbar }

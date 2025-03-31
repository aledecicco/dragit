import { IconPlus } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { UnstagedFileInfo } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface UnstagedFileToolbarProps extends Partial<ToolbarProps> {
  file: UnstagedFileInfo
}

const UnstagedFileToolbar = (props: UnstagedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const stage = useAddToIndex()

  const tools = useMemo(() => {
    return [
      {
        Glyph: IconPlus,
        label: 'Stage',
        action: () => stage.mutate({ files: [file.path] }),
        disabled: stage.isPending,
      },
    ]
  }, [file.path, stage.mutate, stage.isPending])

  return <Toolbar size="sm" tools={tools} {...toolbarProps} />
}

export { UnstagedFileToolbar }

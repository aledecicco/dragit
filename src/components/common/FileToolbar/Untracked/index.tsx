import { IconPlus } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { UntrackedFileInfo } from '@api/models'
import { useAddToIndex } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface UntrackedFileToolbarProps extends Partial<ToolbarProps> {
  file: UntrackedFileInfo
}

const UntrackedFileToolbar = (props: UntrackedFileToolbarProps) => {
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

export { UntrackedFileToolbar }

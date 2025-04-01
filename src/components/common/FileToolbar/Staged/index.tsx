import { IconMinus } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { StagedFileInfo } from '@api/models'
import { useRemoveFromIndex } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface StagedFileToolbarProps extends Partial<ToolbarProps> {
  file: StagedFileInfo
}

const StagedFileToolbar = (props: StagedFileToolbarProps) => {
  const { file, ...toolbarProps } = props
  const unstage = useRemoveFromIndex()

  const tools = useMemo(() => {
    return [
      {
        Glyph: IconMinus,
        label: 'Unstage',
        action: () => {
          unstage.mutateAsync({ files: [file.path] })
        },
        disabled: unstage.isPending,
      },
    ]
  }, [file.path, unstage.mutateAsync, unstage.isPending])

  return <Toolbar size="sm" tools={tools} {...toolbarProps} />
}

export { StagedFileToolbar }

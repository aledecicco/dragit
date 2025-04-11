import { IconPackageExport, IconTrash } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { StashInfo } from '@api/models'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface StashToolbarProps extends Partial<ToolbarProps> {
  stash: StashInfo
}

const StashToolbar = (props: StashToolbarProps) => {
  const { stash, ...toolbarProps } = props

  const tools = useMemo(() => {
    return [
      {
        Glyph: IconPackageExport,
        label: 'Pop',
        action: async () => {},
        disabled: false,
      },
      {
        Glyph: IconTrash,
        label: 'Delete',
        action: async () => {},
        disabled: false,
      },
    ]
  }, [])

  return <Toolbar tools={tools} {...toolbarProps} />
}

export { StashToolbar, type StashToolbarProps }

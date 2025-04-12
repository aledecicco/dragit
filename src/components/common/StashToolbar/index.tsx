import { IconPackageExport, IconTrash } from '@tabler/icons-react'
import { useMemo } from 'react'

import type { StashInfo } from '@api/models'
import { useApplyStash, useDiscardStash } from '@api/mutations'
import { Toolbar, type ToolbarProps } from '@ui/Toolbar'

interface StashToolbarProps extends Partial<ToolbarProps> {
  stash: StashInfo
}

const StashToolbar = (props: StashToolbarProps) => {
  const { stash, ...toolbarProps } = props

  const apply = useApplyStash()
  const discard = useDiscardStash()

  const tools = useMemo(() => {
    return [
      {
        Glyph: IconPackageExport,
        label: 'Pop',
        action: () => {
          apply.mutateAsync({ stashId: stash.id })
        },
        disabled: apply.isPending,
      },
      {
        Glyph: IconTrash,
        label: 'Discard',
        action: () => {
          discard.mutateAsync({ stashId: stash.id })
        },
        disabled: discard.isPending,
      },
    ]
  }, [
    stash.id,
    apply.mutateAsync,
    apply.isPending,
    discard.mutateAsync,
    discard.isPending,
  ])

  return <Toolbar tools={tools} {...toolbarProps} />
}

export { StashToolbar, type StashToolbarProps }

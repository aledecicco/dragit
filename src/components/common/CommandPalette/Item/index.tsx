import * as Ariakit from '@ariakit/react'

import type { Flow } from '@/interactions/flows'
import { ShortcutKey } from '@/lib/Shortcuts/Key'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { hideDialog } from '@/state/dialogs'
import { Marquee } from '@/ui/Marquee'
import { cn, propsWithCn } from '@/utils/styles'

import { COMMAND_PALETTE_DIALOG_KEY, CommandPalette } from '..'

interface CommandPaletteItemProps extends Ariakit.CompositeItemProps {
  /**
   * The flow that this item triggers.
   */
  flow: Flow
}

/**
 * A single item in a {@link CommandPalette}
 */
const CommandPaletteItem = (props: CommandPaletteItemProps) => {
  const { flow, ...itemProps } = props

  const trigger = () => {
    flow.execute()
    hideDialog(COMMAND_PALETTE_DIALOG_KEY)
  }

  useShortcutBinding(
    flow.key,
    () => {
      trigger()
    },
    'global',
  )

  return (
    <Ariakit.CompositeItem
      {...propsWithCn(
        itemProps,
        'grid grid-cols-[max-content_max-content_1fr] w-full overflow-hidden',
        'items-center gap-3 p-2 rounded-md',
        'transition-colors duration-150',
        'focus:bg-dark-500/80 hover:bg-dark-500/80',
      )}
      onClick={(e) => {
        itemProps.onClick?.(e)
        trigger()
      }}
    >
      <ShortcutKey shortcutKey={flow.key} size="md" />
      <span className={cn('text-sm font-medium')}>{flow.label}</span>
      <Marquee reverse={false} className={cn('text-sm text-light-950')}>
        {flow.description}
      </Marquee>{' '}
    </Ariakit.CompositeItem>
  )
}

export { CommandPaletteItem, type CommandPaletteItemProps }

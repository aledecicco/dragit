import * as Ariakit from '@ariakit/react'
import { useEffectOnce } from 'react-use'

import type { Flow } from '@/interactions/flows'
import { useQuickCommitFlow, useQuickStashFlow } from '@/interactions/flows'
import { ShortcutKey } from '@/lib/Shortcuts/Key'
import { hideDialog, showDialog } from '@/state/dialogs'
import { Dialog } from '@/ui/Dialog'
import { cn } from '@/utils/styles'

const COMMAND_PALETTE_DIALOG_KEY = 'command_palette'

/**
 * Command palette for all the quick access flows defined in the app.
 */
const CommandPalette = () => {
  const quickCommit = useQuickCommitFlow()
  const quickStash = useQuickStashFlow()

  const flows: Flow[] = [quickCommit, quickStash]

  const trigger = (flow: Flow) => {
    hideDialog(COMMAND_PALETTE_DIALOG_KEY)
    flow.execute()
  }

  useEffectOnce(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const flow = flows.find((f) => f.key === e.key.toLowerCase())
      if (flow) {
        e.stopPropagation()
        e.preventDefault()

        trigger(flow)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <Dialog
      dialogKey={COMMAND_PALETTE_DIALOG_KEY}
      showClose={false}
      className={cn('p-3')}
    >
      <Ariakit.CompositeProvider>
        <Ariakit.Composite
          render={<div className={cn('flex flex-col gap-1')} />}
        >
          {flows.map((flow) => (
            <Ariakit.CompositeItem
              key={flow.id}
              onClick={() => trigger(flow)}
              className={cn(
                'flex flex-row items-center gap-3 w-full p-2 rounded-md',
                'focus:bg-dark-500/80 hover:bg-dark-500/80',
              )}
            >
              <ShortcutKey shortcutKey={flow.key} size="md" />
              <span className="text-sm font-medium">{flow.label}</span>
              <span className="text-sm text-light-950">{flow.description}</span>
            </Ariakit.CompositeItem>
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </Dialog>
  )
}

const showCommandPalette = () => {
  showDialog(COMMAND_PALETTE_DIALOG_KEY, CommandPalette, {})
}

export { showCommandPalette }

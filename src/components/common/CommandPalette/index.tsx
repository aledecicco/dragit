import * as Ariakit from '@ariakit/react'

import type { Flow } from '@/interactions/flows'
import {
  useQuickAmendFlow,
  useQuickBranchUpdateFlow,
  useQuickCommitFlow,
  useQuickStashFlow,
} from '@/interactions/flows'
import { showDialog } from '@/state/dialogs'
import { Dialog } from '@/ui/Dialog'
import { cn } from '@/utils/styles'

import { CommandPaletteItem } from './Item'

const COMMAND_PALETTE_DIALOG_KEY = 'command_palette'

/**
 * Command palette for all the quick access flows defined in the app.
 */
const CommandPalette = () => {
  const quickCommit = useQuickCommitFlow()
  const quickStash = useQuickStashFlow()
  const quickAmend = useQuickAmendFlow()
  const quickBranchUpdate = useQuickBranchUpdateFlow()

  const flows: Flow[] = [quickCommit, quickStash, quickAmend, quickBranchUpdate]

  return (
    <Dialog
      dialogKey={COMMAND_PALETTE_DIALOG_KEY}
      showClose={false}
      className={cn('p-3 grid-cols-[600px]')}
    >
      <Ariakit.CompositeProvider focusLoop>
        <Ariakit.Composite
          render={<div className={cn('flex flex-col gap-1')} />}
        >
          {flows.map((flow) => (
            <CommandPaletteItem key={flow.id} flow={flow} />
          ))}
        </Ariakit.Composite>
      </Ariakit.CompositeProvider>
    </Dialog>
  )
}

const showCommandPalette = () => {
  showDialog(COMMAND_PALETTE_DIALOG_KEY, CommandPalette, {})
}

export { CommandPalette, showCommandPalette, COMMAND_PALETTE_DIALOG_KEY }

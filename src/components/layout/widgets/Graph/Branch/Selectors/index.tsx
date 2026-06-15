import { useSelectStore } from '@ariakit/react'
import { IconGitBranch } from '@tabler/icons-react'

import { useSwitchBranches } from '@/api/mutations/checkout'
import { ActionButton } from '@/lib/ActionButton'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import { ShortcutIndicator } from '@/lib/Shortcuts/Indicator'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { useSelectedBase } from '@/state/branches'
import { useSettings } from '@/state/storage'
import { useBranch, useHeadReference } from '@/utils/repository'
import { cn } from '@/utils/styles'

import { BaseBranchSelector } from './Base'
import { CurrentBranchSelector } from './Current'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const currentReference = useHeadReference()
  const currentBranch = useBranch(currentReference)
  const baseReference = useSelectedBase(currentReference)
  const baseBranch = useBranch(baseReference)

  const switchBranches = useSwitchBranches()

  const settings = useSettings()

  const currentSelector = useSelectStore({
    defaultValue: '',
  })
  const baseSelector = useSelectStore({
    defaultValue: '',
  })

  useShortcutBinding(settings.checkoutShortcut, () => {
    baseSelector.setOpen(false)

    if (!currentSelector.getState().open) {
      currentSelector.getState().disclosureElement?.focus()
      currentSelector.setOpen(true)
    }
  })
  useShortcutBinding(settings.changeBaseShortcut, () => {
    currentSelector.setOpen(false)

    if (!baseSelector.getState().open) {
      baseSelector.getState().disclosureElement?.focus()
      baseSelector.setOpen(true)
    }
  })

  return (
    <>
      <ShortcutIndicator
        hotkey={settings.checkoutShortcut}
        className={cn('w-full max-w-65 col-start-1 row-start-1')}
      >
        <Draggable
          dragPayload={
            currentBranch
              ? {
                  type: 'branch',
                  dragged: currentBranch,
                  label: currentBranch.name,
                  Glyph: IconGitBranch,
                }
              : undefined
          }
        >
          <CurrentBranchSelector
            providerProps={{
              store: currentSelector,
            }}
          />
        </Draggable>
      </ShortcutIndicator>

      <ActionButton
        action={switchBranches}
        className={cn('mx-1 col-start-2 row-start-1')}
        variant="filled"
        status="neutral"
        disabled={!currentReference || !baseReference}
        size="md"
        round
        compact
      />

      <ShortcutIndicator
        hotkey={settings.changeBaseShortcut}
        className={cn('w-full max-w-65 col-start-3 row-start-1')}
      >
        <Draggable
          dragPayload={
            baseBranch
              ? {
                  type: 'branch',
                  dragged: baseBranch,
                  label: baseBranch.name,
                  Glyph: IconGitBranch,
                }
              : undefined
          }
        >
          <BaseBranchSelector
            providerProps={{
              store: baseSelector,
            }}
          />
        </Draggable>
      </ShortcutIndicator>
    </>
  )
}

export { BranchSelectors }

import { useRef } from 'react'
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
  const currentBranchRef = useRef<HTMLButtonElement>(null)
  const baseBranchRef = useRef<HTMLButtonElement>(null)

  useShortcutBinding(settings.checkoutShortcut, () => {
    currentBranchRef.current?.focus()
    currentBranchRef.current?.click()
  })
  useShortcutBinding(settings.changeBaseShortcut, () => {
    baseBranchRef.current?.focus()
    baseBranchRef.current?.click()
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
          <CurrentBranchSelector ref={currentBranchRef} />
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
          <BaseBranchSelector ref={baseBranchRef} />
        </Draggable>
      </ShortcutIndicator>
    </>
  )
}

export { BranchSelectors }

import { useSelectStore } from '@ariakit/react'
import { IconGitBranch, IconGitCommit, IconTag } from '@tabler/icons-react'
import { match } from 'ts-pattern'

import type { Reference } from '@/api/models'
import { useSwitchBranchesInteraction } from '@/interactions/checkout'
import { compareTwoInteraction } from '@/interactions/view'
import { Draggable } from '@/lib/DragAndDrop/Draggable'
import type { DragPayload } from '@/lib/DragAndDrop/utils'
import { ShortcutIndicator } from '@/lib/Shortcuts/Indicator'
import { useShortcutBinding } from '@/lib/Shortcuts/utils'
import { useSelectedBase } from '@/state/branches'
import { useSettings } from '@/state/storage'
import { Toolbar } from '@/ui/Toolbar'
import { ToolbarItem } from '@/ui/Toolbar/Item'
import { useHeadReference } from '@/utils/repository'
import { cn } from '@/utils/styles'

import { BaseBranchSelector } from './Base'
import { CurrentBranchSelector } from './Current'

/**
 * Controls to select the main branch and the base branch.
 */
const BranchSelectors = () => {
  const currentReference = useHeadReference()
  const baseReference = useSelectedBase(currentReference)

  const switchBranches = useSwitchBranchesInteraction()

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
        <Draggable dragPayload={getReferenceDragPayload(currentReference)}>
          <CurrentBranchSelector
            providerProps={{
              store: currentSelector,
            }}
          />
        </Draggable>
      </ShortcutIndicator>

      <Toolbar className={cn('mx-1 col-start-2 row-start-1')}>
        <ToolbarItem
          {...switchBranches}
          className={cn(currentReference && baseReference && 'pl-3 pr-2')}
          variant="filled"
          status="neutral"
          disabled={!currentReference || !baseReference}
          size="md"
          round
          compact
        />

        {currentReference && baseReference && (
          <ToolbarItem
            {...compareTwoInteraction(currentReference, baseReference)}
            className={cn('pl-2 pr-3')}
            variant="filled"
            status="neutral"
            size="md"
            round
            compact
          />
        )}
      </Toolbar>

      <ShortcutIndicator
        hotkey={settings.changeBaseShortcut}
        className={cn('w-full max-w-65 col-start-3 row-start-1')}
      >
        <Draggable dragPayload={getReferenceDragPayload(baseReference)}>
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

/**
 * Builds the drag payload for a reference.
 */
const getReferenceDragPayload = (
  reference: Reference | undefined,
): DragPayload | undefined => {
  if (!reference) {
    return undefined
  }

  return match<Reference>(reference)
    .returnType<DragPayload>()
    .with({ type: 'branch' }, ({ refName }) => ({
      type: 'branch',
      dragged: refName,
      label: refName,
      Glyph: IconGitBranch,
    }))
    .with({ type: 'commit' }, ({ refName }) => ({
      type: 'commit',
      dragged: refName,
      label: `#${refName}`,
      Glyph: IconGitCommit,
    }))
    .with({ type: 'tag' }, ({ refName }) => ({
      type: 'tag',
      dragged: refName,
      label: refName,
      Glyph: IconTag,
    }))
    .exhaustive()
}

export { BranchSelectors }

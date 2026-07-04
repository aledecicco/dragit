import type { InteractionEntry } from '@/lib/Interactive/types'
import { type AnyAction, useActiveAction } from '@/state/actions'

import type { AnyInteraction, Interaction } from '.'

/**
 * A hook that facilitates choosing which action to track for an action button.
 *
 * @param action - The main action to use as default.
 * @param alternatives - A list of alternative actions to track.
 */
const useActionButtonAction = (
  action: AnyAction,
  alternatives: AnyAction[] | undefined,
): AnyAction => {
  const actions = [action, ...(alternatives ?? [])]
  const activeAction = useActiveAction(actions)

  return activeAction ?? action
}

/**
 * Utility to safely type an interaction.
 *
 * @param interaction - The interaction to type.
 */
const interaction = <T>(interaction: Interaction<T>): AnyInteraction => {
  return interaction as Interaction<never>
}

/**
 * Utility to group interactions together.
 *
 * @param interactions - The interactions to group.
 */
const group = (
  ...interactions: (InteractionEntry | InteractionEntry[] | undefined | false)[]
): InteractionEntry[] => {
  return interactions.flatMap((interaction) => {
    if (Array.isArray(interaction)) {
      return interaction
    }

    if (interaction) {
      return [interaction]
    }

    return []
  })
}

export { useActionButtonAction, interaction, group }

import { type AnyAction, useActiveAction } from '@/context/actions'

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

export { useActionButtonAction, interaction }

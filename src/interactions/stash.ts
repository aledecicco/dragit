import type { NotStagedFile, StashInfo } from '@/api/models'
import { useMakeApplyStash } from '@/api/mutations/applyStash'
import {
  useDiscardStashes,
  useMakeDiscardStash,
} from '@/api/mutations/discardStashes'
import { useStashAll, useStashFiles } from '@/api/mutations/saveStash'
import { requestStashParams } from '@/common/StashDialog'
import { group, interaction } from '@/lib/ActionButton/utils'
import { getSettings } from '@/state/storage'
import { pluralize } from '@/utils/string'

import { viewStashInteraction } from './view'

export const useDiscardStashInteraction = (stash: StashInfo) => {
  const discard = useMakeDiscardStash()(stash)

  return interaction({
    action: discard,
    isDangerous: true,
    details: `discard stash #${stash.stashNumber}`,
  })
}

export const useApplySomeStashInteraction = () => {
  const apply = useMakeApplyStash()

  return (stash: StashInfo) =>
    interaction({
      action: apply(stash),
      details: `apply stash #${stash.stashNumber}`,
    })
}

export const useApplyStashInteraction = (stash: StashInfo) => {
  const applySome = useApplySomeStashInteraction()

  return applySome(stash)
}

export const useSingleStashInteractions = (stash: StashInfo) => {
  const view = viewStashInteraction(stash)
  const apply = useApplyStashInteraction(stash)
  const discard = useDiscardStashInteraction(stash)

  return [group(view), group(apply, discard)]
}

export const useStashFilesInteraction = () => {
  const stash = useStashFiles()

  return (files: NotStagedFile[]) =>
    interaction({
      action: stash,
      argsRequester: async () => {
        const { askForStashMessage } = getSettings()
        const message = askForStashMessage
          ? (await requestStashParams()).message
          : null

        return { files, message }
      },
      details: `stash ${pluralize('file', files.length, true)}`,
    })
}

export const useStashAllInteraction = () => {
  const stashAll = useStashAll()

  return interaction({
    action: stashAll,
    argsRequester: async () => {
      const { askForStashMessage } = getSettings()
      const message = askForStashMessage
        ? (await requestStashParams()).message
        : null

      return { message }
    },
    details: 'stash all changes',
  })
}

export const useDiscardStashesInteraction = () => {
  const discard = useDiscardStashes()

  return (stashes: StashInfo[]) =>
    interaction({
      action: discard,
      argsRequester: () => stashes,
      isDangerous: true,
      details: `discard ${pluralize('stash', stashes.length, true, 'stashes')}`,
    })
}

export const useGetStashesListInteractions = () => {
  const discardStashes = useDiscardStashesInteraction()

  return (stashes: StashInfo[]) => [group(discardStashes(stashes))]
}

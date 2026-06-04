import { IconZoom } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'

import type { Action } from '@/state/actions'

import { availableUpdateQueryKey } from '../queries/availableUpdate'

const checkUpdatesKey = {
  key: 'check_updates',
} as const

const checkUpdatesMutation = mutationOptions({
  mutationKey: [checkUpdatesKey],
  mutationFn: (_, context) => {
    return context.client.refetchQueries({
      queryKey: [availableUpdateQueryKey],
    })
  },
  networkMode: 'online',
})

const useCheckUpdates = (): Action => {
  const checkUpdates = useMutation(checkUpdatesMutation)

  return {
    id: { key: 'check_updates' },
    run: async () => {
      await checkUpdates.mutateAsync()
    },
    label: {
      idle: 'Check for updates',
      running: 'Checking for updates',
      success: 'Updates checked',
      error: 'Failed to check',
    },
    Glyph: IconZoom,
  }
}

export { useCheckUpdates }

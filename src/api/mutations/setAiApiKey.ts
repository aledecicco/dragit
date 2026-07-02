import { IconAiGateway } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import { hasAiApiKeyQueryKey } from '../queries/hasAiApiKey'

interface SetAiApiKeyArgs {
  key: string
}

const setAiApiKeyKey = { key: 'set_ai_api_key' } as const

const setAiApiKeyMutation = mutationOptions({
  mutationKey: [setAiApiKeyKey],
  mutationFn: async (args: SetAiApiKeyArgs, context) => {
    await invoke('set_ai_api_key', { ...args })

    await context.client.invalidateQueries({
      queryKey: [hasAiApiKeyQueryKey],
    })
  },
  networkMode: 'always',
})

const useSetAiApiKey = (): Action<string> => {
  const setAiApiKey = useMutation(setAiApiKeyMutation)

  return {
    id: { key: 'set_ai_api_key' },
    run: async (key) => {
      await setAiApiKey.mutateAsync({ key })
    },
    label: {
      idle: 'Save key',
      running: 'Saving key',
      success: 'Key saved',
      error: 'Failed to save',
    },
    Glyph: IconAiGateway,
  }
}

export {
  useSetAiApiKey,
  setAiApiKeyKey,
  setAiApiKeyMutation,
  type SetAiApiKeyArgs,
}

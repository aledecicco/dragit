import { IconDeviceFloppy } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/state/actions'

import type { Settings } from '../models'

interface SetSettingsArgs {
  settings: Partial<Settings>
}

const setSettingsKey = { key: 'set_settings' } as const

const setSettingsMutation = mutationOptions({
  mutationKey: [setSettingsKey],
  mutationFn: (args: SetSettingsArgs) => {
    return invoke('set_settings', { ...args })
  },
  networkMode: 'always',
})

const useSetSettings = (): Action<Partial<Settings>> => {
  const setSettings = useMutation(setSettingsMutation)

  return {
    id: { key: 'set_settings' },
    run: async (settings) => {
      await setSettings.mutateAsync({ settings })
    },
    label: {
      idle: 'Save settings',
      running: 'Saving settings',
      success: 'Settings saved',
      error: 'Failed to save settings',
    },
    Glyph: IconDeviceFloppy,
  }
}

export {
  useSetSettings,
  setSettingsKey,
  setSettingsMutation,
  type SetSettingsArgs,
}

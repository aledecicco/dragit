import { IconDeviceFloppy } from '@tabler/icons-react'
import { mutationOptions, useMutation } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

import type { Action } from '@/context/actions'

import type { Settings } from '../models'

interface SetSettingsArgs {
  settings: Settings
}

const setSettingsKey = ['set_settings'] as const

const setSettingsMutation = mutationOptions({
  mutationKey: setSettingsKey,
  mutationFn: (args: SetSettingsArgs) => {
    return invoke('set_settings', { ...args })
  },
  networkMode: 'always',
})

const useSaveSettings = (): Action<Settings> => {
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
  useSaveSettings,
  setSettingsKey,
  setSettingsMutation,
  type SetSettingsArgs,
}
